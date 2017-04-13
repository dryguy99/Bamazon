
create DATABASE Bamazon_db;
USE Bamazon_db;

CREATE TABLE products(
	`item_id` INTEGER(11) AUTO_INCREMENT NOT NULL,
    `product_name` varchar(128) Not Null,
    `department_name` varchar(128) Not Null,
    `price`  DECIMAL(10,2) NOT Null,
    `stock_quanity` INTEGER(10) Null,
    PRIMARY KEY (`item_id`)
);

SELECT * FROM products;


SELECT * FROM cart;

CREATE TABLE cart(
	`item_id` INTEGER(11) NOT NULL,
    `product_name` varchar(128) Not Null,
    `department_name` varchar(128) Not Null,
    `price`  DECIMAL(10,2) NOT Null,
    `quanity_req` INTEGER(10) Null,
    PRIMARY KEY (`item_id`)
);


ALTER TABLE cart
ADD user_name varchar(25) Not Null;