var request = require('request');

module.exports = {
  makeRequest: function(query, cb) {
    var url = "https://api.wit.ai/message?v=" + (new Date().getTime()) + '&q=' + query;
    request.post({
      url: url,
      headers: {
        Authorization: 'Bearer LKQR7STNMTHBDVVICSACTJUCRWEMIUBU'
      }
    }, function(err, res, body) {
      if(cb) {
          cb(JSON.parse(body));
      }
    });
  }
};
