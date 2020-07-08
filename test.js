const db = require('./db');

// db.textSearch("wellcome");

async function test1(){
    let email = "test@t.t"
    // let place = "香港大學";
    let place = "711";
    // let place = "Wellcome";

    // Promise.all([db.getUser(email),db.findPlace(place)]).then(res => {
    //     let userID = res[0];
    //     let placeID = res[1];
    //     consol   e.log(userID);
    //     console.log(placeID);
    //     db.setPlace(userID["_id"],placeID[0]["_id"],3).then(x => console.log(x)).catch(err=>console.error(err));
    // })

    let res = await Promise.all([db.getUser(email),db.findPlace(place)]);
    let userID = res[0];
    let placeID = res[1];
    console.log(userID);
    console.log(placeID);
    if(placeID[0]["_id"] !== undefined && userID["_id"] !== undefined)
        db.setPlace(userID["_id"],placeID[0]["_id"],3,"2020-07-03").then(x => console.log(x)).catch(err=>console.error(err));
    else {
        console.log(placeID[0]);
        console.log(userID);
    }
}
// test1();

async function test2(){
    let email = "test@t.t"
    await db.getUser(email).then(x => db.getPlaceByID(x['home']).then(y => console.log(y)));
}

// test2();

function test3(){
    let new_case = {}
    new_case["case_id"] = "1009";
    new_case["place_and_date"] = [
        {
            "place":"City University of Hong Kong",
            "start_date": "2020-07-02",
            "end_date": "2020-07-04"
        }
    ]
    db.addCase(new_case);
}

// test3();

// async function test4(){
//     await db.checkPlace();
// }
//
// test4();

// async function test5(){
//     db.findPlaceType("food");
// }
//
// test5();

function test6(){
    var retries = 3;
    var p = db.findPlace("Ngau Chi Wan Bun Kee Congee & Noodle Foods, Ping Shek Estate").then(x=>{
        console.log(x);
    });
    for (var i = 0; i < retries; i++) {
        p = p.catch(db.findPlace("Ngau Chi Wan Bun Kee Congee & Noodle Foods, Ping Shek Estate").then(x=>{
            console.log(x);
        }));
    }
    return p;
}

test6();