const mysql = require('mysql2');
// Change the require statement for Inquirer to a dynamic import
import('inquirer').then(inquirer => {
  // Now you can use Inquirer as usual
  // For example:
  inquirer.prompt([
      /* Your prompt questions and logic here */
  ]);
}).catch(error => {
  // Handle errors if the import fails
  console.error('Error loading Inquirer:', error);
});


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database_name'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database.');
  runPrompt();
});
