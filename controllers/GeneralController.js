
module.exports = {
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
            payload: 'General|Hi'
          }, {
            type: 'postback',
            title: emoji.get('city_sunrise') + ' Find Places',
            payload: 'Location|Start'
          }]
        }]
      }
    };

    if(user_data.bookmark_buildings) {
      var item = {
        title: 'Your Bookmarks',
        image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/bookmarks.jpg',
        buttons: []
      };
      if(user_data.bookmark_buildings) {
        item.buttons.push({
          type: 'postback',
          title: emoji.get('city_sunrise') + ' Places',
          payload: 'Location|Find Buildings|' + user_data.bookmark_buildings
        });
      }
      response.message.elements.push(item);
    }
    cb(response);
  },
  fallback: function(user_data, cb) {
    cb({
      messageType: 'TEXT',
      message: "I'm sorry, but I couldn't understand your question. I'm still learning, and will get better."
    })
  }
};
