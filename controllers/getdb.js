var QuickBooks = require('../index');
var Tokens = require('csrf');
var config = require('../config')
var csrf = new Tokens();
var qbo;
var refreshToken = require('./refreshToken');
var port = process.env.PORT || 3000;
var request = require('request');
var store = require('./model2');

QuickBooks.setOauthVersion('2.0', false);


var consumerKey = config.consumerKey 
var consumerSecret = config.consumerSecret 

 var accountArray = [], tb = [], ticker = 0;

exports.getQBAccounts = function (req, res) {

    getRefreshToken(req, res, function () {

        

        qbo.findAccounts({

            desc: 'MetaData.LastUpdatedTime',
            Active: false


        }, function (err, accounts) {

            accountArray = []
            tb = []

            try {
                accounts.QueryResponse.Account.forEach(function (account) {
                    console.log(account)
                    accountArray.push({ type: account.Classification, id: account.Id, AccountType: account.AccountType })
                })
            } catch (e) { }
        })





        qbo.findAccounts({

            desc: 'MetaData.LastUpdatedTime',



        }, function (err, accounts) {


            try {
                accounts.QueryResponse.Account.forEach(function (account) {
                    accountArray.push({ type: account.Classification, id: account.Id, AccountType: account.AccountType })
                })
            } catch (e) { }

            getTrialBalance(req, res, function () {

                store.storeTB(tb, function (tbxml) {

                    // console.log(tbxml)

                    res.set('Content-Type', 'text/xml');
                    res.send(tbxml);

                })
            })


        })


    })

}


function getTrialBalance(req, res, callback) {

    tb = [];
    var dtStart = new Date(req.query.dtStart + 1)
    var dtEnd = new Date(req.query.dtEnd)
    var yrStart = dtStart.getFullYear()
    var mnthStart = dtStart.getMonth() + 1
    var month, dy, yr

    var timeDiff = (dtEnd.getTime() - dtStart.getTime());
    var difMonths = Math.ceil(timeDiff / (1000 * 3600 * 24 * 30));

    difMonths >= 0 ? null : res.send(500, { status: "Invalid Date Parameters" })
    ticker = difMonths
    console.log("ticker length " + ticker)
    for (ctr = 1; ctr <= difMonths; ctr++) {


        switch (mnthStart) {
            case 1:
                dy = 31
                month = "01"
                break;
            case 2:
                if (((yrStart % 4 == 0) && (yrStart % 100 != 0)) ||
                    (yrStart % 400 == 0)) {
                    dy = 29
                    month = "02"
                }
                else {
                    dy = 28
                    month = "02"
                }
                break;
            case 3:
                dy = 31
                month = "03"
                break;
            case 4:
                dy = 30
                month = "04"
                break;
            case 5:
                dy = 31
                month = "05"
                break;
            case 6:
                dy = 30
                month = "06"
                break;
            case 7:
                dy = 31
                month = "07"
                break;
            case 8:
                dy = 31
                month = "08"
                break;
            case 9:
                dy = 30
                month = "09"
                break;
            case 10:
                dy = 31
                month = 10
                break;
            case 11:
                dy = 30
                month = 11
                break;
            case 12:
                dy = 31
                month = 12
                break;

        }



        downLoadTB(dy, month, yrStart, req, res, ctr, difMonths, callback)




        mnthStart += 1


        if (mnthStart > 12) {
            mnthStart = 1
            yrStart += 1
        }

    }

}


function downLoadTB(dy, month, yrStart, req, res, ctr, difMonths, callback) {


    qbo.reportTrialBalance({ ReportBasis: "Accrual", start_date: yrStart + "-" + month + "-" + dy, end_date: yrStart + "-" + month + "-" + dy }, function (_, report) {

        var tbArray = null

        var proceed = false


        if (report.hasOwnProperty("Rows")) {
            if (report.Rows.hasOwnProperty("Row")) {
                proceed = true
            }
            else {
                proceed = false
                ticker -= 1
                ticker == 0 ? callback() : null
            }
        }


        if (proceed) {

            ticker -= 1

            tbArray = report.Rows.Row


            tbArray.forEach(function (row) {

                try {

                    var currAccount = accountArray.filter(function (account) {

                        return account.id == row.ColData[0].id

                    })
                } catch (e) { }



                try {
                    var name, id, debit, credit, type, category
                    name = row.ColData[0].value
                    id = row.ColData[0].id
                    debit = row.ColData[1].value
                    credit = row.ColData[2].value
                    category = currAccount[0].type
                    type = currAccount[0].AccountType
                    m = month
                    d = dy
                    y = yrStart


                    var tbobj = {

                        name: name,
                        id: id,
                        debit: debit,
                        credit: credit,
                        category: category,
                        month: m * 1,
                        day: d * 1,
                        year: y * 1,
                        type: type,
                        date: m + "/" + d + "/" + y,
                    }

                    console.log("type " + type)








                    switch (tbobj.type) {
                        case "Accounts Receivable":
                            tbobj.name = "Receivables"
                            tb.push(tbobj)
                            break;
                        case "Bank":
                            tbobj.name = "Cash & Checking"
                            tb.push(tbobj)
                            break;
                        case "Accounts Payable":
                            tbobj.name = "Current Liabilities"
                            tb.push(tbobj)
                            break;
                        case "Other Current Liability":
                            tbobj.name = "Current Liabilities"
                            tb.push(tbobj)
                            break;
                        case "Credit Card":
                            tbobj.name = "Current Liabilities"
                            tb.push(tbobj)
                            break;
                        case "Fixed Asset":
                            tbobj.name = "Fixed Assets"
                            tb.push(tbobj)
                            break;

                    }


                    if (tbobj.name.indexOf("Undeposited Funds") == 0) {
                        tbobj.name = "Cash & Checking"
                        tb.push(tbobj)
                    }

                    if (tbobj.name.indexOf("Inventory") == 0) {
                        tbobj.name = "Inventory"
                        tb.push(tbobj)
                    }


                    if (tbobj.category.indexOf("Liability") == 0) {

                        var tbobj = {

                            name: "Liabilities",
                            id: id,
                            debit: debit,
                            credit: credit,
                            category: category,
                            month: m * 1,
                            day: d * 1,
                            year: y * 1,
                            type: type,
                            date: m + "/" + d + "/" + y,

                        }

                        tb.push(tbobj)
                    }




                    switch (tbobj.category) {
                        case "Asset":
                            tbobj.csort = 1
                            break;
                        case "Liability":
                            tbobj.csort = 2
                            break;
                        case "Equity":
                            tbobj.csort = 3
                            break;

                    }







                    console.log("Account Name :" + name)
                    console.log("Account ID :" + id)
                    console.log("Account Type :" + category)
                    console.log("Debit Balance :" + debit)
                    console.log("Credit Balance :" + credit)
                    console.log("Month" + m)
                    console.log("Year" + y)
                    console.log("Day" + d)
                    console.log("Type" + type)
                    console.log("Category" + category)
                    console.log("ticker" + ticker)
                    console.log("\n")




                } catch (e) {

                }

            })

            if (ticker == 0) {
                console.log("equal")
                callback()
            }

        }

    })



}

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    // return true; //Object.keys(report.Rows).length > 0

    for (var key in report.Rows) {
        if (report.Rows.hasOwnProperty(key)) {
            proceed = true;
        } else { proceed = false; ticker -= 1 }
    }
}


function getRefreshToken(req, res, callback) {

    var auth = (new Buffer(consumerKey + ':' + consumerSecret).toString('base64'));
    var realmid = req.query.realmid
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