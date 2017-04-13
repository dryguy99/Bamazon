const express = require('express');
var app = express();
var bamazonItems = require('./bamazonitems.js');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var AST = require('node-sqlparser');
var inquirer = require('inquirer');

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


function listItems(){
	console.log('');
	console.log(" SHOPPING at B-AMAZON! ");
	console.log("=======================");
	connection.query("SELECT * FROM products;", 
		function (error, results, fields){
			if (error) {
				console.log(error);
			}
			var listofItems = [];
			var aItemHashMap = {};
			for(var i = 0; i < results.length; i++){
				//any values that I don't set here will be set later
				var aItem = new bamazonItems(connection);
				//maps all my values the uniform way
				aItem.mapValues(results[i]);
				//gets my list title in a uniform way
				var listTitle = aItem.getListTitle();
				//adds each item into a list
				listofItems.push(listTitle);
				//this is a hash map so think of the listTitle as the key to getting my item back
				aItemHashMap[listTitle] = aItem;
			}
			var quan = 0; //quanity to purchase
			var myItem = -1; //current product id number
			var userN = "";
				inquirer.prompt({
					name: "cart"
					, type: "rawlist"
					, message: "Which item would you like to purchase?"
					, choices: listofItems
				}).then(function (answer){
					myItem = aItemHashMap[answer.cart].id;
					inquirer.prompt(
					{name: "quanity"
						, type: "input"
						, message: "How many would you like to buy?"
						, validate: function(input){
							//entering default value in case validation fails
							if(isNaN(input) || parseFloat(input) <= 1){
								return 1;
							}
							quan = aItemHashMap[answer.cart].quanity;
							
							if (parseFloat(input) > quan ) {
								console.log("\n There is not enough stock to sell " + parseFloat(input) + ", please reduce your number requested.")
								return false;
							} else{return true;}
							return parseFloat(input);
						}
					}).then (function(nextamswer) {
						inquirer.prompt({
							name: "user"
							, type: "input"
							, message: "What is your username?"
							, filter: function(input){
								//trimming long answers
								userN = input.substr(0,32);
								return input.substr(0,32);
							}
						}
						).then (function(bidInfo){
							console.log("INSERT cart(item_id, product_name, department_name, price, quanity_req, user_name) VALUES(" + aItem.id+ ",'" + aItem.name +"','" + aItem.department + "'," + aItem.price +"," + aItem.quanity + ",'" + userN + "'');");
							connection.query("INSERT cart(item_id, product_name, department_name, price, quanity_req, user_name) VALUES(" + aItem.id+ ",'" + aItem.name +"','" + aItem.department + "'," + aItem.price +"," + aItem.quanity + ",'" + userN + "');",
								function (error, results, fields){
									if (error) {
										console.log("insert error :");
										console.log(error);
									} else { 
										console.log(results);
										console.log("Success!")
										checkOut(myItem, userN);}
								
							// add to cart and call checkout
							//in theory, we can chain these bids until the user does not
							//want to bid any more...
							//we are using the "start" function as the callback once the enterBid function
							//has completed
							//auctionItem.enterBid(bidInfo.bid, bidInfo.user, start);
						});
					});

			});
		});
	});
}


function checkOut (myItem, userN) {
	connection.query ("SELECT * FROM cart WHERE item_id = " + myItem+ ";", 
		function (error, results, fields){
			if (error) {
				console.log(error);
			}
			console.log(results);
			var total = results.price * results.quanity_req;
			console.log('');
			console.log("Your Shopping Cart has " + results.quanity_req + " of " + results.product_name + ".");
			console.log('');
			console.log('Your Subtotal is : ' + total);
			console.log('');
			var tax = 0.00;
			if (results.department_name === "clothing") {
				tax = Math.round10((total * 0.6875), -2);
				console.log("Your Tax is " + tax + " .");
			} else { console.log("There is no tax on clothing.")}
			console.log('');
			inquirer.prompt ({
				name: "user"
				, type: "input"
				, message: "Would you like to complete your purchase?"
				, choices: ["YES","NO"]
				}).then(function(answer){
		//we take our answer and direct the flow of the program into other functions
		if (answer.user === "YES") {
			console.log("");
			console.log("Your card has been charged. Purchase Complete.");
		}
		
		start();
		
	});
		});
}

function startBamazon(){
	console.log("");
	console.log("Begin Shopping...");
	//need to retrieve these values
	//title, name, category, user, startingBid
	inquirer.prompt(
	[{
		name: "title"
		, type: "input"
		, message: "What Item would you like to buy?"
		, filter: function(input){
			//trimming long answers
			return input.substr(0,128);
		}
	}
	,{
		name: "name"
		, type: "input"
		, message: "What are you selling?"
		, filter: function(input){
			//trimming long answers
			return input.substr(0,128);
		}
	}
	,{
		name: "category"
		, type: "input"
		, message: "What category does your item fall into?"
		, filter: function(input){
			//trimming long answers
			return input.substr(0,32);
		}
	}
	,{
		name: "user"
		, type: "input"
		, message: "What is your username?"
		, filter: function(input){
			//trimming long answers
			return input.substr(0,32);
		}
	}
	,{
		name: "startingBid"
		, type: "input"
		, message: "What is the starting bid?"
		, filter: function(input){
			if(isNaN(input) || parseFloat(input) <= 1){
				return 1;
			}
			return parseFloat(input);
		}
	}]
	).then(function(answer){
		console.log(answer);
		inquirer.prompt(
		{
			name: "confirm"
			, type: "list"
			, message: "Is this correct?"
			, choices: ["Yes", "No"]
			
		}).then(function(confirmAns){
			if(confirmAns.confirm === "Yes"){
				var item = new AuctionItem(connection, 0, answer.title, answer.name, answer.category, answer.user, answer.startingBid, null, null);
				//here I am using objects and closure to separate my database oriented data from my program logic
				item.load(function(){
					//we have finished loading the function and so we can start from the beginning
					start();
				});
				//connection.end();
			}
			else{
				startAuction();
			}

		});
		
	});
}




function start(){
	console.log("");
	console.log("Welcome!");
	console.log("");
	inquirer.prompt({
		name: "cart"
		, type: "list"
		, message: "Would you like to SHOP or are you done?"
		, choices: ["shop","exit"]
	}).then(function(answer){
		//we take our answer and direct the flow of the program into other functions
		if (answer.cart === "shop") {
			listItems();
		}
		else {
			//end the database connection... we are done
			console.log("");
			console.log("========================");
			console.log("Thank you for visiting!");
			console.log('');
			connection.end();
			server.close();
		}
	});
}


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
var server = app.listen(port);
console.log("the magic is happening on port: "+ port);
start();


