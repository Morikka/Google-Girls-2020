const mongoose = require('mongoose');
// const mongoose = require('mongoose').set('debug', true);
require('mongoose-double')(mongoose);

const https = require('https');
const qs = require('qs');

// The database part
// const dbName = 'ggirls';
// use test database first

const dbName = 'test';
const url = "mongodb+srv://mio:Jcu3gbEBnzhd3BHL@ggirls-rw5nh.gcp.mongodb.net/"+dbName+"?retryWrites=true&w=majority";

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
    // fav_places : [{type:SchemaTypes.ObjectId, ref:'Place'}],
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
    flag:Boolean,
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
    let doc = await User.findOneAndUpdate({_id:userID},{"contact_email":email});
    console.log(doc["contact_email"]);
}

async function getPlaceByID(id){
    console.log("ID is: ",id);
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
        key:"AIzaSyCfEfBinkiInzbXiapMhgpsXpN03Q3dSGc",
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
                console.log(tmp);
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
        key:"AIzaSyCfEfBinkiInzbXiapMhgpsXpN03Q3dSGc",
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

// async function findPlace(input){
//     return new Promise(async (resolve,reject) => {
//         var place = 'None';
//         await Place.find({mapName:input}, (err,docs) =>{
//             if(err) reject(err);
//             console.log("Find place in database");
//             place = docs;
//
//         }).then(async ()=>{
//             if (place.length===0) {
//                 searchPlace(input).then(x=>savePlace(x)).then(x=>{
//                     console.log("Find place in API");
//                     resolve([x]);
//                 });
//             } else resolve(place);
//         });
//     });
// };

async function findPlace(input){
    return new Promise(async (resolve,reject) => {
        var place = 'None';
        await Place.find({mapName:input}, (err,docs) =>{
            if(err) reject(err);
            console.log("Find place in database");
            place = docs;
        })
        if (place.length===0) {
            searchPlace(input).then(x=>savePlace(x)).then(x=>{
                console.log("Find place in API");
                resolve([x]);
            });
        } else {
            resolve(place);
        }
    });
};

async function savePlace(place){
    return new Promise(async (resolve,reject) =>{
    let place_res = null;
    await Place.findOne({mapID: place["mapID"]},(err,docs)=>{
        if(err) return reject(err);
        // place doesn't exist
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


async function addCase(new_case){
    let flag = false;
    // for (var item in new_case["place_and_date"]){
    var place_name = new_case["place_and_date"][0]["place"];
    console.log(">>>",place_name);
    await findPlace(place_name).then(place =>{
        console.log(place);
        if(place[0]["_id"]!==undefined){
            new_case["place_and_date"][0]["place"] = place[0]["_id"];
        } else {
            console.log("The place doesn't exist: ",place_name);
            flag = true;
        }
        if(!flag){
            // UNFINISHED
            Case.findOne({"case_id":new_case["case_id"]},async (err,docs)=>{
                if(docs===null || docs.length===0){
                    let newcase = new Case(new_case);
                    newcase.save(err=>{
                        console.log(err);
                    });
                }else{
                    const res = await Case.updateOne({"case_id":new_case["case_id"]},{$addToSet:{place_and_date:new_case["place_and_date"][0]}});
                    console.log(res.n,res.nModified);
                }
            });
        };
    });

    // new_case.save((err)=>{
    //     if (err) console.log(error);
    // });
}

async function checkPlace(){
    for await (const user of User.find()) {
        let email = user["email"];
        console.log(email);
    }
}

exports.getUser = getUser;
// exports.getInfo = getInfo;

exports.setPlace = setPlace;
exports.findPlace = findPlace;
// exports.updatePlace = updatePlace;

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