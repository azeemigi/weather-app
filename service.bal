import ballerina/http;
import ballerina/io;
import ballerina/config;
import ballerina/log;
import ballerina/auth;
import ballerina/jwt;

service /weather on new http:Listener(8080) {

    resource function get getWeather(http:Caller caller, http:Request req, string city) {
        jwt:JwtToken jwtToken = check getJwtToken(req);
        if (jwtToken == null) {
            log:printError("Unauthorized request: Missing/invalid access token");
            _ = caller->respond(createErrorResponse("Unauthorized request"));
            return;
        }

        string username = jwtToken.getSubject();

        string apiKey = config:getAsString("WEATHER_API_KEY");
        http:Response response = check getWeatherFromAPI(city, apiKey);
        _ = caller->respond(response);
    }
}

function getJwtToken(http:Request req) returns (jwt:JwtToken|error) {
    string authHeader = check req.getHeader("Authorization");
    string[] authHeaderParts = authHeader.split(" ");
    if (length(authHeaderParts) != 2 || !authHeaderParts[0].equals("Bearer")) {
        return error("Invalid Authorization header");
    }
    return check jwt:parseToken(authHeaderParts[1]);
}

function getWeatherFromAPI(string city, string apiKey) returns http:Response {
    string apiUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

    http:Response response = check http:Client.get(apiUrl);
    if (response.statusCode == 200) {
        json weatherJson = check response.getJsonPayload();
        string weatherDescription = weatherJson.weather[0].description.toString();
        http:Response newResponse = new;
        newResponse.setPayload({"weather": weatherDescription});
        return newResponse;
    } else {
        log:printError("An error occurred while retrieving weather data: " + response.toString());
        return createErrorResponse("An error occurred while retrieving weather data");
    }
}

function createErrorResponse(string errorMessage) returns http:Response {
    http:Response response = new;
    response.statusCode = 500;
    response.setPayload({"error": errorMessage});
    return response;
}
