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
        'Exit'
      ],
    }
  ]).then((answers) => {
    switch(answers.action) {
      case 'View all departments':
        viewAllDepartments();
        break;
      case 'View all roles':
        viewAllRoles();
        break;
      case 'View all employees':
        viewAllEmployees();
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
  });
}

function viewAllDepartments() {
  const query = `SELECT * FROM department`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    mainMenu(inquirer);
  });
}

function viewAllRoles() {
  const query = `SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id`;
  connection.query(query, (err, res) => {
    if (err) throw err;
    console.log("\n");
    console.table(res);
    mainMenu(inquirer);
  });
}

function viewAllEmployees() {
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

function addDepartment() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'departmentName',
      message: 'What is the name of the department you want to add?'
    }
  ]).then(answer => {
    const query = 'INSERT INTO department (name) VALUES (?)';
    connection.query(query, [answer.departmentName], (err, res) => {
      if (err) throw err;
      console.log(`${answer.departmentName} department added successfully.`);
      mainMenu();
    });
  }).catch(error => {
    console.error('Error adding department:', error);
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


function addEmployee() {
  // Get roles for the choices
  connection.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;

    // Assuming you have roles to choose from
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
     
    ]).then(answer => {
      const query = 'INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)';
      connection.query(query, [answer.firstName, answer.lastName, answer.roleId], (err, res) => {
        if (err) throw err;
        console.log(`Employee ${answer.firstName} ${answer.lastName} added successfully.`);
        mainMenu();
      });
    }).catch(error => {
      console.error('Error adding employee:', error);
    });
  });
}

