Health Target API
================

Health Target is a mobile health app that makes it easy for users to track the foods they eat and activities they do, alongside health markers like allergic reactions, autoimmune responses, other health symptoms, and mood as well as to analyze these data points to help make healthier choices. 

Technology Used
-----------
* React
* Redux
* Node.js
* Express.js
* Mongodb
* Chart.js

API
--------------
###Method: daylists

#####Returns day lists for a given query.

#####User must have auth token to run queries

####Optional Arguments:

**date** - Specific date for a day list

**sdate/edate** - Start date/end date - returns day lists within range  
**food** - Food item to search lists for, returns all days with that food *(can be combined with sdate/edate and symptom)*

**symptom** - Symptom to search lists for, returns all days with symptom *(can be combined with sdate/edate and food)*

**tag** - Tag of food items - returns all days where tag is present in food lists *(can be combined with sdate/edate)*

**id** - unique Day List Id - returns specific Day List

**foodid** - unique Food Item id - returns specific Day List where food item is listed

**symptomid** - unique Symptom id - returns specific Day List where symptom was listed

Example:

/api/daylists/?sdate=7/1/2018&edate=7/5/2018&food=donuts

/api/daylists/?sdate=7/1/2018&edate=7/5/2018&tag=gluten

/api/daylists/?symptom=Pain

/api/daylists/?symptom=Gas&food=donuts

/api/daylists/?foodid=5b466467a474db6bc4d9146b

Notes:

All returned fields will always be defined, but optional fields may be empty.


