'use strict'

var http = require('http');
var port = process.env.PORT || 3000;
var request = require('request');
var qs = require('querystring');
var util = require('util');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var express = require('express');
var app = express();
var QuickBooks = require('../index');
var Tokens = require('csrf');
var csrf = new Tokens();
var qbo;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";

QuickBooks.setOauthVersion('2.0');

// Generic Express config
app.set('port', port);
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('brad'));
app.use(session({ resave: false, saveUninitialized: false, secret: 'smith' }));

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

// INSERT YOUR CONSUMER_KEY AND CONSUMER_SECRET HERE

var consumerKey = 'Q0JSDCkcz8oVCPbGj9I2lyiDoZpsMGRlYar7ku4idQISSGdKec';
var consumerSecret = 'ZFlU7Y6yn47vhwmBnZOuHPT5Pp2xRXWp9bytnzPN';

app.get('/', function (req, res) {
  res.redirect('/start');
});

app.get('/start', function (req, res) {
  res.render('intuit.ejs', { port: port, appCenter: QuickBooks.APP_CENTER_BASE });
});

// OAUTH 2 makes use of redirect requests
function generateAntiForgery (session) {
  session.secret = csrf.secretSync();
  return csrf.create(session.secret);
};

app.get('/requestToken', function (req, res) {
  var redirecturl = QuickBooks.AUTHORIZATION_URL +
    '?client_id=' + consumerKey +
    '&redirect_uri=' + encodeURIComponent('http://localhost:' + port + '/callback/') +  //Make sure this path matches entry in application dashboard
    '&scope=com.intuit.quickbooks.accounting' +
    '&response_type=code' +
    '&state=' + generateAntiForgery(req.session);

  res.redirect(redirecturl);
});

app.get('/callback', function (req, res) {
  var auth = (new Buffer(consumerKey + ':' + consumerSecret).toString('base64'));

  var postBody = {
    url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + auth,
    },
    form: {
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: 'http://localhost:' + port + '/callback/'  //Make sure this path matches entry in application dashboard
    }
  };

  request.post(postBody, function (e, r, data) {
    var accessToken = JSON.parse(r.body);

    console.log("here is refresh token" + accessToken.refresh_token)
    // save the access token somewhere on behalf of the logged in user
    qbo = new QuickBooks(consumerKey,
                             consumerSecret,
                             accessToken.access_token, /* oAuth access token */
                             false, /* no token secret for oAuth 2.0 */
                             req.query.realmId,
                             true, /* use a sandbox account */
                             true, /* turn debugging on */
                             4, /* minor version */
                             '2.0', /* oauth version */
                            accessToken.refresh_token /* refresh token */);

    
   
   
    qbo.findAccounts(function (_, accounts) {
      accounts.QueryResponse.Account.forEach(function (account) {
        console.log(account.Name);
      });
    });

  });

  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>');
});

app.get('/refresh', function (req, res) {

var auth = (new Buffer(consumerKey + ':' + consumerSecret).toString('base64'));

console.log("tokennnnn" + getRefreshToken())

    var postBody = {
        url: QuickBooks.TOKEN_URL,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + auth,
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: 'L011555263364zsmHnmCIZlUd6MASSE6OdtB889ELwtJge0Exb' //qbo.refreshToken 
        }
    };
    
   
    request.post(postBody, (function (e, r, data) {
        console.log('here is r' + r)
        if (r && r.body) {
            var refreshResponse = JSON.parse(r.body);
           // this.refreshToken = refreshResponse.refresh_token;
            //this.token = refreshResponse.access_token;
            
            console.log('refreshtoken' + refreshResponse.refresh_token)
            console.log('accesstoken' + refreshResponse.access_token)


             qbo = new QuickBooks(consumerKey,
                             consumerSecret,
                             refreshResponse.access_token, /* oAuth access token */
                             false, /* no token secret for oAuth 2.0 */
                             '123145857171484',
                             true, /* use a sandbox account */
                             true, /* turn debugging on */
                             4, /* minor version */
                             '2.0', /* oauth version */
                             refreshResponse.refresh_token /* refresh token */);

    
   
   
            qbo.findAccounts(function (_, accounts) {
              accounts.QueryResponse.Account.forEach(function (account) {
              console.log(account.Name);
              });
            });

          createEstimate(qbo)
            
      } 
      
    }).bind(this));

 

})

function createEstimate(qbo){

var estimate = {
  "TotalAmt": 31.5, 
  "BillEmail": {
    "Address": "Cool_Cars@intuit.com"
  }, 
  "CustomerMemo": {
    "value": "Thank you for your business and have a great day!"
  }, 
  "ShipAddr": {
    "City": "Half Moon Bay", 
    "Line1": "65 Ocean Dr.", 
    "PostalCode": "94213", 
    "Lat": "37.4300318", 
    "Long": "-122.4336537", 
    "CountrySubDivisionCode": "CA", 
    "Id": "4"
  }, 
  "PrintStatus": "NeedToPrint", 
  "EmailStatus": "NotSet", 
  "BillAddr": {
    "City": "Half Moon Bay", 
    "Line1": "65 Ocean Dr.", 
    "PostalCode": "94213", 
    "Lat": "37.4300318", 
    "Long": "-122.4336537", 
    "CountrySubDivisionCode": "CA", 
    "Id": "4"
  }, 
  "Line": [
    {
      "Description": "Pest Control Services", 
      "DetailType": "SalesItemLineDetail", 
      "SalesItemLineDetail": {
        "TaxCodeRef": {
          "value": "NON"
        }, 
        "Qty": 1, 
        "UnitPrice": 35, 
        "ItemRef": {
          "name": "Pest Control", 
          "value": "10"
        }
      }, 
      "LineNum": 1, 
      "Amount": 35.0, 
      "Id": "1"
    }, 
    {
      "DetailType": "SubTotalLineDetail", 
      "Amount": 35.0, 
      "SubTotalLineDetail": {}
    }, 
    {
      "DetailType": "DiscountLineDetail", 
      "Amount": 3.5, 
      "DiscountLineDetail": {
        "DiscountAccountRef": {
          "name": "Discounts given", 
          "value": "86"
        }, 
        "PercentBased": true, 
        "DiscountPercent": 10
      }
    }
  ], 
  "CustomerRef": {
    "name": "Cool Cars", 
    "value": "3"
  }, 
  "TxnTaxDetail": {
    "TotalTax": 0
  }, 
  "ApplyTaxAfterDiscount": false
}

qbo.createEstimate(estimate,function(e,r){
console.log(r)
})

}



app.get('/store', function (req, res) {

 storeAccessToken()


})


function getRefreshToken(){

var rt 

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("qbol");
  var query = { no: 1 };
  dbo.collection("company").find(query).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
    rt = result[0].refreshtoken
    return rt
  });
}); 



}


function storeAccessToken(){


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("qbol");
  var myobj = { no: 1, refreshtoken: "L011555263364zsmHnmCIZlUd6MASSE6OdtB889ELwtJge0Exb", realm: "123145857171484"};
  dbo.collection("company").insert(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");
    db.close();

    return
  });
  return
}); 

return

}