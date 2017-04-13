

function bamazonItems (connection, id, name, department, price, quanity) {

	if (this instanceof bamazonItems){

		//keep our database connection for later use
		this.connection = connection;
		this.id = id;
		this.name = name;
		this.department = department;
		this.price = price;
		this.quanity = quanity;
		
		this.print = function(){
			console.log(this);
		};

		//uniform way of showing the listing title
		this.getListTitle = function(){
			return this.id + ' | ' + this.name + ' | ' + this.department + ' | ' + this.price + ' | ' + this.quanity;
			};

		//the reason why we need a callback is so that once the item is loaded,
		//we can chain the callback into another function
		this.load = function(callbackFunc){
			var currentItem = this;
			//once we have inserted or confirmed that the record has been inserted, we can reload the record
			//using the database (this allows the database properly set defaults for data)
			//in theory node js can do this as well, but i want to show you guys how to fully utilize mysql features
			//this keeps defaults and data more consistent between applications and programmers
			//other programmers know to use the database for configuring data but not necessarily your program
			function innerLoad(){
				if(currentItem.id != 0){
					connection.query("SELECT * FROM products WHERE id = ?", [currentItem.id],
						function(err, results){
							if(err) throw err;
							//uses a uniform function to map the results
							currentItem.mapValues(results[0]);
							console.log("Item loaded");
							callbackFunc();
						}
					);

				}
			}
			//we know we have not yet loaded/inserted a record if the id has not been set
			if(this.id === 0){
				//insert record...
				//INSERT INTO `greatbay_db`.`auction_item` (`title`, `name`, `category`, `user`, `starting_bid`) 
				// VALUES ('Greatest Mac Ever', 'Macbook', 'Computer', 'anthony', '1');
				connection.query("INSERT INTO products SET ?", {
					id: this.id
					,name: this.name
					,department: this.department
					,price: this.price
					,quanity: this.quanity
				}, function(err, results){
					if(err) throw err;
					if(results.affectedRows > 0){
						console.log("Successfully added item.");
						//console.log(results);
						currentItem.id = results.insertId;
						//console.log(results.insertId);
						innerLoad();
					}
					else{
						console.log("Could not verify that the auction was added.");
					}
				});
			}
			else{
				innerLoad();
			}
		}


		this.mapValues = function(resultRowFromSql){
				var row = resultRowFromSql;
				this.id = row.item_id;
				this.name = row.product_name;
				this.department = row.department_name;
				this.price = parseFloat(row.price);
				this.quanity = parseInt(row.stock_quanity);
			}
	}
	else {
		return new bamazonItems(connection, id, name, department, price, quanity);
	}
};

module.exports = bamazonItems;