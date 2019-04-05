var express = require('express');
module.exports = function(app){

var qb = require('./controllers/app.js')
var js = require('./controllers/getjson.js')
var tb = require('./controllers/gettb.js')
var company = require('./controllers/getcompany.js')
var session = require('express-session');
 

//app.use('/static',express.static('./static'))
//app.use('/lib',express.static('../lib'))

app.use(session({resave: true, saveUninitialized: true, secret: 'smith',cookie: { secure: false }}));

app.get('/', function(req,res){
res.render('home.html')
})

app.set('views', 'views')


app.get('/qb',qb.getQbConn);
app.get('/requestToken',qb.getToken);
app.get('/callback', qb.getTokenSecret );
app.get('/accounts', qb.getAccounts );
app.get('/tb', tb.getQBAccounts );
app.post('/getjson',js.getJson);
app.get('/getcompany',company.getCompany);
}