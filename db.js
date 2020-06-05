const mongoose = require('mongoose');

// The database part
const url = "mongodb+srv://mio:Jcu3gbEBnzhd3BHL@ggirls-rw5nh.gcp.mongodb.net/test?retryWrites=true&w=majority";
const dbName = 'ggirls';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("we're connected!");
});

async function getUserInfo(email){
    console.log(email);
    // need rewrite
    // mongodb.collection("user").findOne({email:email},(err,res)=>{
    //     if (err) throw err;
    //     var user = res;
    //     console.log(user);
    //     if(res==null){
    //         mongodb.collection("user").insertOne({email:email});
    //     }
    // })
}

exports.getUserInfo = getUserInfo;