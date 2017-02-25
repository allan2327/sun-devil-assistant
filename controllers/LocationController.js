
module.exports = {
  route: function(user_data, payload, cb) {
    switch(payload[1]) {
      case 'Start':
        console.log(__dirname);
        if(user_data.latitude && user_data.longitude) {
            this.starterText(user_data, cb);
        }
        else {
            var connection = require(__dirname + '/../db')();
            var me = this;
            connection.connect();
            connection.query("update tbl_user set context='Location|Start' where id_user=" + user_data.id_user, function(err, results, fields){
              connection.end();
              me.getUserLocation(user_data, cb);
            });
        }
      break;
    }
  },
  getUserLocation: function(user_data, cb) {
    cb({
      messageType: 'QUICK_REPLIES',
      message: {
        text: 'Please Share Your Location',
        quick_replies: [{
          content_type: 'location'
        }]
      }
    });
  },
  starterText: function(user_data, cb) {
    cb({
      messageType: 'TEXT',
      message: "Great. Now type where you wish to go. You can type queries like 'How do I get to Memorial Union?' or simply 'Memorial Union' "
    });
  }
};
