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
   "_id":"user_id",
   "email":"user_email",
   "home":"place_id",
   "work":"place_id",
   "favplaces":
   [
        {"fav_place":"place_id"},
        {"fav_place":"place_id"}
   ],
    "visited":
    [
        {
            "vis_place":"place_id",
            "vis_date":"date"
        },
        {
            "vis_place":"place_id",
            "vis_date":"date"
        }
    ]
}
```
+ Place
```json
{
    "_id":"place_id",
    "mapid":"Google MAP API",
    "geometry": {
      "lat": "latitude",
      "lng": "longitude"
    },
    "flag": "bool",
    "cases": [
      {
          "case_id": "case_id"
      }
    ]
}    
```
Case
```json
{
     "case_id": "Case Number",
     "start_date": "Start date",
     "end_date": "End date"
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