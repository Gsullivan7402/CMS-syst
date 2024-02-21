-- Sample departments
INSERT INTO department (name) VALUES
('Engineering'),
('Sales'),
('Marketing'),
('Finance');

-- Sample roles
INSERT INTO role (title, salary, department_id) VALUES
('Software Engineer', 80000, 1),
('Sales Manager', 90000, 2),
('Marketing Coordinator', 60000, 3),
('Financial Analyst', 75000, 4);

-- Sample employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, NULL),
('Michael', 'Johnson', 3, NULL),
('Emily', 'Williams', 4, NULL);
