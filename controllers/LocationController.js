
module.exports = {
  route: function(user_data, payload, cb) {
    switch(payload[1]) {
      case 'Start':
        this.starterText(user_data, cb);
      break;
      case 'Add Bookmark':
      var name = payload[2], id_building = String(payload[3]), data;
      if(!user_data.bookmark_buildings) {
        data = [];
      }
      else {
        data = user_data.bookmark_buildings.split(',');
      }

      if(data.indexOf(id_building) == -1) {
        data.push(id_building);
        var connection = require(__dirname + '/../db')();
        connection.connect();
        connection.query('update tbl_user set bookmark_buildings="' + data.join(',') + '" where id_user=' + user_data.id_user, function(err, results, fields) {
          connection.end();
          cb({
            messageType: 'TEXT',
            message: name + ' has been added to bookmarks'
          });
        });
      }
      else {
        cb({
          messageType: 'TEXT',
          message: name + ' has already been added to bookmarks'
        });
      }
      break;
      case 'Remove Bookmark':
        var name = payload[2], id_building = String(payload[3]), data;
        if(!user_data.bookmark_buildings) {
          data = [];
        }
        else {
          data = user_data.bookmark_buildings.split(',');
        }

        var index = data.indexOf(id_building);
        if(index > -1) {
          // remove item from list
          data.splice(index, 1);
          var connection = require(__dirname + '/../db')();
          connection.connect();
          connection.query('update tbl_user set bookmark_buildings="' + data.join(',') + '" where id_user=' + user_data.id_user, function(err, results, fields) {
            connection.end();
            cb({
              messageType: 'TEXT',
              message: name + ' has been removed from bookmarks'
            });
          });
        }
        else {
          cb({
            messageType: 'TEXT',
            message: name + ' has already been removed from bookmarks'
          });
        }
      break;
      case 'Find Buildings':
        this.findBuildings(payload[2], user_data, cb);
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
      message: "Great. You can ask me queries like 'How do I get to Memorial Union?' or simply 'Memorial Union'"
    });
  },
  findBuildings: function(params, user_data, cb) {
    var response = [];
    var connection = require(__dirname + '/../db')();
    var me = this;
    connection.connect();

    connection.query('select * from tbl_building where id_building in (' + params + ')', function(err, results, fields) {
      if(results.length) {
        var emoji = require('node-emoji'), item, subtitle;
        var response = {
          messageType: 'GENERIC',
          message: {
            template_type: "generic",
            elements: []
          }
        };

        for(var index=0;index<results.length;index++) {
          subtitle = results[index].description.length <= 80 ? results[index].description : results[index].description.slice(0, 77) + '...';

          response.message.elements.push({
            title: results[index].name,
            subtitle: subtitle,
            item_url: results[index].web_url,
            image_url: results[index].image_url,
            buttons: [{
              type: 'web_url',
              title: emoji.get('metro') + ' Show Route',
              url: 'https://www.google.com/maps/?saddr=Current+Location&daddr=' + results[index].latitude + ',' + results[index].longitude
            }]
          });

          if(user_data.bookmark_buildings && user_data.bookmark_buildings.indexOf(results[index].id_building) > -1) {
            item = {
              type: 'postback',
              title: emoji.get('thumbsdown') + ' Unbookmark',
              payload: 'Location|Remove Bookmark|' + results[index].name + '|' + results[index].id_building
            };
          }
          else {
            item = {
              type: 'postback',
              title: emoji.get('thumbsup') + ' Bookmark',
              payload: 'Location|Add Bookmark|' + results[index].name + '|' + results[index].id_building
            };
          }

          response.message.elements[index].buttons.push({
            type: 'web_url',
            title: emoji.get('question') + ' Learn More',
            url: results[index].web_url
          });

          response.message.elements[index].buttons.push(item);
        }
        cb(response);
      }
      connection.end();
    });
  }
};
