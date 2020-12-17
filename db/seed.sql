USE employee_db;
INSERT INTO department (name)
VALUES 
("IT"),
("Sales"),
("Engineering"),
("Finance"),
("Human Resources"),
("Upper Level Management");

INSERT INTO role (title, salary, department_id)
VALUES
("Site Reliability Engineer", 86000, 1),
("IT Manager",100000,1),
("Database Admin",65000,1),
("Recruitment Specialist",60000,5),
("Work Force Coordinator",50000,5),
("Payroll Administrator",55000,4),
("Data Center Analyst",60000,1),
("Systems Analyst",60000,1),
("Engineer",80000,3),
("Senior Engineer",90000,3),
("Full Stack Developer",90000, 1),
("Sales Representive",50000, 2),
("CEO", 200000, 6); 

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Richard", "Harrison",13,null),
("Douglas","Smith",12,1),
("Mason", "Davis",11,4),
("Jennifer","Anston",2,1),
("Billy","Bennett",1,4),
("Ronald","McDermot",5,1),
("Susan","Boyle",6,1),
("Greg","Richards",7,4),
("Marissa","Roberts",8,4),
("Meghan","Frost",10,1),
("Thomas","Little",4,1),
("Jeffrey","Williams",11,1),
("Markus","Apple",9,10),
("Paul","Forester",3,4);