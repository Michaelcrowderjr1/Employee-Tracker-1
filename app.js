// Dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const figlet = require('figlet');

// Set variables
let roles;
let departments;
let managers;
let employees;

// Setup up Database Connection
const connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "donna",
    database: "employee_db"
});

// Display Title on Screen
figlet('Employee Manager', (err, result) => {
    console.log(err || result);
});

// Connect to Database
connection.connect(function(err) {
    if (err) throw err;

    // Start the Prompts
    start();

});

function start() {

// Prompt User for Choices
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "Please select an option",
            choices: [
                {
                    name: "View All Employees",
                    value: "viewAllEmployees"
                },{
                    name: "View All Roles",
                    value: "viewAllRoles"
                },{
                    name: "View All Departments",
                    value: "viewAllDepartments"
                },{
                    name: "View All Employees By Manager",
                    value: "viewEmployeesByManager"
                },{
                    name: "View Department Budgets",
                    value: "viewDeptSalary"
                },{
                    name: "Add Employee",
                    value: "addEmployee"
                },{
                    name: "Add Role",
                    value: "addRole"
                },{
                    name: "Add Department",
                    value: "addDepartment"
                },{
                    name: "Update Employee Role",
                    value: "updateEmployeeRole"
                },{
                    name: "Update Employee Manager",
                    value: "updateEmployeeManager"
                },{
                    name: "Delete Department",
                    value: "deleteDepartment"
                },{
                    name: "Delete Role",
                    value: "deleteRole"
                },{
                    name: "Delete Employee",
                    value: "deleteEmployee"
                },
                {
                    name: "Exit",
                    value: "Exit"
                },
            ]
        }
        ])
    .then((userChoice) => {

        switch(userChoice.choice) {
            case "viewAllEmployees":
                return viewAllEmployees();
            case "viewAllRoles":
                return viewAllRoles();
            case "viewAllDepartments":
                return viewAllDepartments();
            case "viewEmployeesByManager":
                return viewEmployeesByManager();
            case "viewDeptSalary":
                return viewDeptSalary();
            case "addEmployee":
                return addEmployee();
            case "addRole":
                return addRole();
            case "addDepartment":
                return addDepartment();
            case "updateEmployeeRole":
                return updateEmployeeRole();
            case "updateEmployeeManager":
                return updateEmployeeManager();
            case "deleteEmployee":
                return deleteEmployee();
            case "deleteRole":
                return deleteRole();
            case "deleteDepartment":
                return deleteDepartment();
            default:
                connection.end();
        }
    })
    .catch(function(err) {
        console.log(err);
        connection.end();
    });
};

function addDepartment() {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "Enter department to be added: "
        }
    ]).then(function(answer) {
        // Insert new department to department table.
        connection.query(`INSERT INTO department (name) VALUES ('${answer.department}')`, (err, res) => {
        if (err) throw err;
            console.log("New Department added: " + answer.department);

            start();
        }) 
    })
};

function addRole() {
    // Query to department table to build department array for user to choose from when associating the new role.
    connection.query("SELECT id, name FROM department", (err, res) => {
        if (err) throw err;
        departments = res;
        let departmentOptions = [];
        for (i = 0; i < departments.length; i++) {
            departmentOptions.push(Object(departments[i]));
        };

        inquirer.prompt([
            {
            name: "title",
            type: "input",
            message: "Enter role to be added: "
            },
            {
            name: "salary",
            type: "input",
            message: "Enter salary for this position: "
            },
            {
            name: "department_id",
            type: "list",
            message: "Enter department associated with this position: ",
            choices: departmentOptions
            },
        ]).then(function(answer) {
            for (i = 0; i < departmentOptions.length; i++) {
                if (departmentOptions[i].name === answer.department_id) {
                department_id = departmentOptions[i].id
                }
            }
            // Insert new role to role table.
            selectSql = `
                INSERT INTO role (title, salary, department_id) VALUES
                ('${answer.title}', '${answer.salary}', ${department_id})
            `
            connection.query(selectSql, (err, res) => {
                if (err) throw err;

                console.log("New Role added: " + answer.title);
                connection.query("SELECT id, title FROM role", function (err, res) {
                    if (err) throw err;
                    roles = res;
                    console.table(roles);
                    start();
                })
            }) 
        })
    })
    
};

function addEmployee() {
    // Query to role table to build role array for user to choose from when associating the new employee.
    connection.query("SELECT id, title FROM role", function (err, res) {
        if (err) throw err;
        roles = res;

        // Query to employee table to build manager array for user to choose from when associating the new employee.
        selectSql = `
          SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS managers 
          FROM employee
        `
        connection.query(selectSql, function (err, res) {
            if (err) throw err;
            managers = res;

            let role = [];
            for (i = 0; i < roles.length; i++) {
                role.push(Object(roles[i]));
            };
            let managerOptions = [];
            for (i = 0; i < managers.length; i++) {
                managerOptions.push(Object(managers[i]));
            }
            inquirer.prompt([
                {
                    name: "first_name",
                    type: "input",
                    message: "Enter the employee's first name: "
                },
                {
                    name: "last_name",
                    type: "input",
                    message: "Enter the employee's last name: "
                },
                {
                    name: "role_id",
                    type: "list",
                    message: "Enter the role for this employee: ",
                    choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < role.length; i++) {
                        choiceArray.push(role[i].title)
                    }
                    return choiceArray;
                    }
                },
                {
                    name: "manager_id",
                    type: "list",
                    message: "Enter the employee's manager: ",
                    choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < managerOptions.length; i++) {
                        choiceArray.push(managerOptions[i].managers)
                    }
                    return choiceArray;
                    }
                }
            ]).then(function(answer) {
                for (i = 0; i < role.length; i++) {
                    if (role[i].title === answer.role_id) {
                        role_id = role[i].id
                    }
                }
        
                for (i = 0; i < managerOptions.length; i++) {
                    if (managerOptions[i].managers === answer.manager_id) {
                        manager_id = managerOptions[i].id
                    }
                }
                // Insert new employee to employee table.
                selectSql = `
                    INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES ('${answer.first_name}', '${answer.last_name}', ${role_id}, ${manager_id})
                `
                connection.query(selectSql, (err, res) => {
                    if (err) throw err;
        
                    console.log("New employee added: " + answer.first_name + " " + answer.last_name);

                    start()
                }) 
            })
        })
    })
};


viewAllDepartments = () => {
    // Query to Database to select information from department table and display
    connection.query("SELECT id AS ID, name AS Department FROM department", (err, res) => {
        if (err) throw err;

        // Display Title for the report
        figlet('Departments', (err, result) => {
            console.log(err || result);
        });

        // Display output to screen using console.table - Then go back to Main Menu
        console.table(res);
        start();
    });
};

viewAllRoles = () => {
        // Query to Database to select information from role table and display
    selectSql = `
        SELECT id AS ID, title AS Title FROM role `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;

        // Display Title for the report
        figlet('Roles', (err, result) => {
            console.log(err || result);
        });

        // Display output to screen using console.table - Then go back to Main Menu
        console.table(res);
        start();
    });
};

viewAllEmployees = () => {
    // Query to Database to select information from employee and department tables  (There is an inner join for manager to get manager name in employee table - First and Last Name concatentated)
    selectSql = `
        SELECT employee_table.id AS ID, employee_table.first_name AS "First Name", employee_table.last_name AS "Last Name", department_table.name AS Department, 
        role_table.title AS Title, CONCAT('$', Format(role_table.salary, 2)) AS Salary, 
        CONCAT_WS(" ", manager_join.first_name, manager_join.last_name) AS Manager 
        FROM employee employee_table LEFT JOIN employee manager_join ON manager_join.id = employee_table.manager_id INNER JOIN role role_table ON employee_table.role_id = role_table.id 
        INNER JOIN department department_table ON role_table.department_id = department_table.id 
        ORDER BY employee_table.id ASC
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;

        // Display Title for the report
        figlet('Employees', (err, result) => {
            console.log(err || result);
        });
    
        // Display output to screen using console.table - Then go back to Main Menu
        console.table(res);
        start();
    });
};

viewEmployeesByManager = () => {
    // Query to Database to select information from employee table and sort by Manager (Names are concatenated to show manager name)
    selectSql = `
        SELECT employee_table1.id AS ID, CONCAT_WS(" ",employee_table1.first_name, employee_table1.last_name) AS Manager, 
        CONCAT_WS(" ", employee_table2.first_name, employee_table2.last_name) AS Employee
        FROM employee employee_table1 join employee employee_table2 ON employee_table1.id = employee_table2.manager_id
        ORDER BY employee_table1.id
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;

        // Display Title for the report
        figlet('Managers', (err, result) => {
            console.log(err || result);
        });

        // Display output to screen using console.table - Then go back to Main Menu
        console.table(res);
        start();
    });
};

viewDeptSalary = () => {
    // Query to Database to select information from department, employee, role tables to sum up salary per department
    selectSql = `
      SELECT IF(GROUPING(department_table.name), 'Total Department Salaries', department_table.name) AS Department,
      CONCAT('$', Format(SUM(role_table.salary), 2)) AS "Department Salary" 
      FROM employee employee_table LEFT JOIN employee manager_join ON manager_join.id = employee_table.manager_id
      INNER JOIN role role_table ON employee_table.role_id = role_table.id 
      INNER JOIN department department_table ON role_table.department_id = department_table.id
      GROUP BY department_table.name WITH ROLLUP
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;

        // Display Title for the report
        figlet('Department Salaries', (err, result) => {
            console.log(err || result); 
        });
    
        // Display output to screen using console.table - Then go back to Main Menu
        console.table(res);
        start();
    });
};

updateEmployeeRole = () => {
    // Query to Database to retrieve all employees from the employees table
    selectSql = `
    SELECT id, CONCAT_WS(' ', first_name, last_name) AS Employee_Name FROM employee
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;
        employees = res;
        let employeeOptions = [];

        for (var i = 0; i < employees.length; i++) {
            employeeOptions.push(Object(employees[i]));
        }
        inquirer.prompt([
            {
                name: "updateRole",
                type: "list",
                message: "Select Employee to update: ",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < employeeOptions.length; i++) {
                        choiceArray.push(employeeOptions[i].Employee_Name);
                    }
                return choiceArray;
                }
            }
        ]).then(answer => {
            let role = [];

            // Query to Database to retrieve all roles from the role table.  This will be used by the user to select new role.
            connection.query("SELECT id, title FROM role", function (err, res) {
                if (err) throw err;
                roles = res;
                for (i = 0; i < roles.length; i++) {
                    role.push(Object(roles[i]));
                };
                for (i = 0; i < employeeOptions.length; i++) {
                    if (employeeOptions[i].Employee_Name === answer.updateRole) {
                    employeeSelected = employeeOptions[i].id
                    }
                }
                inquirer.prompt([
                    {
                        name: "newRole",
                        type: "list",
                        message: "Select a new role:",
                        choices: function() {
                            var choiceArray = [];
                            for (var i = 0; i < role.length; i++) {
                                choiceArray.push(role[i].title)
                            }
                            return choiceArray;
                        }
                    }
                ]).then(answer => {
                    for (i = 0; i < role.length; i++) {
                        if (answer.newRole === role[i].title) {
                        newChoice = role[i].id

                        // Update employee with new role.
                        selectSql = `
                            UPDATE employee SET role_id = ${newChoice} 
                            WHERE id = ${employeeSelected}
                        `
                        connection.query(selectSql), (err, res) => {
                            if (err) throw err;
                        };
                        }
                    }
                    console.log("Employee Role updated succesfully");
                    start();
                })
            })
        })
    })

};
  

updateEmployeeManager = () => {
    // Query to Database to retrieve all employees from the employees table
    selectSql = `
    SELECT id, CONCAT_WS(' ', first_name, last_name) AS Employee_Name FROM employee
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;
        employees = res;
    
        let employeeOptions = [];

        for (var i = 0; i < employees.length; i++) {
            employeeOptions.push(Object(employees[i]));
        }
        inquirer.prompt([
            {
                name: "updateManager",
                type: "list",
                message: "Select employee to be updated: ",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < employeeOptions.length; i++) {
                        choiceArray.push(employeeOptions[i].Employee_Name);
                    }
                    return choiceArray;
                }
            }
        ]).then(answer => {

            // Query employee table to retrieve the managers to build the manager array.
            selectSql = `
            SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS managers 
            FROM employee
            `
            connection.query(selectSql, (err, res) => {
                if (err) throw err;
                managers = res;

                let managerOptions = [];
                for (i = 0; i < managers.length; i++) {
                    managerOptions.push(Object(managers[i]));
                };
                for (i = 0; i < employeeOptions.length; i++) {
                    if (employeeOptions[i].Employee_Name === answer.updateManager) {
                        employeeSelected = employeeOptions[i].id
                    }
                }
                inquirer.prompt([
                    {
                        name: "newManager",
                        type: "list",
                        message: "Select a new manager:",
                        choices: function() {
                            var choiceArray = [];
                            for (var i = 0; i < managerOptions.length; i++) {
                                choiceArray.push(managerOptions[i].managers)
                            }
                            return choiceArray;
                        }
                    }
                ]).then(answer => {
                    for (i = 0; i < managerOptions.length; i++) {
                        if (answer.newManager === managerOptions[i].managers) {
                            newChoice = managerOptions[i].id
                            selectSql = `
                                UPDATE employee SET manager_id = ${newChoice} 
                                WHERE id = ${employeeSelected}
                            `
                            connection.query(selectSql), (err, res) => {
                                if (err) throw err;
                            };
                            console.log("Manager Updated Succesfully");
                        }
                    }
                    start();
                })
            })
        })
    })
};



deleteDepartment = () => {
    // Query department table to build department array
    connection.query("SELECT id, name FROM department", (err, res) => {
        if (err) throw err;
        departments = res;

        let departmentOptions = [];
        for (var i = 0; i < departments.length; i++) {
            departmentOptions.push(Object(departments[i]));
        }

        inquirer.prompt([
            {
                name: "deleteDepartment",
                type: "list",
                message: "Select a department to delete",
                choices: function() {
                var choiceArray = [];
                for (var i = 0; i < departmentOptions.length; i++) {
                    choiceArray.push(departmentOptions[i])
                }
                return choiceArray;
            }
            }
        ]).then(answer => {
            for (i = 0; i < departmentOptions.length; i++) {
                if (answer.deleteDepartment === departmentOptions[i].name) {
                    newChoice = departmentOptions[i].id

                    // Remove department from department table
                    connection.query(`DELETE FROM department Where id = ${newChoice}`), (err, res) => {
                        if (err) throw err;
                    };
                    console.log("Department: " + answer.deleteDepartment + " Deleted Succesfully");
                }
            }
            start();
        })
    })
};

deleteRole = () => {
    // Query role table to build role array
    connection.query("SELECT id, title FROM role", (err, res) => {
        if (err) throw err;
        roles = res;

        let role = [];
        for (var i = 0; i < roles.length; i++) {
            role.push(Object(roles[i]));
        }

        inquirer.prompt([
            {
                name: "deleteRole",
                type: "list",
                message: "Select a role to delete",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < role.length; i++) {
                        choiceArray.push(role[i].title)
                    }
                    return choiceArray;
                }
            }
        ]).then(answer => {
            for (i = 0; i < role.length; i++) {
                if (answer.deleteRole === role[i].title) {
                    newChoice = role[i].id

                    // Remove role from role table
                    connection.query(`DELETE FROM role Where id = ${newChoice}`), (err, res) => {
                        if (err) throw err;
                    };
                    console.log("Role: " + answer.deleteRole + " Deleted Succesfully");
                }
            }

            start();
        })
    })
};

deleteEmployee = () => {
    // Query employee table to build employee array
    selectSql = `
    SELECT id, CONCAT_WS(' ', first_name, last_name) AS Employee_Name FROM employee
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;
        employees = res;

        let employeeOptions = [];

        for (var i = 0; i < employees.length; i++) {
            employeeOptions.push(Object(employees[i]));
        }

        inquirer.prompt([
            {
                name: "deleteEmployee",
                type: "list",
                message: "Select a employee to delete",
                choices: function() {
                    var choiceArray = [];
                    for (var i = 0; i < employeeOptions.length; i++) {
                        choiceArray.push(employeeOptions[i].Employee_Name)
                    }
                    return choiceArray;
                }
            }
        ]).then(answer => {
            for (i = 0; i < employeeOptions.length; i++) {
                if (answer.deleteEmployee === employeeOptions[i].Employee_Name) {
                    newChoice = employeeOptions[i].id

                    // Remove employee from employee table
                    connection.query(`DELETE FROM employee Where id = ${newChoice}`), (err, res) => {
                        if (err) throw err;
                    };
                    console.log("Employee: " + answer.deleteEmployee + " Deleted Succesfully");
                }
            }

            start();
        })
    })
};