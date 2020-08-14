// const mongoose = require('mongoose');
const mongoose = require('mongoose').set('debug', true);
require('mongoose-double')(mongoose);
// mongoose.Promise = require('bluebird');
// mongoose.Promise = global.Promise;

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
    return new Promise((resolve,reject) => {
        let user = new User({email:email,contact_email:email});
        let userID = null;
        // find user
         User.findOne({email:email}).exec((err,docs)=>{
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
            resolve(userID);
        });
    });
}

async function setEmail(userID, email){
    return await User.findOneAndUpdate({_id:userID},{"contact_email":email},{new:true}).exec();
}

function getPlaceByID(id){
    return new Promise( (resolve,reject) => {
         Place.findOne({_id: id}).exec((err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

function getUserByID(id){
    return new Promise((resolve,reject) => {
         User.findOne({_id: id}).exec((err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

function getCaseByID(id){
    return new Promise((resolve,reject) => {
         Case.findOne({_id: id}).exec((err, data) => {
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
                console.log(json);
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

function findPlace(input){
    return new Promise(async (resolve,reject) => {
        let place = 'None';
        await Place.find({mapName:input}).exec(async (err,docs) => {
            if(err) reject(err);
            place = docs;
            if (place.length===0) {
                place = await searchPlace(input);
                let place_res = await savePlace(place);
                console.log("Find place in API");
                console.log("x2 is", place);
                console.log("place_res is: ",place_res)
                let new_place = await Place.find({mapName:place_res["mapName"]});
                resolve([place_res]);
            } else {
                resolve(place);
            }
        });
    });
};

function savePlace(place){
    return new Promise(async (resolve,reject) =>{
        let place_res = null;
        await Place.findOne({mapID: place["mapID"]}).exec(async (err,docs)=>{
            if(err) reject(err);
            if(docs===null || docs.length===0){
                place_res = new Place(place);
                place_res.save(err=>{
                    if (err) reject(err);
                });
            } else {
                place_res = docs;
            }
            resolve(place_res);
        });
    });
}

// type
// 1 -> home
// 2 -> work
// 3 -> fav places
// 4 -> visited places (have day)

function setPlace(userID,placeID,type,date=null){
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
function deletePlace(userID,placeID,type,date=null){
    return new Promise(async (resolve,reject) =>{
        let result = {
            n:0,
            nModified:0
        };
        if(type===3){
            const res = await User.updateOne({_id:userID},{$pull:{fav_places:{fav_place:{$in:placeID}}}},null);
            result["n"] = res.n;
            result["nModified"] = res.nModified;
        }
        if(type===4){
            const res = await User.updateOne({_id:userID},{$pull:{vis_places:{$and:[{vis_place:{$in:placeID}},{vis_date:{$in:date}}]}}},null);
            result["n"] = res.n;
            result["nModified"] = res.nModified;
        }
        resolve(result);
    });
}

function findPlaceType(type){
    return new Promise(async (resolve,reject) =>{
        await Place.find({types:type},(err,docs)=>{
            if(err) reject(err);
            resolve(docs);
        });
    });
}

function addCase(new_case){
    return new Promise(async (resolve,reject)=>{
        let flag = false;
        let place_name = new_case["place_and_date"]["place"];
        console.log(place_name);
        let place = await findPlace(place_name);
        if(place.length===1 && place[0]!==null && place[0]["status"] === "OK"){
            new_case["place_and_date"]["place"] = place[0]["_id"];
        } else {
            reject("The place name may incorrect: ",place_name);
        }
        let newcaseID = null;
        let res = await Case.findOne({"case_id":new_case["case_id"]}).exec();
        if(res === null){
            let newcase = new Case(new_case);
            console.log(newcase);
            newcaseID = newcase["_id"];
            await newcase.save(err=>{
                reject(err);
            });
        } else {
            newcaseID = res["_id"];
            let rres = await Case.findOne({"case_id":new_case["case_id"],
                    "place_and_date.place":new_case["place_and_date"]["place"],
                    "place_and_date.start_date":new_case["place_and_date"]["start_date"],
                    "place_and_date.end_date":new_case["place_and_date"]["end_date"]}).exec();
            if(rres === null){
                const ures = await Case.updateOne({"case_id":new_case["case_id"]},{$addToSet:{place_and_date:new_case["place_and_date"]}});
                console.log("Case updated result: ",ures.n, ures.nModified);
            }
        }
        console.log(newcaseID);
        // Update place info
        let item = {case:newcaseID};
        console.log(item);
        const pres = await Place.updateOne({_id:place[0]["_id"]},{
            flag:true,
            $addToSet:{cases:item}
        });
        console.log("Place updated result: ",pres.n, pres.nModified);
        resolve(true);
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
        let docs = await Place.find({
            "flag":"true",
            "geometry.lat":{$lt:lat+new_lat,$gt:lat-new_lat},
            "geometry.lng":{$lt:lng+new_lng,$gt:lat-new_lng}
            }).exec();
        for(const place in docs){
            cases[place] = {}
            cases[place]["mapName"] = docs[place]["mapName"];
            cases[place]["cases"] = [];
            let tmp = {};
            const doc_cases = docs[place]["cases"];
            for(const item in doc_cases){
            let x = await getCaseByID(doc_cases[item]["_id"]);
            cases[place]["cases"].push(x);
            }
        }
        resolve(cases);
    });
}


// send emails
async function sendEmail(user){
    console.log(user);
    if(user["contact_email"]!=null && user["contact_email"]!="null"){
        let email_res = {};
        console.log(email_res);
        email_res["email"] = user["contact_email"];

        // Check Home
        const home = await getPlaceByID(user["home"]);
        console.log ("home is: ",home);
        if(home !== null){
            email_res["home"] = home["mapName"];
            email_res["home_case"] = await findCaseByGeo(home["geometry"],false);
        }

        //Check Work
        const work = await getPlaceByID(user["work"]);
        // console.log("work is: ",work);
        if(work!== null) {
            email_res["work"] = work["mapName"];
            email_res["work_case"] = await findCaseByGeo(work["geometry"], false);
        }
        //Check Fav
        email_res["fav_places"] = {}
        for (const place in user["fav_places"]){
            const fav = await getPlaceByID(user["fav_places"][place]["fav_place"]);
            if(fav["flag"]===true){
                email_res["fav_places"][place] = {};
                email_res["fav_places"][place]["mapName"] = fav["mapName"];
                email_res["fav_places"][place]["flag"] = fav["flag"];
                email_res["fav_places"][place]["cases"] = fav["cases"];
            }
        }
        email_res["vis_places"] = {}
        for (const place in user["vis_places"]){
            const vis = await getPlaceByID(user["vis_places"][place]["vis_place"]);
            if(vis["flag"]===true){
                const p = vis["cases"];
                const d = user["vis_places"][place]["vis_date"];
                console.log(p,d);
                email_res["vis_places"][place] = {};
                email_res["vis_places"][place]["mapName"] = vis["mapName"];
                email_res["vis_places"][place]["flag"] = vis["flag"];
                email_res["vis_places"][place]["cases"] = vis["cases"];
            }
        }
        // console.log(email_res);
        email.emailSending(email_res);
        console.log("Email Debug: ");
        console.log(email_res["email"]);
        console.log(email_res["home"]);
        console.log(email_res["home_case"]);
        if(email_res["home_case"]){
            for(const items in email_res["home_case"]){
                console.log(email_res["home_case"][items]);
                if(email_res["home_case"][items]===null) continue;
                for(const cases in email_res["home_case"][items]["cases"]){
                   console.log(cases);
                }
            }
        }
    }
}

// check place and send emails
async function checkPlace(){
    // for (const user of User.find()) {
    //     await sendEmail(user);
    // }
    const userres = await User.find().exec();
    console.log(userres);
    for (const user of userres) {
        await sendEmail(user);
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
exports.sendEmail = sendEmail;

//getByID
exports.getPlaceByID = getPlaceByID;
exports.getUserByID = getUserByID;
exports.getCaseByID = getCaseByID;

//settings
exports.setEmail = setEmail;
exports.deletePlace = deletePlace;