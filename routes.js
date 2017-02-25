var general_controller = require(__dirname + '/controllers/GeneralController');

module.exports = {
  onTextMessage: function(messageText, cb) {
    var wit = require(__dirname + '/wit');
    wit.makeRequest(messageText, function(res) {
      if(res.entities && res.entities.intent) {
        console.log(res.entities.intent[0], res.entities.intent[0].text);
        switch(res.entities.intent[0].value) {
          case 'hi':
            general_controller.hi(cb);
          break;
          case '':
          break;
          default:

        }
      }
      else {

      }

    });

    // cb({
    //   messageType: 'TEXT',
    //   message: 'Hello World!'
    // });
  },
  onPostBack: function(payload, cb) {
    cb({
      messageType: 'TEXT',
      message: 'Hello World!'
    });
  }
};
