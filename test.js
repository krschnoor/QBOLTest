var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://kurts:556655K@ds153314.mlab.com:53314/qbol";





  MongoClient.connect("mongodb://kurts:556655K@ds153314.mlab.com:53314/qbol", function (err, db) {
    if (err) throw err;
    var dbo = db.db("qbol");
    var myquery = { no: 1 };
    dbo.collection("companies").remove(myquery, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();

      


    });
  })


