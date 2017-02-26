
module.exports = {
  route: function(user_data, payload, cb) {
    switch(payload[1]) {
      case 'Hi':
        this.hi(user_data, cb);
      break;
    }
  },
  hi: function(user_data, cb) {
    cb({
      messageType: 'GENERIC',
      message: {
        template_type: "generic",
        elements: [{
          title: 'Hi how may I help you today?',
          image_url: 'http://vignette4.wikia.nocookie.net/ncaa-football/images/7/7c/Arizona_State_Sun_Devils.jpg/revision/latest?cb=20140406132646',
          buttons: [{
            type: 'postback',
            title: 'Explore Events',
            payload: 'General|Hi'
          }, {
            type: 'postback',
            title: 'Find Directions',
            payload: 'Location|Start'
          }, {
            type: 'postback',
            title: 'Popular Places',
            payload: 'Location|Popular Places'
          }]
        }]
      }
    });
  },
  fallback: function(user_data, cb) {
    cb({
      messageType: 'TEXT',
      message: "I'm sorry, but I couldn't understand your question. I'm still learning, and will get better."
    })
  }
};
