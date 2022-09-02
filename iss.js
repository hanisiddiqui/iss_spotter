const request = require('request');

const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (error, response, body) => {
    const ip = JSON.parse(body).ip;
    if (ip === undefined) {
      callback('ERROR');
    } else if (response.statusCode !== 200) {
      callback('HTTP Error');
    } else {
      callback(null, ip);
    }
  });
};

const fetchCoordsByIP = (ip, callback) => {
  // let returnObject = {latitude, longitude,};
  let returnObject = {};
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    returnObject.latitude = JSON.parse(body).latitude;
    returnObject.longitude = JSON.parse(body).longitude;
    if (returnObject.latitude === undefined || returnObject.longitude === undefined) {
      callback('ERROR');
    } else if (response.statusCode !== 200) {
      callback('HTTP Error');
    } 
    else {
      callback(null, returnObject);
    }
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  let returnArray;
  request(`https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => { 
  if (body === 'invalid coordinates') {
      return callback('Error: invalid coordinates');
    } else if (response.statusCode !== 200) {
      return callback(`Error: status code = ${response.statusCode}`);
    } 
    returnArray = JSON.parse(body).response;
    callback(null, returnArray);
  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 
 const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};


module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation };