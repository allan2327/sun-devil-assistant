
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var routes = require('./routes');
var mysql = require('mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var server = app.listen(process.env.PORT || 5000, function () {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === process.env.SECRET) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          // receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          // receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          // receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          // receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

function handleResponse(senderID, response) {
  switch(response.messageType) {
    case 'TEXT':
      sendTextMessage(senderID, response.message);
    break;
    case 'BUTTONS':
      sendButtonMessage(senderID, response.message);
    break;
    case 'GENERIC':
      sendGenericMessage(senderID, response.message);
    break;
    case 'QUICK_REPLIES':
      sendQuickReply(senderID, response.message);
    break;
  }
  sendTypingOff(senderID);
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    //sendTextMessage(senderID, "Quick reply tapped");
  } else if(messageAttachments && messageAttachments[0].type == 'location') {
    routes.storeUserLocation(senderID, messageAttachments[0].payload, function(response){
      handleResponse(senderID, response);
    });
  }
  else {
    sendTypingOn(senderID);
    routes.onTextMessage(senderID, messageText, function(response) {
      handleResponse(senderID, response);
    });
  }

/*  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;
    }
  } */
}

function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s",
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to
  // let them know it was successful

  routes.onPostBack(senderID, payload, function(response){
    handleResponse(senderID, response);
  });
}

function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

function sendButtonMessage(recipientId, buttons) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: buttons
      }
    }
  };

  callSendAPI(messageData);
}


function sendGenericMessage(recipientId, payload) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: payload
      }
    }
  };

  callSendAPI(messageData);
}

function sendQuickReply(recipientId, message) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: message
  };

  callSendAPI(messageData);
}

function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
      console.log("Successfully called Send API for recipient %s",
        recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}

// Thread Settings
request({
  uri: "https://graph.facebook.com/v2.6/me/thread_settings",
  qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
  method: 'POST',
  json: {
    "setting_type" : "call_to_actions",
    "thread_state" : "existing_thread",
    "call_to_actions": [
      {
        "type":"postback",
        "title":"Start Over",
        "payload":"General|Hi"
      }, {
        type: "postback",
        title: "Need Help?",
        payload: "General|Help"
      }
    ]
  }
});

// Get Started Button
request({
  uri: "https://graph.facebook.com/v2.6/me/thread_settings",
  qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
  method: 'POST',
  json: {
    "setting_type" : "call_to_actions",
    "thread_state" : "new_thread",
    "call_to_actions": [
      {
        "payload":"General|Hi"
      }
    ]
  }
});

// Greeting Text
request({
  uri: "https://graph.facebook.com/v2.6/me/thread_settings",
  qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
  method: 'POST',
  json: {
    "setting_type" : "greeting",
    "greeting": {
      "text": "Your Personal ASU Assistant"
    }
  }
});
