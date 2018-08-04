var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    // port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "sqlpassword",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Welcome ADMIN\n');
    initialPrompt();
});

function initialPrompt() {
    inquirer.prompt([

            {
                type: "list",
                name: "command",
                message: "MENU:",
                choices: ['View Products For Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
            }
        ])
        .then(function (userInput) {
            switch (userInput.command) {
                case 'View Products For Sale':
                    return displayInventory();
                case 'View Low Inventory':
                    return lowInventory();
                case 'Add to Inventory':
                    return addInventory();
                case 'Add New Product':
                    return addProduct();
            }
        });
}

function displayInventory() {
    connection.query('SELECT * FROM products', function (error, results) {
        if (error) throw error;
        console.log();
        results.forEach(function (product) {
            console.log(product.item_id, product.product_name, '$' + product.price, 'Stocking Remaining: ' + product.stock_quantity, 'Product Sales: $' + product.product_sales);
        });
        console.log();
        initialPrompt();
    });
}

function lowInventory() {
    connection.query('SELECT * FROM products where stock_quantity < 5', function (error, results) {
        if (error) throw error;
        console.log();
        results.forEach(function (product) {
            console.log(product.item_id, product.product_name, '$' + product.price, 'Stocking Remaining: ' + product.stock_quantity);
        });
        console.log();
        initialPrompt();
    });
}

function addInventory() {
    // prompt for info about the item being put up for auction
    inquirer
        .prompt([{
                name: "item",
                type: "input",
                message: "Please insert product ID to add to inventory."
            },
            {
                name: "quantityAdded",
                type: "input",
                message: "Insert quantity being added to inventory.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            let currentQuantity = null;
            // when finished prompting, insert a new item into the db with that info
            connection.query('SELECT * FROM products where item_id = ?', answer.item, function (error, results) {
                currentQuantity = parseInt(results[0].stock_quantity);
                connection.query('UPDATE products SET stock_quantity = ? WHERE item_id = ?', [currentQuantity + parseInt(answer.quantityAdded), answer.item], function (error, results, fields) {
                    if (error) throw error;
                    console.log('Successfully Added', answer.quantityAdded, ' to Inventory!\n');
                    initialPrompt();
                });

            });
        });
}

function addProduct() {
    console.log('ENTER Details To Add New Product');
    inquirer
        .prompt([{
                name: "itemID",
                type: "input",
                message: "Insert unique product ID of new item.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "productName",
                type: "input",
                message: "Insert name of product."
            },
            {
                name: "departmentName",
                type: "input",
                message: "Insert department name for product."
            },
            {
                name: "price",
                type: "input",
                message: "Insert price of an item.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Insert quantity of new product",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?", {
                    item_id: answer.itemID,
                    product_name: answer.productName,
                    department_name: answer.departmentName,
                    price: answer.price,
                    stock_quantity: answer.quantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your product was successfully added!\n");
                    initialPrompt();
                }
            );


        });
}