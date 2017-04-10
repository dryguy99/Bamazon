
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

