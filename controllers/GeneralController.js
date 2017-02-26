
module.exports = {

  getHelpElement: function(){
      var emoji = require('node-emoji');
      return {
          title: 'Need Help?',
          image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/fire_police.jpg',
          buttons: [{
              type: 'phone_number',
              title: emoji.get('police_car') + " ASU Police",
              payload: '+1(480)-965-3456'
          }, {
              type: 'phone_number',
              title: emoji.get('fire_engine') + " ASU Fire Dept",
              payload: '+1(480)-965-1823'
          }]
      };

  },





showHelp: function(user_data,cb){

    var response = {
          messageType: 'GENERIC',
          message: {
              template_type: "generic",
              elements: [
                  this.getHelpElement()
              ]
          }
      };

      cb(response);


  },
  route: function(user_data, payload, cb) {
      switch(payload[1]) {
      case 'Hi':
        this.hi(user_data, cb);
      break;
    }
  },
  hi: function(user_data, cb) {
      var emoji = require('node-emoji');
      var response = {
      messageType: 'GENERIC',
      message: {
        template_type: "generic",
        elements: [{
          title: 'Hi ' + user_data.first_name + ', how can I help you today?',
          image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/pitchfork.jpg',
          buttons: [{
            type: 'postback',
            title: emoji.get('tada') + ' Explore Events',
            payload: 'Events|Start'
          }, {
            type: 'postback',
            title: emoji.get('city_sunrise') + ' Find Places',
            payload: 'Location|Start'
          }]
        }]
      }
    };

    if(user_data.bookmark_buildings || user_data.bookmark_events) {
      var item = {
        title: 'Your Bookmarks',
        image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/bookmarks.jpg',
        buttons: []
      };
      if(user_data.bookmark_events) {
          item.buttons.push({
              type: 'postback',
              title: emoji.get('tada') + ' Show Events',
              payload: 'Events|Find Events|' + user_data.bookmark_events
          });
      }

      if(user_data.bookmark_buildings) {
        item.buttons.push({
          type: 'postback',
          title: emoji.get('city_sunrise') + ' Show Places',
          payload: 'Location|Find Buildings|' + user_data.bookmark_buildings
        });
      }
      response.message.elements.push(item);
    }

    response.message.elements.push(this.getHelpElement());
    cb(response);
  },
  fallback: function(user_data, cb) {
    cb({
      messageType: 'TEXT',
      message: "I'm sorry, but I couldn't understand your question. I'm still learning, and will get better."
    })
  }
};
