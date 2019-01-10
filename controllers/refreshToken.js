var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://kurts:556655K@ds153314.mlab.com:53314/qbol";

exports.storeRefreshToken = function (token, realmid) {



  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("qbol");
    var myquery = { no: 1 };
    dbo.collection("companies").remove(myquery, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      db.close();

      storeNew(token, realmid)


    });
  })

}


function storeNew(token, realmid) {

  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("qbol");
    var myobj = { no: 1, refreshtoken: token, realm: realmid }; //"123145857171484"
    dbo.collection("companies").insert(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();

      return true

    });

  });

}




exports.getRefreshToken = function (callback) {


  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("qbol");
    var query = { no: 1 };
    dbo.collection("companies").find(query).toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
      rt = result[0].refreshtoken
      callback(rt)
    });
  });


}