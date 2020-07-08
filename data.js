const csv = require('csv-parser');
const fs = require('fs');
const db = require('./db');
const { Writable } = require('stream');

var test = 0;
const rs = fs.createReadStream('data1.csv');
var csvParser = rs.pipe(csv())
    .pipe(new Writable({
        // Change async code to sync
        write: function(row, encoding, callback){
            if(row["action_en"]!=="Transport" && row["sub_district_en"]!=="Outside HK"){
            var caseID = row["case_no"];
            var en_place = row["sub_district_en"]+" "+row["location_en"];
            // var zh_place = row["sub_district_zh"]+" "+row["location_zh"];
            var start_date = row["start_date"];
            var end_date = row["end_date"];
            var newCase = {
                "case_id":caseID,
                "place_and_date": {
                    "place" : en_place,
                    "start_date" : start_date,
                    "end_date": end_date
                    }
                }
            console.log(newCase);
            db.addCase(newCase,test).then((x)=>{
                console.log("Result is: ",x);
                callback();
                });
            }else{
                callback();
            }
        },
        objectMode:true
    }))
    .on('end', () => {
        console.log('CSV file successfully processed');
    });
