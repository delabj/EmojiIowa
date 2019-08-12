function EmojiIowa() {
  //things passed along to many fucntions
  var weatherAPIKey = "OPENWEATHERMAPS_API_KEY";
  
  
  var tweetText = StitchLines(6, weatherAPIKey);
  SendTweet(tweetText);

  //log tweet

}

//This function stiches the various lines together into tweetText
function StitchLines(numLines, weatherAPIKey) {
  var tweetText = "";
  
  //loops through adding lines to the tweetText
  for(var i =0; i<numLines; i++){
    tweetText += CreateLine(CoordPairs(), RowValues(), i, weatherAPIKey); // calls the data from data.gs, and creates the line. 
    Utilities.sleep(10000);
  }
 
  Logger.log("Twet text is \n"+tweetText);

  return tweetText;
}

//This Function Creates Lines It needs data, the row lookup, which line it's doing and the api key
function CreateLine (data, lookupTable, lineNumber, weatherAPIKey){
  
  //Get variables ready
  var line ="";
  var nextChar ="";
  var lat="";
  var lon="";
  var lookupVal;
  
  //Loops through the total number of entries in LookupTable     
  for(var i=0; i<lookupTable[lineNumber].length; i++){
    lookupVal=VarType(lookupTable[lineNumber][i]);  //determin the type of variable
    
    //slight error catching and determining if the value needs to be called from the api  
    //or is part of the string in lookupTable
     if(lookupVal=="number"){
      lookupVal=lookupTable[lineNumber][i]; //gets value to lookup
      Logger.log(lookupVal);
      Logger.log("Looking up coord pairs")
      lat=data[lookupVal].lat;  // look up lat
      lon=data[lookupVal].lon;  // look up lon 
       Logger.log("Coords are: lat: "+lat+" lon: "+lon);
      lookupVal=CallAPI(weatherAPIKey, lat, lon);// Connect to api 
      nextChar=EmojiConvert(lookupVal) ;// convert to emoji 
      line+=nextChar;
      }
    else if(lookupVal=="string"){
      //if it's a string, check to see if it needs to be a space/return or a blank. 
      Logger.log("String Detected: Determining if blank or not")
      lookupVal=lookupTable[lineNumber][i]; 
      if(lookupVal == "na"){
        //Blanks
        Logger.log("Blank Detected");
      }
      else{
        //all others
        Logger.log("Adding string to line: "+lookupVal);
        line+=lookupVal;
      }
    }
    else {
      //If the value isn't a string or number do nothing
      Logger.log(lookupVal +" detected: An Error Has Occured")
     }
  }

  Logger.log(line);
  return line;
}

//This function calls the openweather API and requests the JSON file for a given set of coords
function CallAPI(weatherAPIKey, lat, lon) {
  //create the URL for the API
  var weatherURL = "https://api.openweathermap.org/data/2.5/weather?&lat="+lat+"&lon="+lon+"&appid="+weatherAPIKey+"&units=imperial";
  //Get the JSON file from the URL
  var dataSet = GetJSON(weatherURL);
  
  return dataSet.weather[0].icon;
}

// gets icon data and then converts it into the appropriate emoji
function EmojiConvert(weatherStatus) {
  var iconData=IconData();
  
  //error catching
  if(iconData[weatherStatus] != "undefined"){
    return iconData[weatherStatus];
   
  }
  else{
    logger.log("Error Found: Weather Status = "+weatherStatus);
    return "❓";
  }
  
}

// This function gets the JSON file from a URL and returns it as a dataSet
function GetJSON(url) {
  Logger.log(url)
  
  //get the Json Feed from URL
  var response = UrlFetchApp.fetch(url); 
  var dataSet = JSON.parse(response.getContentText()); //parse the JSON
  Logger.log(dataSet.weather[0].icon);
  
  return dataSet;
}


// This Function Sends the tweets
function SendTweet(tweetText) {
 // twitter API Access   
 var signsAndTokens= {
    TWITTER_CONSUMER_KEY: "TWITTER_CONSUMER_KEY",
    TWITTER_CONSUMER_SECRET: "TWITTER_CONSUMER_SECRET",
    TWITTER_ACCESS_TOKEN: "TWITTER_ACCESS_TOKEN",
    TWITTER_ACCESS_SECRET: "TWITTER_ACCESS_SECRET"    
   };
  
  // Gets the  user access for this script
  var props = PropertiesService.getUserProperties();
  
  // sets the properties for the api tokens
  props.setProperties(signsAndTokens);
  
  //attemps to access the twitter api using api keys
  var twit = new Twitter.OAuth(props);
  
  //if the api connects send the tweet text
  if ( twit.hasAccess() ) {    
        var status = tweetText;
        var response = twit.sendTweet(status, {        });    
  }  
}

//send a variable to this function to check it's type. 
function VarType(check) {
     return typeof check;
}


//This will log the Tweets. Not done yet. 
function LogTweet(tweetText, tweetStatus) {
  
}
