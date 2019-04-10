var QuickBooks = require('../index');
var config = require('../config')
var Tokens = require('csrf');
var csrf = new Tokens();
var qbo;
var refreshToken = require('./refreshToken');
var port = process.env.PORT || 3000;
var request = require('request');
var session = require('express-session');

QuickBooks.setOauthVersion('2.0', false);


var consumerKey = config.consumerKey //'Q0nQF35Vp5bPyfeVatEM38ATMrwgHM7ciyNApuZT8iYgRbyLHs';
var consumerSecret = config.consumerSecret //'KQz8iQKCV6eWNSn4NZXZEFiTH1P2ibW5xJ6wSh2E';

exports.getCompany = function (req, res) {



    var obj = {}
    obj.id = session.id
    obj.token = session.refreshToken

    // res.status(200).json(obj)


    getRefreshToken(req, res, function () {


        console.log(qbo)


        qbo.getCompanyInfo(session.id, function (_, response) {

            //need to add realm id or session.id to response
            console.log(response)
         
            response.realmID = session.id
            res.status(200).json(response)

        })

    })

}

function getRefreshToken(req, res, callback) {

    var auth = (new Buffer(consumerKey + ':' + consumerSecret).toString('base64'));
    var realmid = session.id
    //need to add client realmid and pass to function to get correct refresh token. realm id should be passed in as a query parameter

    try {
        refreshToken.getRefreshToken(res, realmid, function (token) {

            console.log(token)
            if (token == -1) {
                res.send("<InputTable></InputTable>")
            }

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


                    callback()

                }

            }).bind(this));
        })
    } catch (e) {

        res.send("<InputTable></InputTable>")
    }
}