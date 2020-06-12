const mongoose = require('mongoose');
require('mongoose-double')(mongoose);

const https = require('https');
const qs = require('qs');

// The database part
// const dbName = 'ggirls';
// use test database first

const dbName = 'test';
const url = "mongodb+srv://mio:Jcu3gbEBnzhd3BHL@ggirls-rw5nh.gcp.mongodb.net/"+dbName+"?retryWrites=true&w=majority";

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});

var SchemaTypes = mongoose.Schema.Types;

var userSchema = new mongoose.Schema({
    email: String,
    home: {type:String, ref:'Place'},
    work: {type:String, ref:'Place'},
    fav_places : [{place:{type:String, ref:'Place'}}],
    visited:[{
        vis_place:{type:String, ref:'Place'},
        vis_date:{type: Date, default: Date.now}
    }]
})

var placeSchema = new mongoose.Schema({
    map_id:String,
    geometry:{
        lat: SchemaTypes.Double,
        lng: SchemaTypes.Double
    },
    flag:Boolean,
    cases: [{case:{ type: Date, default: Date.now }}]
})

var caseSchema = new mongoose.Schema({
    case_id: String,
    "start_date": { type: Date, default: Date.now },
    "end_date": { type: Date, default: Date.now }
})

async function getUserID(email){
    var User = mongoose.model('users',userSchema);
    var user = new User({email:email});
    var userID = null;
    // find user
    await User.findOne({email:email},(err,docs)=>{
        if(err) return console.error(err);
        //If user doesn't exist
        if(docs===null || docs.length===0){
             user.save((err)=>{
                if (err) return console.error(err);
                // console.log("user inserted");
            });
            userID = user._id;
        } else {
            userID = docs._id;
        }
    });
    return userID;
}

async function findPlace(input){
    var query = {
        key:"AIzaSyCfEfBinkiInzbXiapMhgpsXpN03Q3dSGc",
        input:input,
        inputtype:"textquery",
        fields:"geometry,name,place_id"
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
                    json["status"] = 0;
                }else{
                    tmp = tmp["candidates"][0];
                    json["status"] = 1;
                    json["mapName"] = tmp["name"];
                    json["mapID"] = tmp["place_id"];
                    json["geometry"] = tmp["geometry"]["location"];
                }
                resolve(json);
            })
        });
        req.on('error', function(e) {
            reject(e);
        });
    });
};

// type
// 1 -> home
// 2 -> work
// 3 -> fav places
// 4 -> visited (have day)
async function setPlace(userID,place,type,msg=null){
    var Place = mongoose.model('places',placeSchema);
    var place = new Place({map_id: place});
    var placeID = null;
    // find place in db
    await Place.findOne({map_id: place},(err,docs)=>{
        if(err) return console.error(err);
        // place doesn't exist
        if(docs===null || docs.length===0){
            place.save(err=>{
                if (err) return console.error(err);
            });
            placeID = place._id;
        } else{
            placeID = docs._id;
        }
    });

   // if(type===1){
   //     var res = await User.updateOne({_id:UserID},{home:placeID});
   //  }
}

exports.getUserID = getUserID;
exports.findPlace = findPlace;
exports.setPlace = setPlace;