-- ===================================================
-- Insert data into Categories table
-- ===================================================
INSERT INTO "Project"."Categories" (category_name) VALUES
('Mechanical'),
('Electrical'),
('Civil'),
('IT');

-- ===================================================
-- Insert data into Suppliers table
-- ===================================================
INSERT INTO "Project"."Suppliers" (supplier_name, contact_info, address) VALUES
('ABC Supplies', '123-456-7890', '123 Main St, Cityville'),
('Global Tools Ltd.', '987-654-3210', '456 Industrial Rd, Townsville'),
('Tech Innovators', '555-333-1111', '789 Tech Park, Technocity');

-- ===================================================
-- Insert data into Users table
-- ===================================================
INSERT INTO "Project"."Users" (username, email, password, role) VALUES
('admin1', 'admin1@example.com', 'hashed_password_123', 'admin'),
('user1', 'user1@example.com', 'hashed_password_456', 'standard'),
('user2', 'user2@example.com', 'hashed_password_789', 'standard');

-- ===================================================
-- Insert data into Equipments table (with category_ID and supplier_ID)
-- ===================================================
INSERT INTO "Project"."Equipments" (
    equipment_name, 
    equipment_img, 
    rating, 
    model_number, 
    purchase_date, 
    quantity, 
    status, 
    location, 
    category_ID, 
    supplier_ID,
    category_name, 
    supplier_name
) VALUES
('Electric Drill', '../images/electricDrill.jpg', 5, 101, '2024-01-15', 10, 'Available', 'Warehouse A', 
    (SELECT category_ID FROM "Project"."Categories" WHERE category_name = 'Mechanical'),
    (SELECT supplier_ID FROM "Project"."Suppliers" WHERE supplier_name = 'ABC Supplies'),
    'Mechanical', 'ABC Supplies'),
('Welding Machine', '../images/weldingMachine.jpg', 4, 102, '2023-12-10', 5, 'In Use', 'Workshop 1', 
    (SELECT category_ID FROM "Project"."Categories" WHERE category_name = 'Mechanical'),
    (SELECT supplier_ID FROM "Project"."Suppliers" WHERE supplier_name = 'Global Tools Ltd.'),
    'Mechanical', 'Global Tools Ltd.'),
('Laptop', '../images/laptop.jpg', 5, 103, '2024-02-01', 15, 'Available', 'Office 2', 
    (SELECT category_ID FROM "Project"."Categories" WHERE category_name = 'IT'),
    (SELECT supplier_ID FROM "Project"."Suppliers" WHERE supplier_name = 'Tech Innovators'),
    'IT', 'Tech Innovators');

-- ===================================================
-- Insert data into Orders table (using FK references)
-- ===================================================
INSERT INTO "Project"."Orders" (user_ID, date) VALUES
((SELECT user_ID FROM "Project"."Users" WHERE username = 'admin1'), '2024-02-10'),
((SELECT user_ID FROM "Project"."Users" WHERE username = 'user1'), '2024-02-12'),
((SELECT user_ID FROM "Project"."Users" WHERE username = 'user2'), '2024-02-15');

-- ===================================================
-- Insert data into Cart table (using FK references)
-- ===================================================
INSERT INTO "Project"."Cart" (user_ID, equipment_ID, quantity) VALUES
((SELECT user_ID FROM "Project"."Users" WHERE username = 'user1'),
 (SELECT equipment_ID FROM "Project"."Equipments" WHERE equipment_name = 'Electric Drill'), 2),
((SELECT user_ID FROM "Project"."Users" WHERE username = 'user2'),
 (SELECT equipment_ID FROM "Project"."Equipments" WHERE equipment_name = 'Laptop'), 1);

-- ===================================================
-- Insert data into Rating table (using FK references)
-- ===================================================
INSERT INTO "Project"."Rating" (user_ID, equipment_ID, comment, score) VALUES
((SELECT user_ID FROM "Project"."Users" WHERE username = 'user1'),
 (SELECT equipment_ID FROM "Project"."Equipments" WHERE equipment_name = 'Electric Drill'), 
 'Very effective tool for drilling', 5),
((SELECT user_ID FROM "Project"."Users" WHERE username = 'user2'),
 (SELECT equipment_ID FROM "Project"."Equipments" WHERE equipment_name = 'Laptop'), 
 'Highly recommend for office work', 5);

-- ===================================================
-- Insert data into EquipmentOrder table (using FK references)
-- ===================================================
INSERT INTO "Project"."EquipmentOrder" (order_ID, equipment_ID, quantity) VALUES
((SELECT order_ID FROM "Project"."Orders" WHERE user_ID = (SELECT user_ID FROM "Project"."Users" WHERE username = 'admin1')),
 (SELECT equipment_ID FROM "Project"."Equipments" WHERE equipment_name = 'Electric Drill'), 2),
((SELECT order_ID FROM "Project"."Orders" WHERE user_ID = (SELECT user_ID FROM "Project"."Users" WHERE username = 'user1')),
 (SELECT equipment_ID FROM "Project"."Equipments" WHERE equipment_name = 'Laptop'), 1);
