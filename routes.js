var general_controller = require(__dirname + '/controllers/GeneralController');
var location_controller = require(__dirname + '/controllers/LocationController');

function resolveEntities(entities) {
  return entities;
}

module.exports = {
  getUser: function(senderID, cb) {
    var connection = require(__dirname + '/db')();
    connection.connect();

    connection.query("select * from tbl_user where facebook_id='" + senderID + "'", function(err, results, fields){
      if (err) {
        console.log('some error occurred');
      }
      else {
        if(results.length) {
          connection.end();
          cb(results[0]);
        }
        // Empty Fields
        else {
          var request = require('request');
          // Get Facebook Fields
          request({
            uri: 'https://graph.facebook.com/v2.6/' + senderID + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + process.env.PAGE_ACCESS_TOKEN
          }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              body = JSON.parse(body);
              var data = {
                first_name: body.first_name,
                last_name: body.last_name,
                profile_pic: body.profile_pic,
                facebook_id: senderID
              };

              // Insert New User
              connection.query('insert into tbl_user set ?', data, function(error, results, fields){
                if(err) {
                  throw err;
                }

                // Get User's Details
                connection.query('select * from tbl_user where id_user=' + results.insertId + ' limit 1', function(error, results, fields){
                  connection.end();
                  cb(results[0]);
                });
              });
            } else {
              console.error("Failed Getting Profile Details");
            }
          });
        }
      }
    });
  },
  onTextMessage: function(senderID, messageText, cb) {
    this.getUser(senderID, function(user_data) {
      var wit = require(__dirname + '/wit');
      wit.makeRequest(messageText, function(res) {
        if(res.entities) {
          entities = resolveEntities(res.entities);
          switch(res.entities.intent[0].value) {
            case 'hi':
              general_controller.hi(user_data, cb);
            break;
            case '':
            break;
            default:
              general_controller.fallback(user_data, cb);
          }
        }
        else {
          general_controller.fallback(user_data, cb);
        }
      });
    });
  },
  onPostBack: function(senderID, payload, cb) {
    this.getUser(senderID, function(user_data) {
      payload = payload.split('|');
      switch(payload[0]) {
        case 'Location':
          location_controller.route(user_data, payload, cb);
        break;
        case 'General':
          general_controller.route(user_data, payload, cb);
        break;  
      }
    });
  },
  storeUserLocation: function(senderID, payload, cb) {
    var me = this;
    this.getUser(senderID, function(user_data) {
        // Update Latitude and Longitude
        var connection = require(__dirname + '/db')();
        var coordinates = payload.coordinates;
        connection.connect();
        connection.query("update tbl_user set latitude=" + coordinates.lat + ', longitude=' + coordinates.long + ' where id_user=' + user_data.id_user, function(error, results, fields){
          if(error) {
            throw error;
          }
          user_data.latitude = coordinates.lat;
          user_data.longitude = coordinates.long;
          connection.end();
          if(user_data.context) {
            me.onPostBack(senderID, user_data.context, cb);
          }
        });
    });
  }
};
