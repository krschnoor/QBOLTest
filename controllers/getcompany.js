var QuickBooks = require('../index');
var Tokens = require('csrf');
var csrf = new Tokens();
var qbo;
var refreshToken = require('./refreshToken');
var port = process.env.PORT || 3000;
var request = require('request');
var session = require('express-session');

QuickBooks.setOauthVersion('2.0', false);



var consumerKey = 'Q0nQF35Vp5bPyfeVatEM38ATMrwgHM7ciyNApuZT8iYgRbyLHs';
var consumerSecret = 'KQz8iQKCV6eWNSn4NZXZEFiTH1P2ibW5xJ6wSh2E';

exports.getCompany = function (req, res) {

  //var qbo = req.session.qbo

  //qbo.getCompanyInfo(function (_, res) {

   // console.log(res)

   // res.status(200).json(res)

  //})

 var obj = {}
 obj.id = session.id
 obj.token = session.refreshToken

 res.status(200).json(obj)
 
}