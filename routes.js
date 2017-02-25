var general_controller = require(__dirname + '/controllers/GeneralController');
var location_controller = require(__dirname + '/controllers/LocationController');

function resolveEntities(entities) {
  return entities;
}

module.exports = {
  onTextMessage: function(messageText, cb) {
    var wit = require(__dirname + '/wit');
    wit.makeRequest(messageText, function(res) {
      if(res.entities) {
        entities = resolveEntities(res.entities);
        switch(res.entities.intent[0].value) {
          case 'hi':
            general_controller.hi(cb);
          break;
          case '':
          break;
          default:
            general_controller.fallback(cb);
        }
      }
      else {
        general_controller.fallback(cb);
      }
    });
  },
  onPostBack: function(payload, cb) {
    console.log(payload);
    payload = payload.split('|');
    switch(payload[0]) {
      case 'Location':
        location_controller.route(payload, cb);
      break;
    }
  }
};
