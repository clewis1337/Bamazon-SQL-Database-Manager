var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table2');
var table = new Table;
function initTable(){
    table = new Table({
        chars: {
            'top': '═',
            'top-mid': '╤',
            'top-left': '╔',
            'top-right': '╗',
            'bottom': '═',
            'bottom-mid': '╧',
            'bottom-left': '╚',
            'bottom-right': '╝',
            'left': '║',
            'left-mid': '╟',
            'mid': '─',
            'mid-mid': '┼',
            'right': '║',
            'right-mid': '╢',
            'middle': '│'
        }
    });
    
    table.push(
        ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']
    );
}


// console.log(table.toString());

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
    console.log('Welcome ADMIN SUPERVERVISOR\n');
    initialPrompt();
});

function initialPrompt() {
    inquirer.prompt([

            {
                type: "list",
                name: "command",
                message: "MENU:",
                choices: ['View Product Sales by Department', 'Create New Department']
            }
        ])
        .then(function (userInput) {
            switch (userInput.command) {
                case 'View Product Sales by Department':
                    return productSales();
                case 'Create New Department':
                    return createDepartment();
            }
        });
}
//['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit']
function productSales() {
    initTable();
    //First lets put all product sales into the department table
    connection.query(`SELECT t1.department_id, t1.department_name, t1.over_head_costs, SUM(t2.product_sales)
    FROM departments as t1, products as t2
    WHERE t2.department_name = t1.department_name
    GROUP BY t2.department_name
    ORDER BY t1.department_id`, function (error, results) {
            if (error) throw error;
            results.forEach(function(result){
                let salesTemp = Object.values(result)[3];
                let profitTemp = 0;
                if(salesTemp){
                     profitTemp = parseFloat(salesTemp) - parseFloat(result.over_head_costs);
                }
                else profitTemp = 0 - parseFloat(result.over_head_costs);
                table.push([result.department_id,result.department_name,result.over_head_costs,salesTemp, profitTemp]);
            })
            console.log(table.toString());
            initialPrompt();
        });
}

function createDepartment() {
    console.log('ENTER Details About New Department');
    inquirer
        .prompt([{
                name: "department_id",
                type: "input",
                message: "Insert unique product ID of new department.",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "department_name",
                type: "input",
                message: "Insert name of new department."
            },
            {
                name: "over_head_costs",
                type: "input",
                message: "Insert over head costs of new department.",
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
                "INSERT INTO departments SET ?", {
                    department_id: answer.department_id,
                    department_name: answer.department_name,
                    over_head_costs: answer.over_head_costs
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your department was successfully added!\n");
                    initialPrompt();
                }
            );


        });
}