function runPrompt() {
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
        ]
      }
    ]).then(answers => {
      switch (answers.action) {
        case 'View all departments':
          viewDepartments();
          break;
        // Add cases for each action
        case 'Exit':
          connection.end();
          break;
        default:
          console.log(`Invalid action: ${answers.action}`);
          break;
      }
    });
  }
  function viewDepartments() {
    connection.query('SELECT * FROM department', (err, results) => {
      if (err) throw err;
      console.table(results);
      runPrompt(); // Return to the main menu after displaying results
    });
  }
  