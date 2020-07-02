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
    home: {type:SchemaTypes.ObjectId, ref:'Place'},
    work: {type:SchemaTypes.ObjectId, ref:'Place'},
    fav_places : [{fav_place:{type:SchemaTypes.ObjectId, ref:'Place'}}],
    // fav_places : [{type:SchemaTypes.ObjectId, ref:'Place'}],
    vis_places:[{
        vis_place:{type:SchemaTypes.ObjectId, ref:'Place'},
        vis_date:{type: Date, default: Date.now}
    }]
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
    cases: [{case:{ type: Date, default: Date.now }}],
    types: [{ type: String }]
})

const caseSchema = new mongoose.Schema({
    case_id: String,
    "start_date": { type: Date, default: Date.now },
    "end_date": { type: Date, default: Date.now }
})
const User = mongoose.model('users',userSchema);
const Place = mongoose.model('places',placeSchema);

async function getUser(email){
    return new Promise(async (resolve,reject) => {
        let user = new User({email:email});
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
                console.log(tmp["results"][item]);
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
        }).then(async ()=>{
            if (place.length===0) {
                searchPlace(input).then(x=>savePlace(x)).then(x=>{
                    resolve([x])
                });
                console.log("Find place in API");
            } else resolve(place);
        });
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

// update place from cases;
async function updatePlace(){

}

exports.getUser = getUser;
exports.setPlace = setPlace;
exports.findPlace = findPlace;
exports.updatePlace = updatePlace;

// private
exports.textSearch = textSearch;