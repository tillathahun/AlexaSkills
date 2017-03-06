var http = require('http');

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
            buildSpeechletResponse("Four score and thirty years ago... well, you know the rest.", true),
            {}
          )
        );
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`);

        switch(event.request.intent.name) {
          case "GetRonSwansonQuote":
            var endpoint = "http://ron-swanson-quotes.herokuapp.com/v2/quotes"; // ENDPOINT GOES HERE
            var body = "";
            http.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk });
              response.on('end', () => {
                var data = JSON.parse(body);
                var ronSwansonQuote = data;
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`${ronSwansonQuote}`, true),
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
