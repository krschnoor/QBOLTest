var QuickBooks = require('../index');
var Tokens = require('csrf');
var csrf = new Tokens();
var qbo;
var session = require('express-session');
var refreshToken = require('./refreshToken');
var port = process.env.PORT || 3000;
var request = require('request');
session = require('express-session'),
  QuickBooks.setOauthVersion('2.0', false);


// INSERT YOUR CONSUMER_KEY AND CONSUMER_SECRET HERE

var consumerKey = 'Q0nQF35Vp5bPyfeVatEM38ATMrwgHM7ciyNApuZT8iYgRbyLHs';
var consumerSecret = 'KQz8iQKCV6eWNSn4NZXZEFiTH1P2ibW5xJ6wSh2E';

//app.get('/', function (req, res) {
//  res.redirect('/start');
//});

exports.getQbConn = function (req, res) {
  res.render('intuit.ejs', { port: port, appCenter: QuickBooks.APP_CENTER_BASE });
};

// OAUTH 2 makes use of redirect requests
function generateAntiForgery(session) {
  session.secret = csrf.secretSync();
  return csrf.create(session.secret);
};

exports.getToken = function (req, res) {
  var redirecturl = QuickBooks.AUTHORIZATION_URL +
    '?client_id=' + consumerKey +
    '&redirect_uri=' + encodeURIComponent('https://qboltest.herokuapp.com/callback/') +  //Make sure this path matches entry in application dashboard
    '&scope=com.intuit.quickbooks.accounting' +
    '&response_type=code' +
    '&state=' + generateAntiForgery(req.session);

  res.redirect(redirecturl);
};

exports.getTokenSecret = function (req, res) {
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
      redirect_uri: 'https://qboltest.herokuapp.com/callback/'  //Make sure this path matches entry in application dashboard
    }
  };

  request.post(postBody, function (e, r, data) {
    var accessToken = JSON.parse(r.body);

    console.log("here is refresh token" + accessToken.refresh_token)
    
    session.id = req.query.realmId
    console.log("id = " + session.id)
    // store initial refresh token and realmid
    if (refreshToken.storeRefreshToken(accessToken.refresh_token, req.query.realmId)) {

    }



  });

  res.send('<!DOCTYPE html><html lang="en"><head></head><body><script>window.opener.location.reload(); window.close();</script></body></html>');
 
};

exports.getCompany = function (req, res) {

  //var qbo = req.session.qbo

  qbo.getCompanyInfo(function (_, res) {

    console.log(res)

    res.status(200).json(res)

  })



}

exports.getAccounts = function (req, res) {

  var auth = (new Buffer(consumerKey + ':' + consumerSecret).toString('base64'));
  var realmid = req.query.realmid
  //need to add client realmid and pass to function to get correct refresh token. realm id should be passed in as a query parameter
  refreshToken.getRefreshToken(realmid, function (token) {

    console.log(token)


    var postBody = {
      url: QuickBooks.TOKEN_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + auth,
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: token.refreshtoken //qbo.refreshToken 
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
        console.log('refreshresponse' + refreshResponse)

        qbo = new QuickBooks(consumerKey,
          consumerSecret,
          refreshResponse.access_token, /* oAuth access token */
          false, /* no token secret for oAuth 2.0 */
          token.realmid,
          false, /* use a sandbox account */
          true, /* turn debugging on */
          4, /* minor version */
          '2.0', /* oauth version */
          refreshResponse.refresh_token /* refresh token */);


        refreshToken.storeRefreshToken(refreshResponse.refresh_token, token.realmid) // store new refresh token in mongo


        qbo.findAccounts(function (_, accounts) {
          // accounts.QueryResponse.Account.forEach(function (account) {
          // console.log(account.Name);
          // 
          //  });
          res.status(200).json(accounts.QueryResponse.Account)

        });



      }

    }).bind(this));



  })





}
