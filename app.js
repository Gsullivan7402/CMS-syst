const mysql = require('mysql2');
import('inquirer').then(inquirerModule => {
  const inquirer = inquirerModule.default;
  mainMenu(inquirer); // Start the application by showing the main menu
}).catch(error => {
  console.error('Error loading Inquirer:', error);
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass',
  database: 'seeds' // Change this to your actual database name
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

function mainMenu(inquirer) {
  inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Delete a department', 
        'Delete a role',       
        'Delete an employee',  
        'Exit'
      ],
    }
  ]).then((answers) => {
    switch(answers.action) {
      case 'View all departments':
        viewAllDepartments(inquirer);
        break;
      case 'View all roles':
        viewAllRoles(inquirer);
        break;
      case 'View all employees':
        viewAllEmployees(inquirer);
        break;
      case 'Add a department':
        addDepartment(inquirer);
        break;
      case 'Add a role':
        addRole(inquirer);
        break;
      case 'Add an employee':
        addEmployee(inquirer);
        break;
      case 'Update an employee role':
        updateEmployeeRole(inquirer);
        break;
      case 'Delete a department': // Handle deletion of a department
        deleteDepartment(inquirer);
        break;
      case 'Delete a role': // Handle deletion of a role
        deleteRole(inquirer);
        break;
      case 'Delete an employee': // Handle deletion of an employee
        deleteEmployee(inquirer);
        break;
      case 'Exit':
        console.log('Exiting the application.');
        connection.end();
        break;
      default:
        console.error('Invalid option selected.');
        mainMenu(inquirer); // Show the menu again for invalid options
    }
  }).catch(error => {
    console.error('Error:', error);
    mainMenu(inquirer); // Ensure inquirer is passed back in case of error
  });
}


function viewAllDepartments(inquirer) {
  const query = `SELECT * FROM department`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    mainMenu(inquirer);
  });
}

function viewAllRoles(inquirer) {
  const query = `SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    mainMenu(inquirer);
  });
}

function viewAllEmployees(inquirer) {
  const query = `
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
    FROM employee e
    LEFT JOIN employee m ON e.manager_id = m.id
    INNER JOIN role ON e.role_id = role.id
    INNER JOIN department ON role.department_id = department.id
  `;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    mainMenu(inquirer);
  });
}

function addDepartment(inquirer) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department you want to add?'
    }
  ]).then(answer => {
    const query = 'INSERT INTO department (name) VALUES (?)';
    connection.query(query, [answer.departmentName], (err, res) => {
      if (err) {
        console.error('Error adding department:', err);
        return mainMenu(inquirer); // Return to the main menu if an error occurs
      }
      console.log(`${answer.departmentName} department added successfully.`);
      mainMenu(inquirer);
    });
  }).catch(error => {
    console.error('Error during the department addition process:', error);
    mainMenu(inquirer);
  });
}


function addRole(inquirer) {
  // Fetch departments to let the user choose one for the new role
  connection.query('SELECT id, name FROM department', (err, departments) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return mainMenu(inquirer); // Return to the main menu if an error occurs
    }
    
    inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'What is the title of the new role?'
      },
      {
        type: 'input',
        name: 'salary',
        message: 'What is the salary of the new role?'
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department does this role belong to?',
        choices: departments.map(department => ({
          name: department.name,
          value: department.id
        }))
      }
    ]).then(answer => {
      const query = 'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)';
      connection.query(query, [answer.title, answer.salary, answer.departmentId], (err, res) => {
        if (err) {
          console.error('Error adding role:', err);
          return mainMenu(inquirer); // Return to the main menu if an error occurs
        }
        console.log(`Role ${answer.title} added successfully.`);
        mainMenu(inquirer);
      });
    }).catch(error => {
      console.error('Error during the role addition process:', error);
      mainMenu(inquirer);
    });
  });
}


function addEmployee(inquirer) {
  // Parallel queries to fetch roles and employees for the manager selection
  const fetchRolesQuery = 'SELECT id, title FROM role';
  const fetchManagersQuery = 'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee WHERE manager_id IS NULL';

  connection.query(fetchRolesQuery, (err, roles) => {
    if (err) {
      console.error('Error fetching roles:', err);
      return mainMenu(inquirer); // Return to the main menu if an error occurs
    }

    connection.query(fetchManagersQuery, (err, managers) => {
      if (err) {
        console.error('Error fetching managers:', err);
        return mainMenu(inquirer); // Return to the main menu if an error occurs
      }

      inquirer.prompt([
        {
          type: 'input',
          name: 'firstName',
          message: "What is the employee's first name?"
        },
        {
          type: 'input',
          name: 'lastName',
          message: "What is the employee's last name?"
        },
        {
          type: 'list',
          name: 'roleId',
          message: "What is the employee's role?",
          choices: roles.map(role => ({
            name: role.title,
            value: role.id
          }))
        },
        {
          type: 'list',
          name: 'managerId',
          message: "Who is the employee's manager?",
          choices: [
            {name: 'None', value: null},
            ...managers.map(manager => ({
              name: manager.name,
              value: manager.id
            }))
          ]
        }
      ]).then(answer => {
        const query = 'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)';
        connection.query(query, [answer.firstName, answer.lastName, answer.roleId, answer.managerId], (err, res) => {
          if (err) {
            console.error('Error adding employee:', err);
            return mainMenu(inquirer); // Return to the main menu if an error occurs
          }
          console.log(`Employee ${answer.firstName} ${answer.lastName} added successfully.`);
          mainMenu(inquirer);
        });
      }).catch(error => {
        console.error('Error during the employee addition process:', error);
        mainMenu(inquirer);
      });
    });
  });
}

function updateEmployeeRole(inquirer) {
  // Fetch all employees to allow the user to choose one
  connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
    if (err) {
      console.error('Error fetching employees:', err);
      return mainMenu(inquirer);
    }

    inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee\'s role do you want to update?',
        choices: employees.map(employee => ({
          name: employee.name,
          value: employee.id
        }))
      }
    ]).then(employeeAnswer => {
      // Fetch all roles for the next prompt
      connection.query('SELECT id, title FROM role', (err, roles) => {
        if (err) {
          console.error('Error fetching roles:', err);
          return mainMenu(inquirer);
        }

        inquirer.prompt([
          {
            type: 'list',
            name: 'roleId',
            message: 'What is the new role?',
            choices: roles.map(role => ({
              name: role.title,
              value: role.id
            }))
          }
        ]).then(roleAnswer => {
          // Update the employee's role
          const query = 'UPDATE employee SET role_id = ? WHERE id = ?';
          connection.query(query, [roleAnswer.roleId, employeeAnswer.employeeId], (err, res) => {
            if (err) {
              console.error('Error updating employee role:', err);
              return mainMenu(inquirer);
            }
            console.log('Employee role updated successfully.');
            mainMenu(inquirer);
          });
        }).catch(error => {
          console.error('Error during the role update process:', error);
          mainMenu(inquirer);
        });
      });
    }).catch(error => {
      console.error('Error during the employee selection process:', error);
      mainMenu(inquirer);
    });
  });
}

function deleteDepartment(inquirer) {
  connection.query('SELECT id, name FROM department', (err, departments) => {
    if (err) throw err;

    inquirer.prompt([
      {
        type: 'list',
        name: 'departmentId',
        message: 'Which department would you like to delete?',
        choices: departments.map(department => ({
          name: department.name,
          value: department.id
        }))
      }
    ]).then(answer => {
      const query = 'DELETE FROM department WHERE id = ?';
      connection.query(query, [answer.departmentId], (err, res) => {
        if (err) {
          console.error('Error deleting department:', err);
          return mainMenu(inquirer);
        }
        console.log('Department deleted successfully.');
        mainMenu(inquirer);
      });
    });
  });
}

function deleteRole(inquirer) {
  connection.query('SELECT id, title FROM role', (err, roles) => {
    if (err) throw err;

    inquirer.prompt([
      {
        type: 'list',
        name: 'roleId',
        message: 'Which role would you like to delete?',
        choices: roles.map(role => ({
          name: role.title,
          value: role.id
        }))
      }
    ]).then(answer => {
      const query = 'DELETE FROM role WHERE id = ?';
      connection.query(query, [answer.roleId], (err, res) => {
        if (err) {
          console.error('Error deleting role:', err);
          return mainMenu(inquirer);
        }
        console.log('Role deleted successfully.');
        mainMenu(inquirer);
      });
    });
  });
}

function deleteEmployee(inquirer) {
  connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', (err, employees) => {
    if (err) throw err;

    inquirer.prompt([
      {
        type: 'list',
        name: 'employeeId',
        message: 'Which employee would you like to delete?',
        choices: employees.map(employee => ({
          name: employee.name,
          value: employee.id
        }))
      }
    ]).then(answer => {
      const query = 'DELETE FROM employee WHERE id = ?';
      connection.query(query, [answer.employeeId], (err, res) => {
        if (err) {
          console.error('Error deleting employee:', err);
          return mainMenu(inquirer);
        }
        console.log('Employee deleted successfully.');
        mainMenu(inquirer);
      });
    });
  });
}
