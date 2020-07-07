const csv = require('csv-parser');
const fs = require('fs');
const db = require('./db');

fs.createReadStream('data1.csv')
    .pipe(csv())
    .on('data', (row) => {
        if(row["action_en"]!=="Transport" && row["sub_district_en"]!=="Outside HK"){
            var en_place = row["sub_district_en"]+" "+row["location_en"];
            var zh_place = row["sub_district_zh"]+" "+row["location_zh"];
            var start_date = row["start_date"];
            var end_date = row["end_date"];
            var newCase = {
                "place" : zh_place,
                "start_date" : start_date,
                "end_date": end_date
            }
            console.log(newCase);
            console.log(row);
            db.addCase(newCase);
        }
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
    });