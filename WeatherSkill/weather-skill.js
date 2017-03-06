/* Intent schema

{
  "intents" : [
    {
    	"intent": "GetMyWeather"
  	}
  ]
}

*/

var https = require('https');

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION");
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`);
        context.succeed(
          generateResponse(
            buildSpeechletResponse("I can't wait to give you hyperlocal weather.", true),
            {}
          )
        );
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`);

        switch(event.request.intent.name) {
          case "GetMyWeather":

            var entryPhrase = "The current forcast is ";
            var temperaturePhrase = " with a temperature of ";
            var period= ". ";
            var windSpeedPhrase = "The current wind speed is ";
            var precipPhrasePartOne = "with a "
            var precipPhrasePartTwo = "chance of precipitation. "
            var dailySummaryPhrase = "In the coming days, you can expect "


            var endpoint = "https://api.darksky.net/forecast"; // Add /dark-sky-api-key/lat, long
            var body = "";
            https.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk });
              response.on('end', () => {
                var data = JSON.parse(body);
                var summary = data.currently.summary;
                var precipProb = precipHelper(data.currently.precipProbability);
                var temperature = calculateTemperature(data.currently.temperature);
                var windSpeed = windSpeedHelper(data.currently.windSpeed);
                var dailySummary = data.daily.summary;

                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`${entryPhrase}${summary}${temperaturePhrase}${temperature}${period}${windSpeedPhrase}${windSpeed}${precipPhrasePartOne}${precipProb}${precipPhrasePartTwo}${dailySummaryPhrase}${dailySummary}`, true),
                    {}
                  )
                );
              });
            });
            break;
          default:
            throw "Invalid intent";
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`);
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

};

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  };

};

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };

};

//Multiply by 9, then divide by 5, then add 32

calculateTemperature = (temperature) => {
  return "" + Math.round(temperature) + " degrees";
}

precipHelper = (precipProb) => {
  percentPrecip = precipProb * 100;

  return "" + percentPrecip + " percent ";
}

windSpeedHelper = (windSpeed) => {
  newWindSpeed = Math.round(windSpeed);

  return newWindSpeed + " miles per hour "
}