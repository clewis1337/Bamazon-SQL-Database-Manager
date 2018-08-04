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
//THIS APP WILL DISPLAY ALL OF THE ITEMS FOR SALE:
// including: ids, names, and prices of products for sale.

// 6. The app should then prompt users with two messages.

//    * The first should ask them the ID of the product they would like to buy.
//    * The second message should ask how many units of the product they would like to buy.
// 7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

//    * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.

// 8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
//    * This means updating the SQL database to reflect the remaining quantity.
//    * Once the update goes through, show the customer the total cost of their purchase.


connection.connect(function (err) {
    if (err) throw err;
    displayProducts();
});

function initialPrompt() {
    inquirer.prompt([

            {
                type: "input",
                name: "product",
                message: "Please enter a Product ID to Order?"
            },
            {
                type: "input",
                name: "quantity",
                message: "How many would you like to order?"
            }
        ])
        .then(function (userInput) {
            placeOrder(userInput);
        });
}

function displayProducts() {
    connection.query('SELECT * FROM products', function (error, results) {
        if (error) throw error;
        results.forEach(function (product) {
            console.log(product.item_id, product.product_name, '$' + product.price);
        });
        initialPrompt();
    });
}

function placeOrder(userInput){
    let productWanted = userInput.product;
    let quantityWanted = parseInt(userInput.quantity);
    let currentQuantity = null;
    let customerTotal = 0;
    let currentSales = 0;
    connection.query('SELECT * FROM products where item_id = ?', productWanted, function (error, results) {
        currentQuantity = parseInt(results[0].stock_quantity);
        customerTotal = parseFloat(results[0].price) * quantityWanted;
        if(results[0].product_sales)  currentSales = parseFloat(results[0].product_sales);
        if(quantityWanted > results[0].stock_quantity){  //CHECK IF ENOUGH
            console.log('Oh no!  Insufficient Quantity!!');
            initialPrompt();
        }
        else {  //THERE IS ENOUGH, UPDATE DATABASE ^^
            connection.query('UPDATE products SET stock_quantity = ?, product_sales = ? WHERE item_id = ?', [currentQuantity-quantityWanted, currentSales + customerTotal, productWanted], function (error, results, fields) {
                if (error) throw error;
                console.log('Your order has been placed.  Your total is $', customerTotal);
            });
            
        }
    });

}
