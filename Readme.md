# Code part
+ [done] Use google account to sign in
+ [todo] Use Mongodb(mongoose) to store user data into database
+ [todo] Use Google Map to show places in database
+ [todo] Email notification
+ [plan] Chatbot
+ [plan] NLP used in chatbot

# Data part
+ [todo] Automatically get data from government 
+ [todo] Store data into database

# Report part
(ref: https://events.withgoogle.com/google-girl-hackathon-cn/submission-instructions/#content)
+ [todo] Final Design Document: https://docs.google.com/document/d/1wppq90JCe8jWUhTyV0KRfSsNdoA_LrQF7umg6cQQOAE/edit
+ [todo] Demo: video recording
+ [todo] Public on github
+ [todo] A user guide for your source code and give instructions to implement your demo.
+ [todo] Submission Form: https://docs.google.com/forms/d/e/1FAIpQLSeX18JSxfxUpcmtg0S_qkv1dTuGr1ZKpnzNiXrdcW5OvvDZ9g/viewform

# Database Settings

+ User

```json
{
   "_id":"_id",
   "email":"user google email",
   "home":"place_id",
   "work":"place_id",
   "fav_places":
   [
        {"fav_place":"place_id"},
        {"fav_place":"place_id"}
   ],
    "vis_places":
    [
        {
            "vis_place":"place_id",
            "vis_date":"date"
        },
        {
            "vis_place":"place_id",
            "vis_date":"date"
        }
    ],
  "contact_email": "user email"
}
```
+ Place
```json
{
    "_id":"place_id",
    "mapID":"Google MAP API", 
    "mapName": "Google MAP API",
    "geometry": {
      "lat": "latitude",
      "lng": "longitude"
    },
    "flag": "bool",
    "cases": [
      {
          "case_id": "case_id"
      }
    ],
    "status": "Google MAP API",
    "types": ["Place Types"]
}    
```
Case
```json
{
     "case_id": "Case Number",
     "place_and_date": [{
          "place": "Place",
          "start_date": "Start date",
          "end_date": "End date"
      }]
}
```

# Google Cloud
Webpage: https://ggirls.df.r.appspot.com

# Settings

### Authorization 
Tutorial:
https://cloud.google.com/nodejs/getting-started/authenticate-users

### Database
Use Mongodb Atlas

Tutorial:
https://cloud.google.com/community/tutorials/mongodb-atlas-appengineflex-nodejs-app

Mongoose: https://mongoosejs.com/

### Read
+ Connection Pooling with MongoDB
https://www.compose.com/articles/connection-pooling-with-mongodb/

## For Data Part Todo 1:
+ Finish the `updatd_data.js` file
+ The real json format should sth like: (Maybe)

```json
{
     "id":1092,
     "places":[
         {
             "place":"Luk Chuen House, Lek Yuen Estate",
             "start_time":"2020-06-01",
             "end_time":"2020-06-02"
         },
         {
             "place":"Lek Yuen Plaza",
             "start_time":"2020-06-01",
             "end_time":"2020-06-01"
         }
     ]
}
```
+ Use `node update_data.js` to test your code.

+ Test the emitter: (ref: https://stackoverflow.com/questions/56223896/event-listener-and-event-emitter-separate-files)

    -  Step 1: run `node cron_test.js`
    -  Step 2: Open 'https://0.0.0.0:8080/api/update_data' in browser.
    
## For frontpage:
+ Get data through `socket.io`:
```js
var socket = io.connect('ws://localhost:3000');
```
+ `/search` 
Use /search to search a place using its name, and the return example is as follows:
(Note that this API can only find one place).

If the `status: 'ZERO_RESULTS'` -> Google map API cannot find a place.

```json
{
  "status": "OK",
  "mapName": "香港城市大學",
  "mapID": "ChIJNe_zADQHBDQRWakL-09wYes",
  "geometry": { "lat": 22.3366793, "lng": 114.1724234 },
  "_id":"place_id",
  "flag": "bool",
  "cases": [
    {
        "case_id": "case_id"
    }
  ],
  "types": "Place Types"
}
```

### Before public the project
+ change google keys
https://console.cloud.google.com/google/maps-apis/credentials?project=ggirls
+ change mongodb password from database access
https://cloud.mongodb.com/v2/5ece2093fb2ebe19b7236bdc#security/database/users





### Google map search API

+ Nearby Search
+ Text Search
+ Find Place Search

Nearby Search and Text Search return all of the available data fields for the selected place 
(a subset of the supported fields), and you will be billed accordingly There is no way to constrain 
Nearby Search or Text Search to only return specific fields.

Place Types: https://developers.google.com/places/web-service/supported_types

Data is