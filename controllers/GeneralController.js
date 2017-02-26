
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
      case 'Schools':
        cb({
          messageType: 'LIST',
          message: {
            template_type: 'list',
            elements: [
              {
                title: 'Schools and Colleges',
                image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/fulton.jpg',
                default_action: {
                  type: 'web_url',
                  url: 'https://students.asu.edu/colleges'
                }
              },
              {
                title: 'Engineering',
                subtitle: 'Ira A. Fulton Schools of Engineering',
                image_url: 'https://asunow.asu.edu/sites/default/files/styles/asu_news_article_image/public/fulton.jpg?itok=6GBlDluf',
                default_action: {
                  type: 'web_url',
                  url: 'https://engineering.asu.edu'
                }
              },
              {
                title: 'Business',
                subtitle: 'W. P. Carey School of Business',
                image_url: 'https://asunow.asu.edu/sites/default/files/northeast_prow_hires.jpg',
                default_action: {
                  type: 'web_url',
                  url: 'https://wpcarey.asu.edu'
                }
              },
              {
                title: 'Journalism',
                subtitle: 'Walter Cronkite School of Journalism and Mass Communication',
                image_url: 'http://downtowndevil.com/wp-content/uploads/2011/04/cronkite_post.jpg',
                default_action: {
                  type: 'web_url',
                  url: 'https://cronkite.asu.edu'
                }
              }
            ]
          }
        });
      break;
      case 'Campuses':
      cb({
        messageType: 'LIST',
        message: {
          template_type: 'list',
          elements: [
            {
              title: 'Campuses',
              image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/fulton.jpg',
              default_action: {
                type: 'web_url',
                url: 'https://asu.edu'
              }
            },
            {
              title: 'Tempe',
              image_url: 'http://iamasundevil.asu.edu/images/about-asu-gallery-1.jpg',
              default_action: {
                type: 'web_url',
                url: 'https://campus.asu.edu/tempe'
              }
            },
            {
              title: 'Polytechnic',
              image_url: 'http://www.architectureweek.com/2009/0422/images/14220_image_3.720x547.jpg',
              default_action: {
                type: 'web_url',
                url: 'https://campus.asu.edu/polytechnic'
              }
            },
            {
              title: 'Downtown Phoenix',
              image_url: 'http://www.arizonafoothillsmagazine.com/taste/wp-content/uploads/ASU.jpg',
              default_action: {
                type: 'web_url',
                url: 'https://campus.asu.edu/downtown-phoenix'
              }
            }
          ]
        }
      });
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

    response.message.elements.push({
      title: 'Quick Links',
      image_url: 'https://s3.amazonaws.com/sundevil-assistant/images/asu+old+main.jpg',
      buttons: [{
        type: 'postback',
        title: emoji.get('post_office') + ' Campus Locations',
        payload: 'General|Campuses'
      }, {
        type: 'postback',
        title: emoji.get('school') + ' Colleges & Schools',
        payload: 'General|Schools'
      }]
    });

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
