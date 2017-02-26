module.exports = {
findEvents: function(params, user_data, cb) {
  var response = [];
  var connection = require(__dirname + '/../db')();
  var me = this;
  console.log("Events" + params);
  return params;

  connection.connect();
  
  //Todays Date and Time
  // var todaysDate = new Date();
  // var month = todaysDate.getMonth() + 1;
  // var year = todaysDate.getFullYear();
  // var date = todaysDate.getDate();
  //YYYY-MM-DD HH:MM:SS

//   npm install dateformat
// then u can require it in ur coding. then u can create the object of retrieved data as
//
// var day=dateFormat(result.request_date, "yyyy-mm-dd h:MM:ss");
//where date between '03/19/2014' and '03/19/2014 23:59:59'
  //
  // if(params != null && params != ""){
  //
  // }else{
  //
  //
  //
  // var query = "Select * from tbl_events where ";
//   switch(params):
//     case "This Month":
//       break;
//     case "Next Week":
//     break;
//     case "Today":
//       break;
//     connection.query(', function(err, results, fields) {
//       var result
//       cb(response);
//
//     });
//
//
//   }
//
//   );
// }
}
};
