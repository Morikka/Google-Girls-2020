const db = require('./db');
const t= require('./email_test');
const email = require('./send_email');

// db.textSearch("wellcome");

// Test getUser function.
async function test1(){
    let email = "test@t.t"
    let res = await db.getUser(email);
    console.log(res);
}


// Test setEmail function.
async function test2(){
    let email = "test@t.t"
    let res = await db.getUser(email);
    let userID = res['_id'];
    let newres = await db.setEmail(userID,'new@a1.b1');
    console.log(newres);
}

// Test findPlace function.
async function test3(){
    let place1 = "City University of Hong Kong";
    let place2 = "香港大學";
    let res1 = await db.findPlace(place1);
    console.log(res1);
    let res2 = await db.findPlace(place2);
    console.log(res2);
}

// Test setPlace function.
async function test4(){
    let email = "test@t.t";
    let place = "City University of Hong Kong";
    // let place = "香港大學";
    let res = await Promise.all([db.getUser(email),db.findPlace(place)]);
    let userID = res[0];
    let placeID = res[1];
    console.log("UserID and Place ID: ", userID, placeID);
    let res1 = await db.setPlace(userID["_id"],placeID[0]["_id"],1);
    console.log(res1);
}

//Test addCase function.
async function test5(){
    let new_case = {}
    new_case["case_id"] = "1009";
    new_case["place_and_date"] = {
            "place":"Hong Kong University",
            "start_date": "2020-07-02",
            "end_date": "2020-07-04"
        }
    const res = await db.addCase(new_case);
    console.log(res);
}

//Test email func
async function test6(){
    let user = await db.getUser("test@t.t");
    let res = await db.sendEmail(user);
    console.log(res);
}

// Test delete func

async function test7(){
    let user = await db.getUser("test@t.t");
    let place = await db.findPlace("City University of Hong Kong");
    let res1 = await db.setPlace(user["_id"],place[0]["_id"],3);
    console.log(res1);
    let res2 = await db.deletePlace(user["_id"],place[0]["_id"],3);
    console.log(res2);
    let res3 = await db.setPlace(user["_id"],place[0]["_id"],4,"2020-07-03");
    console.log(res3);
    let res4 = await db.deletePlace(user["_id"],place[0]["_id"],4,"2020-07-03");
    console.log(res4);
}

// Test email function
// async function test8(){
//     let res = await db.checkPlace();
//     console.log(res);
// }

async function test9(){
    let place = "百佳";
    db.textSearch(place);
}

// test1();
// test2();
// test3();
// test4();
// test5();
// test6();
// test7();
// test8();
test9();