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

+ users

```json
{
   "_id":"user_id, the private key and a unique indentifier for a user",
   "email":"user login google email account",
   "home":"place_id, a foreign key to the place table",
   "work":"place_id, a foreign key to the place table",
   "fav_places":
   [
        {"fav_place":"place_id, a foreign key to the place table"}
   ],
    "vis_places":
    [
        {
            "vis_place":"place_id, a foreign key to the place table",
            "vis_date":"date, stores user’s visit date, the default value is today"
        }    
    ],
  "contact_email": "user contact email, the default value is the login gmail account"
}
```
+ places
```json
{
    "_id":"place_id, the private key and a unique indentifier for a place",
    "mapID":"received from the Google MAP API, a unique indentifier for a place", 
    "mapName": "received from the Google MAP API, the name of the place (may be different from the search text)",
    "geometry": {
      "lat": "latitude of the place",
      "lng": "longitude of the place"
    },
    "flag": "bool, true means this place has Covid-19 cases recently, false means this place doesn't have Covid-19 cases recently （e.g. in last 28 days)",
    "cases": [
      {
          "case_id": "case_id, a foreign key to the table cases"
      }
    ],
    "status": "received from Google MAP API, OK means no errors occurred, ZERO_RESULTS means no places be returned",
    "types": ["Place Types received from Google MAP API"]
}    
```
cases
```json
{
     "_id": " the private key and a unique indentifier for a case",
     "case_id": "case id from the original dataset (download from hk gov), a unique and contentious indentifier for a case",
     "place_and_date": [{
          "place": "place_id, a foreign key to the table place",
          "start_date": "Start date from the original dataset (download from hk gov)",
          "end_date": "End date from the original dataset (download from hk gov)"
      }]
}
```