const express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var AST = require('node-sqlparser');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var port = process.env.PORT || 8080;

var connection = mysql.createConnection({
 host: "localhost",
 port: 3306,
 // Your username
 user: 'root',
 // Your password
 password: '',
 database: 'Bamazon_db'
});
connection.connect();
var port = process.env.PORT || 8080; // set our port

// ROUTES FOR API
// =============================================================================
var router = express.Router();// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next();
});







app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log("the magic is happening on port: "+ port);
