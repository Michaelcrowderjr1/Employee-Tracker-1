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
  getDepartments();
  getRoles();
  getManagers();
  getEmployees();
});

start = () => {

    inquirer.prompt({
        name: "choices",
        type: "list",
        message: "Main Menu - Choose Option?",
        choices: ["ADD", "VIEW", "UPDATE", "DELETE", "EXIT"]
    })
    .then(function(answer) {
        // Call appropriate function based on answer selected or end
        if (answer.choices === "ADD") {
            addFunction();
        }
        else if (answer.choices === "VIEW") {
            viewFunction();
        } 
        else if (answer.choices === "UPDATE") {
            updateFunction();
        }
        else if (answer.choices === "DELETE") {
            deleteFunction();
        }
        else {
            connection.end();
        }
    });
}

getRoles = () => {
    connection.query("SELECT id, title FROM role", (err, res) => {
      if (err) throw err;
      roles = res;
    })
};
  
getDepartments = () => {
    connection.query("SELECT id, name FROM department", (err, res) => {
        if (err) throw err;
        departments = res;
    })
};
  
getManagers = () => {
    selectSql = `
      SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS managers 
      FROM employee
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;
        managers = res;
    })
};
  
getEmployees = () => {
    selectSql = `
      SELECT id, CONCAT_WS(' ', first_name, last_name) AS Employee_Name FROM employee
    `
    connection.query(selectSql, (err, res) => {
        if (err) throw err;
        employees = res;
    })
};
  
addFunction = () => {
    inquirer.prompt([
        // Give options to choose which table you want to add to
        {
            name: "add",
            type: "list",
            message: "Add Menu - What do you want to add?",
            choices: ["DEPARTMENT", "ROLE", "EMPLOYEE", "EXIT"]
        }
    ]).then(function(answer) {
        if (answer.add === "DEPARTMENT") {
            console.log("Add a new: " + answer.add);
            addDepartment();
        }
        else if (answer.add === "ROLE") {
            console.log("Add a new: " + answer.add);
            addRole();
        }
        else if (answer.add === "EMPLOYEE") {
            console.log("Add a new: " + answer.add);
            addEmployee();
        } 
        else {
            connection.end();
        }
    })
};
  
addDepartment = () => {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "Enter department to be added: "
        }
    ]).then(function(answer) {
          connection.query(`INSERT INTO department (name) VALUES ('${answer.department}')`, (err, res) => {
              if (err) throw err;
              console.log("New Department added: " + answer.department);
              getDepartments();
              start();
          }) 
    })
};

addRole = () => {
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
        selectSql = `
            INSERT INTO role (title, salary, department_id) VALUES
            ('${answer.title}', '${answer.salary}', ${department_id})
        `
        connection.query(selectSql, (err, res) => {
            if (err) throw err;

            console.log("New Role added: " + answer.title);
            getRoles();
            start();
        }) 
    })
};

addEmployee = () => {
    getRoles();
    getManagers();
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
          selectSql = `
              INSERT INTO employee (first_name, last_name, role_id, manager_id)
              VALUES ('${answer.first_name}', '${answer.last_name}', ${role_id}, ${manager_id})
          `
          connection.query(selectSql, (err, res) => {
              if (err) throw err;

              console.log("New employee added: " + answer.first_name + " " + answer.last_name);
              getEmployees();
              start()
          }) 
      })
};

viewFunction = () => {
    inquirer.prompt([
        // Give options to choose which report to display
        {
            name: "view",
            type: "list",
            message: "What would you like to view?",
            choices: ["DEPARTMENTS", "ROLES", "EMPLOYEES", "EMPLOYEES BY MANAGER", "DEPARTMENT SALARIES", "EXIT"]
        }
    ]).then(answer => {
        if (answer.view === "DEPARTMENTS") {
            console.log('\r\n');
            viewAllDepartments();
        }
        else if (answer.view === "ROLES") {
            console.log('\r\n');
            viewAllRoles();
        }
        else if (answer.view === "EMPLOYEES") {
            console.log('\r\n');
            viewEmployees();
        }
        else if (answer.view === "EMPLOYEES BY MANAGER") {
            console.log('\r\n');
            viewEmployeesByManager();
        }
        else if (answer.view === "DEPARTMENT SALARIES") {
            console.log('\r\n');
            viewDeptSalary();
        }
        else {
            connection.end();
        }
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

viewEmployees = () => {
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

updateFunction = () => {
    inquirer.prompt([
        // Give options to choose what to change on the employee record
        {
            name: "update",
            type: "list",
            message: "Choose option to update:",
            choices: ["Update employee roles", "Update employee managers", "EXIT"]
        }
      ]).then(answer => {
        if (answer.update === "Update employee roles") {
            updateEmployeeRole();
        }
        else if (answer.update === "Update employee managers") {
            updateEmployeeManager();
        }
        else {
            connection.end();
        }
    })
};

updateEmployeeRole = () => {
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
                selectSql = `
                    UPDATE employee SET role_id = ${newChoice} 
                    WHERE id = ${employeeSelected}
                `
                connection.query(selectSql), (err, res) => {
                  if (err) throw err;
                };
              }
            }
            console.log("Role updated succesfully");
            getEmployees();
            getRoles();
            start();
        })
    })
};
  

updateEmployeeManager = () => {
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
        getEmployees();
        getManagers();
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
            getEmployees();
            getManagers();
            start();
        })
    })
};

deleteFunction = () => {
    // Give options to choose what type of record the user wants to delete
    inquirer.prompt([
        {
            name: "delete",
            type: "list",
            message: "Select option to delete:",
            choices: ["Delete department", "Delete role", "Delete employee", "EXIT"]
        }
    ]).then(answer => {
        if (answer.delete === "Delete department") {
            deleteDepartment();
        }
        else if (answer.delete === "Delete role") {
            deleteRole();
        }
        else if (answer.delete === "Delete employee") {
            deleteEmployee();
        } else {
            connection.end();
        }
    })
};

deleteDepartment = () => {
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
              connection.query(`DELETE FROM department Where id = ${newChoice}`), (err, res) => {
                  if (err) throw err;
              };
              console.log("Department: " + answer.deleteDepartment + " Deleted Succesfully");
          }
      }
      getDepartments();
      start();
  })
};

deleteRole = () => {
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
                connection.query(`DELETE FROM role Where id = ${newChoice}`), (err, res) => {
                    if (err) throw err;
                };
                console.log("Role: " + answer.deleteRole + " Deleted Succesfully");
            }
        }
        getRoles();
        start();
    })
};

deleteEmployee = () => {
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
                  connection.query(`DELETE FROM employee Where id = ${newChoice}`), (err, res) => {
                      if (err) throw err;
                  };
                  console.log("Employee: " + answer.deleteEmployee + " Deleted Succesfully");
              }
          }
          getEmployees();
          start();
    })
};