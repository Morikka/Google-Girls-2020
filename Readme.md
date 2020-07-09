# Introduction

In this project, we create a website that only loads the user's nearby cases or special places decided by the user. They can also mark their focus places~(like home, working places, markets, or restaurants), and our system can only load those cases in specific places. We will also send new cases though email so the user doesn't need to check the website all the time. Thirdly, users can mark when and where they have been and if new cases show in the same place, the system will automatically send messages to users.

# Installation

The project is running on the Google App Engine platform, and the database is stored on MongoDB, make sure you have sign up these accounts. 
Besides, our project also requires Node.js environment on your laptop for local testing.

Step 0: Download or clone this project, and use `npm install` to install needed packages.

Step 1: Create `key.js`, where

+ `url` stores the url link to MongoDB server.
+ `placekey` stores the Places API generated from Credientials Panel in Google Cloud Platform.

Step 2: 
Change `script.src` in the `publie/js/google-map.js` to your own Maps JS API keys. (Also generated from Credientials Panel in Google Cloud Platform.)

Step 3:
Use `data.js` to add cases in `data.csv` into your own database.

Step 4:
Deploy this project on your Google APP Enging Platform using `gcloud app deploy --project==your_project_name`

Step 5:
Create a cron job `/api/update_data` from google app engine to automatically send emails.

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