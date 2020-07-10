const mongoose = require('mongoose');
// const mongoose = require('mongoose').set('debug', true);
require('mongoose-double')(mongoose);
const email = require('./send_email');
const https = require('https');
const qs = require('qs');
const key = require('./key');
// The database part
// const dbName = 'ggirls';
// use test database first
const dbName = 'test';

const url = key.url;
console.log(url);

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});

const SchemaTypes = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    email: String,
    home: {type:SchemaTypes.ObjectId, ref:'places'},
    work: {type:SchemaTypes.ObjectId, ref:'places'},
    fav_places : [{fav_place:{type:SchemaTypes.ObjectId, ref:'places'}}],
    vis_places:[{
        vis_place:{type:SchemaTypes.ObjectId, ref:'places'},
        vis_date:{type: Date, default: Date.now}
    }],
    contact_email: String
})

const placeSchema = new mongoose.Schema({
    mapID:String,
    status:String,
    mapName:String,
    geometry:{
        lat: SchemaTypes.Double,
        lng: SchemaTypes.Double
    },
    flag: {type:Boolean, default:false},
    cases: [{case:{type:SchemaTypes.ObjectId, ref:'cases'}}],
    types: [{ type: String }]
})

const caseSchema = new mongoose.Schema({
    case_id: String,
    place_and_date:[{
        place: {type:SchemaTypes.ObjectId, ref:'places'},
        start_date: { type: Date, default: Date.now },
        end_date: { type: Date, default: Date.now }
    }]
})
const User = mongoose.model('users',userSchema);
const Place = mongoose.model('places',placeSchema);
const Case = mongoose.model('cases',caseSchema)

mongoose.set('useFindAndModify', false);

async function getUser(email){
    return new Promise(async (resolve,reject) => {
        let user = new User({email:email,contact_email:email});
        let userID = null;
        // find user
        await User.findOne({email:email},(err,docs)=>{
            if(err) reject(err);
            //If user doesn't exist
            if(docs===null || docs.length===0){
                 user.save((err)=>{
                    if (err) reject(err);
                });
                userID = user;
            } else {
                userID = docs;
            }
        }).then(()=>{
            resolve(userID);
        });
    });
}

async function setEmail(userID, email){
    return new Promise(async (resolve,reject) => {
        let doc =  await User.findOneAndUpdate({_id:userID},{"contact_email":email});
        resolve(doc["contact_email"]);
    });
}

async function getPlaceByID(id){
    return new Promise(async (resolve,reject) => {
        await Place.findOne({_id: id}, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function getUserByID(id){
    return new Promise(async (resolve,reject) => {
        await User.findOne({_id: id}, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function getCaseByID(id){
    return new Promise(async (resolve,reject) => {
        await Case.findOne({_id: id}, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function searchPlace(input){
    var query = {
        key:key.placekey,
        input:input,
        inputtype:"textquery",
        fields:"geometry,name,place_id,types"
    }
    var options = {
        host: 'maps.googleapis.com',
        path:'/maps/api/place/findplacefromtext/json?'+qs.stringify(query),
        method: 'GET'
    }
    var body = null;
    var json = {};
    return new Promise((resolve, reject) => {
        var req = https.get(options, function(res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            // Buffer the body entirely for processing as a whole.
            var bodyChunks = [];
            res.on('data', function(chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            }).on('end', function() {
                body = Buffer.concat(bodyChunks);
                var tmp = body.toString('utf8');
                var tmp = JSON.parse(tmp);
                if(tmp['status']==='ZERO_RESULTS'){
                    json["status"] = 'ZERO_RESULTS';
                }else{
                    json["status"] = tmp['status'];
                    tmp = tmp["candidates"][0];
                    json["mapName"] = tmp["name"];
                    json["mapID"] = tmp["place_id"];
                    json["geometry"] = tmp["geometry"]["location"];
                    json["types"] = tmp["types"];
                }
                resolve(json);
            })
        });
        req.on('error', function(e) {
            reject(e);
        });
    });
}

// Search all places by text search API (like wellcome, blabla).
function textSearch(input){
    var query = {
        key:key.placekey,
        query:input+" in Hong Kong",
        // region:"hk",
    }
    var options = {
        host: 'maps.googleapis.com',
        path:'/maps/api/place/textsearch/json?'+qs.stringify(query),
        method: 'GET'
    }
    var body = null;
    https.get(options,  function(res) {
        // console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        res.on('data', function(chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
        }).on('end', function() {
            body = Buffer.concat(bodyChunks);
            var tmp = body.toString('utf8');
            tmp = JSON.parse(tmp);
            for (var item in tmp["results"]){
                // console.log(tmp["results"][item]);
                var json = {};
                json["mapID"] = tmp["results"][item]["place_id"];
                json["mapName"] = tmp["results"][item]["name"];
                json["status"] = tmp["status"];
                json["geometry"] = tmp["results"][item]["geometry"]["location"];
                json["types"] = tmp["results"][item]["types"];
                savePlace(json);
            }
        });
    });
}

async function findPlace(input){
    return new Promise(async (resolve,reject) => {
        var place = 'None';
        await Place.find({mapName:input}, (err,docs) =>{
            if(err) reject(err);
            console.log("Find place in database");
            place = docs;
        }).then(()=>{
            if (place.length===0) {
                searchPlace(input)
                    .then(x=>savePlace(x))
                    .then(x=>{
                    console.log("Find place in API");
                    resolve([x]);
                    })
                    .catch(e=>{
                        console.log("Err: ",e);
                        reject(e);
                });
                } else {
                    resolve(place);
                }
            });
    });
};

async function savePlace(place){
    return new Promise(async (resolve,reject) =>{
        let place_res = null;
        await Place.findOne({mapID: place["mapID"]},(err,docs)=>{
            if(err) reject(err);
            if(docs===null || docs.length===0){
                place_res = new Place(place);
                place_res.save(err=>{
                    if (err) reject(err);
                });
            } else {
                place_res = docs;
            }
        }).then(()=>{
            resolve(place_res);
        });
    });
}

// type
// 1 -> home
// 2 -> work
// 3 -> fav places
// 4 -> visited places (have day)

async function setPlace(userID,placeID,type,date=null){
    return new Promise(async (resolve,reject) =>{
        let result = {
            n:0,
            nModified:0
        };
        if(type===1){
           const res = await User.updateOne({_id:userID},{home:placeID});
           result["n"] = res.n;
           result["nModified"] = res.nModified;
           resolve(result);
        }
        if(type===2){
            const res = await User.updateOne({_id:userID},{work:placeID});
            result["n"] = res.n;
            result["nModified"] = res.nModified;
            resolve(result);
        }
        if(type===3){
            let item = {fav_place:placeID};
            User.findOne({_id:userID,"fav_places.fav_place":placeID},async (err,docs)=>{
                if(docs===null || docs.length==0){
                    const res = await User.updateOne({_id:userID},{$addToSet:{fav_places:item}});
                    result["n"] = res.n;
                    result["nModified"] = res.nModified;
                } else {
                    result["n"] = 1;
                    result["nModified"] = 0;
                }
                resolve(result);
            });
        }
        if(type===4){
            let item = {vis_place:placeID,vis_date:date};
            User.findOne({_id:userID,"vis_places.vis_place":placeID,"vis_places.vis_date":date},async (err,docs)=>{
                if(docs===null || docs.length===0){
                    const res = await User.updateOne({_id:userID},{$addToSet:{vis_places:item}});
                    result["n"] = res.n;
                    result["nModified"] = res.nModified;
                } else {
                    result["n"] = 1;
                    result["nModified"] = 0;
                }
                resolve(result);
            });
        }
    });
}

//type is 3 or 4
async function deletePlace(userID,placeID,type,date=null){
    if(type===3){
        const res = await User.updateOne({_id:userID},{$pull:{fav_places:{fav_place:{$in:placeID}}}},null);
        console.log(res);
    }
    if(type===4){
        const res = await User.updateOne({_id:userID},{$pull:{vis_places:{$and:[{vis_place:{$in:placeID}},{vis_date:{$in:date}}]}}},null);
        console.log(res);
    }
}

async function findPlaceType(type){
    return new Promise(async (resolve,reject) =>{
        await Place.find({types:type},(err,docs)=>{
            if(err) reject(err);
            resolve(docs);
        });
    });
}

async function addCase(new_case){
    return new Promise(async (resolve,reject)=>{
        let flag = false;
        var place_name = new_case["place_and_date"]["place"];
        await findPlace(place_name).then(async place =>{
            // console.log(place);
            // console.log(place.length);
            if(place.length===1 && place[0]!==null && place[0]["status"] === "OK"){
                new_case["place_and_date"]["place"] = place[0]["_id"];
            } else {
                console.log("The place is not correct: ", place_name, new_case);
                // console.log("The place may have lots of results: ", place_name);
                flag = true;
            }
            if(!flag){
                let caseID = null;
                await Case.findOne({"case_id":new_case["case_id"]},async (err,docs)=>{
                    if(docs===null || docs.length===0){
                        let newcase = new Case(new_case);
                        caseID = newcase["_id"];
                        console.log("Case ID 1: ",caseID);
                        newcase.save(err=>{
                            console.log(err);
                        });
                        resolve(caseID);
                    }else{
                        console.log("Case ID 2: ",caseID);
                        await Case.findOne({"case_id":new_case["case_id"],
                            "place_and_date.place":new_case["place_and_date"]["place"],
                            "place_and_date.start_date":new_case["place_and_date"]["start_date"],
                            "place_and_date.end_date":new_case["place_and_date"]["end_date"]
                        }, async (err,docs)=>{
                                if(docs===null || docs.length===0){
                                    const res = await Case.updateOne({"case_id":new_case["case_id"]},{$addToSet:{place_and_date:new_case["place_and_date"]}});
                                    console.log("Place updated result: ", res.n,res.nModified);
                                }
                        });
                        resolve(caseID);
                    };
                }).then(async (caseID)=>{
                    console.log("Check Case ID is:",caseID);
                    const res = await Place.updateOne({_id:place[0]["_id"]},{
                        flag:true,
                        $addToSet:{cases:caseID}
                    });
                    console.log("Place updated result", res.n, res.nModified);
                    resolve(true);
                })
            } else {
                resolve(false);
            }
        });
    });
}
//Todo: if flag is true (add date check)
async function findCaseByGeo1(geo,flag){
    let lat = geo["lat"];
    let lng = geo["lng"];
    let new_lat = 500 * 0.0000089;
    let new_lng = new_lat / Math.cos(lat * 0.018);
    let cases = [];
    console.log(new_lat,new_lng);
    return new Promise(async (resolve,reject) => {
        Place.find({
            "flag":"true",
            "geometry.lat":{$lt:lat+new_lat,$gt:lat-new_lat},
            "geometry.lng":{$lt:lng+new_lng,$gt:lat-new_lng}
        },(err,docs)=>{
            resolve(docs);
        })
    });
}

//if flag = true: add date check
async function findCaseByGeo(geo,flag){
    let lat = geo["lat"];
    let lng = geo["lng"];
    let new_lat = 500 * 0.0000089;
    let new_lng = new_lat / Math.cos(lat * 0.018);
    let cases = [];
    console.log(new_lat,new_lng);
    return new Promise(async (resolve,reject) => {
        Place.find({
            "flag":"true",
            "geometry.lat":{$lt:lat+new_lat,$gt:lat-new_lat},
            "geometry.lng":{$lt:lng+new_lng,$gt:lat-new_lng}
        },async (err,docs)=>{
            console.log("Finded: ",docs);
            for(const place in docs){
                // console.log(place);
                console.log(docs[place]);
                cases[place] = {}
                cases[place]["mapName"] = docs[place]["mapName"];
                cases[place]["cases"] = [];
                const doc_cases = docs[place]["cases"];
                let tmp = {};
                for(const item in doc_cases){
                    console.log(doc_cases[item]);
                    console.log(doc_cases[item]["_id"]);
                    await getCaseByID(doc_cases[item]["_id"]).then(x=>{
                            cases[place]["cases"].push(x);
                            // console.log("???>",cases);
                        }
                    );
                }
            }
            // console.log(cases);
        }).then(()=>{
            console.log(cases);
            resolve(cases);
        });
    });
}

// check place and send emails
async function checkPlace(){
    for await (const user of User.find()) {
        let email_res = {};
        console.log(email_res);
        email_res["email"] = user["contact_email"];

        // Check Home
        const home = await getPlaceByID(user["home"]);
        console.log("home is: ",home);
        if(home !== null){
            email_res["home"] = home["mapName"];
            email_res["home_case"] = await findCaseByGeo(home["geometry"],false);
        }

        //Check Work
        const work = await getPlaceByID(user["work"]);
        console.log("work is: ",work);
        if(work!== null) {
            email_res["work"] = work["mapName"];
            email_res["work_case"] = await findCaseByGeo(work["geometry"], false);
        }
        //Check email
        email_res["fav_places"] = {}
        // user["fav_places"].forEach((item)=>{
        //    console.log(item);
        //     const fav = await getPlaceByID(item["fav_place"]);
        // });
        for (const place in user["fav_places"]){
           const fav = await getPlaceByID(user["fav_places"][place]["fav_place"]);
            email_res["fav_places"][place] = {};
            email_res["fav_places"][place]["mapName"] = fav["mapName"];
            email_res["fav_places"][place]["flag"] = fav["flag"];
            email_res["fav_places"][place]["cases"] = fav["cases"];
        }
        for (const place in user["vis_places"]){
            console.log(place);
            const fav = await getPlaceByID(user["vis_places"][place]["vis_place"]);
            console.log(fav);
            const p = fav["cases"];
            const d = user["vis_places"][place]["vis_date"];
            console.log(p,d);
            // email_res["vis_places"][place] = {};
            // email_res["vis_places"][place]["mapName"] = fav["mapName"];
            // email_res["vis_places"][place]["flag"] = fav["flag"];
            // email_res["vis_places"][place]["cases"] = fav["cases"];
        }
        email.emailSending(email_res);
    }
}

// type
// 1 -> nearby cases
// 2 -> nearby restaurants

async function searchNearby(placeID,type){
    console.log("Place ID is: ",placeID);
    console.log("Type is: ",type);
    return new Promise(async (resolve,reject) => {
        await getPlaceByID(placeID).then(place=>{
            console.log(">>>>?",place);
            const geo = place["geometry"]
                if(type == 1){
                    findCaseByGeo1(geo,true).then(x=>resolve(x));
                } else if (type == 2){
            } else {
                resolve(false);
            }
        })
    });
}


exports.getUser = getUser;
// exports.getInfo = getInfo;

exports.setPlace = setPlace;
exports.findPlace = findPlace;
exports.findPlaceType = findPlaceType;
exports.searchNearby = searchNearby;

// private
exports.textSearch = textSearch;
exports.addCase = addCase;
exports.checkPlace = checkPlace;

//getByID
exports.getPlaceByID = getPlaceByID;
exports.getUserByID = getUserByID;
exports.getCaseByID = getCaseByID;

//settings
exports.setEmail = setEmail;
exports.deletePlace = deletePlace;