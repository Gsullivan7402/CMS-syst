const mysql = require('mysql2');

// Dynamic import for Inquirer
import('inquirer').then(inquirerModule => {
  const inquirer = inquirerModule.default; // Accessing the default export
  // Use Inquirer as usual
  runPrompt(inquirer); // Pass inquirer to runPrompt function
}).catch(error => {
  // Handle errors if the import fails
  console.error('Error loading Inquirer:', error);
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass',
  database: 'seeds'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Define runPrompt function with inquirer as a parameter
function runPrompt(inquirer) {
  if (!inquirer) {
    console.error('Inquirer not available.');
    return;
  }

  inquirer.prompt([
    {
      type: 'input',
      name: 'userName',
      message: 'What is your name?',
    }
  ]).then(answers => {
    console.log(`Hello, ${answers.userName}! Welcome to the application.`);
  }).catch(error => {
    console.error('Error while prompting:', error);
  });
}
