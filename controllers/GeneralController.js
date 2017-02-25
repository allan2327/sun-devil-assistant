

module.exports = {
  hi: function(cb) {
    cb({
      messageType: 'GENERIC',
      message: {
        template_type: "generic",
        elements: [{
          title: 'Hi how may I help you today?',
          image_url: 'http://vignette4.wikia.nocookie.net/ncaa-football/images/7/7c/Arizona_State_Sun_Devils.jpg/revision/latest?cb=20140406132646',          
          buttons: [{
            type: 'postback',
            title: 'Get Directions',
            payload: 'General|Hi'
          }, {
            type: 'postback',
            title: 'Explore Events',
            payload: 'General|Hi'
          }]
        }]
      }
    });
  }
};
