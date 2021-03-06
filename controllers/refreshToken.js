var MongoClient = require('mongodb').MongoClient;
var crypto = require('crypto')
var config = require('../config')
var algorithm = config.algorithm 
var password = config.password 
var url = config.mongoURL 

exports.storeRefreshToken = function (token, realmid) {

  console.log("here is the abolute refresh token " + token)
  console.log("here is the abolute relmid  " + realmid)

  MongoClient.connect(url, function (err, db) {
    //if (err) throw err;
    try {
      var dbo = db.db("qbol");
      var myquery = { realm: realmid };
      dbo.collection("companies").remove(myquery, function (err, obj) {
        //if (err) throw err;
        console.log("1 document deleted");
        db.close();

        storeNew(token, realmid)


      });
    } catch (e) {  }
  })

}


function storeNew(token, realmid) {

  token = encrypt(token)

  console.log("encrypted token " + token)

  MongoClient.connect(url, function (err, db) {
    //if (err) throw err;
    try {
      var dbo = db.db("qbol");
      var myobj = { refreshtoken: token, realm: realmid }; //"123145857171484"
      dbo.collection("companies").insert(myobj, function (err, res) {
        // if (err) throw err;
        console.log("1 document inserted");
        db.close();

        return true

      });
    } catch (e) { }

  });

}




exports.getRefreshToken = function (res,realmid, callback) {

  try {
    MongoClient.connect(url, function (err, db) {
      //if (err) throw err;
      var dbo = db.db("qbol");
      var query = { realm: realmid };
      dbo.collection("companies").find(query).toArray(function (err, result) {
        try {
          console.log(result);
          db.close();
          rt = result[0]

          var obj = {}
          obj.refreshtoken = result[0].refreshtoken
          obj.realmid = result[0].realm

          decrypt(obj.refreshtoken).then(function (rt) {
            console.log("decrypted token" + rt)
            obj.refreshtoken = rt
            callback(obj)
          })
        } catch (e) { 
          res.send("<InputTable></InputTable>")
         }

      });
    });
  } catch (e) { }


}

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex');
  return crypted;
}

var decrypt = function (text) {

  return new Promise(function (resolve, reject) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');

    if (dec) {
      resolve(dec);
    } else {
      reject(Error("It broke"));
    }
  });

}