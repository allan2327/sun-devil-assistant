module.exports = {
    route: function(user_data, payload, cb) {
        switch(payload[1]) {
            case 'Start':
                this.starterText(user_data, cb);
                break;
            case 'Add Bookmark':
                var name = payload[2], id_event = String(payload[3]), data;
                if(!user_data.bookmark_events) {
                    data = [];
                }
                else {
                    data = user_data.bookmark_events.split(',');
                }

                if(data.indexOf(id_event) == -1) {
                    data.push(id_event);
                    var connection = require(__dirname + '/../db')();
                    connection.connect();
                    connection.query('update tbl_user set bookmark_events="' + data.join(',') + '" where id_user=' + user_data.id_user, function(err, results, fields) {
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
                var name = payload[2], id_event = String(payload[3]), data;
                if(!user_data.bookmark_events) {
                    data = [];
                }
                else {
                    data = user_data.bookmark_events.split(',');
                }

                var index = data.indexOf(id_event);
                if(index > -1) {
                    // remove item from list
                    data.splice(index, 1);
                    var connection = require(__dirname + '/../db')();
                    connection.connect();
                    connection.query('update tbl_user set bookmark_events="' + data.join(',') + '" where id_user=' + user_data.id_user, function(err, results, fields) {
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
            case 'Find Events':
                this.findEvents(payload[2], null, null, user_data, cb);
                break;
        }
    },
    starterText: function(user_data, cb) {
        cb({
            messageType: 'TEXT',
            message: "Great. You can ask me queries like 'Are there any events today?' or simply 'Events Next Week'"
        });
    },
    findEvents: function(params, startDate, grain, user_data, cb) {
        var response = [];
        var me = this;
        var where_clause = '';

        if(startDate) {
            //Todays Date and Time
            var todaysDate = new Date(startDate);
            var fromDate = todaysDate.getFullYear() + "-" + (todaysDate.getMonth() + 1) + "-" + todaysDate.getDate();
            var end_date = new Date(startDate);

            switch(grain){
                case 'month':
                    end_date.setMonth(end_date.getMonth() + 1);
                    break;
                case 'day':
                    end_date.setDate(end_date.getDate() + 1);
                    break;
                case 'week':
                    end_date.setDate(end_date.getDate() + 7);
                    break;
            }

            var toDate = end_date.getFullYear() + "-" + (end_date.getMonth() + 1) + "-" + end_date.getDate();
            where_clause = "where event_date >= '" + fromDate + "' and event_date < '" + toDate + "'";
        }
        else if(params) {
            where_clause = "where id_event in (" + params + ") ";
        }

        var connection = require(__dirname + '/../db')();
        connection.connect();
        connection.query("select * from tbl_events " + where_clause + " order by event_date", function(err, results, fields) {
            if(results.length) {
                var emoji = require('node-emoji'), item, subtitle, date;
                var moment = require('moment');
                var response = {
                    messageType: 'GENERIC',
                    message: {
                        template_type: "generic",
                        elements: []
                    }
                };

                for(var index = 0;index < results.length; index++) {
                    // THIS NEEDS TO CHANGE
                    date = results[index].event_date;


                    subtitle = emoji.get('calendar') + ' ' + moment(date).format('Do MMM YYYY') + '\n\n' +
                        emoji.get('alarm_clock') + ' ' + results[index].time;

                        //results[index].description.length <= 80 ? results[index].description : results[index].description.slice(0, 77) + '...';

                    response.message.elements.push({
                        title: results[index].name,
                        subtitle: subtitle,
                        item_url: results[index].web_url,
                        image_url: results[index].image_url,
                        buttons: [{
                            type: 'postback',
                            title: emoji.get('japanese_castle') + ' Get Venue',
                            payload: 'Location|Find Buildings|' + results[index].id_event
                        }]
                    });

                    if(user_data.bookmark_events && user_data.bookmark_events.indexOf(results[index].id_event) > -1) {
                        item = {
                            type: 'postback',
                            title: emoji.get('thumbsdown') + ' Unbookmark',
                            payload: 'Events|Remove Bookmark|' + results[index].name + '|' + results[index].id_event
                        };
                    }
                    else {
                        item = {
                            type: 'postback',
                            title: emoji.get('thumbsup') + ' Bookmark',
                            payload: 'Events|Add Bookmark|' + results[index].name + '|' + results[index].id_event
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
