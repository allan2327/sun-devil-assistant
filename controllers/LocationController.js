
module.exports = {
  route: function(payload, cb) {
    switch(payload[1]) {
      case 'Start':
        this.starterText(cb);
      break;
    }
  },
  starterText: function(cb) {
    cb({
      messageType: 'TEXT',
      message: "You can ask for directions by typing 'How do I get to Memorial Union?' or simply 'Memorial Union' "
    });
  }
};
