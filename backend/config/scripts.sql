-- ===================================================
-- Create schema "Project" if it doesn't already exist
-- ===================================================
CREATE SCHEMA IF NOT EXISTS "Project";

-- ===================================================
-- Drop existing tables in reverse dependency order
-- ===================================================
DROP TABLE IF EXISTS "Project"."EquipmentOrder";
DROP TABLE IF EXISTS "Project"."Rating";
DROP TABLE IF EXISTS "Project"."Cart";
DROP TABLE IF EXISTS "Project"."Orders";
DROP TABLE IF EXISTS "Project"."Equipments";
DROP TABLE IF EXISTS "Project"."Users";
DROP TABLE IF EXISTS "Project"."Suppliers";
DROP TABLE IF EXISTS "Project"."Categories";

-- ===================================================
-- Create Categories table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Categories" (
    category_ID SERIAL PRIMARY KEY,           -- Primary key
    category_name TEXT NOT NULL               -- Name of the category
);

-- ===================================================
-- Create Suppliers table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Suppliers" (
    supplier_ID SERIAL PRIMARY KEY,           -- Primary key
    supplier_name TEXT NOT NULL,              -- Supplier name
    contact_info TEXT,                        -- Contact details
    address TEXT                              -- Supplier address
);

-- ===================================================
-- Create Users table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Users" (
    user_ID SERIAL PRIMARY KEY,               -- Primary key
    username TEXT UNIQUE NOT NULL,            -- Unique username
    email TEXT UNIQUE NOT NULL,               -- Unique email
    password TEXT NOT NULL,                   -- Hashed password
    role TEXT NOT NULL,                       -- Role (e.g., admin, standard_user)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for account creation
);

-- ===================================================
-- Create Equipments table with additional category_name and supplier_name columns
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Equipments" (
    equipment_ID SERIAL PRIMARY KEY,          -- Primary key
    equipment_name TEXT NOT NULL,             -- Name of the equipment
    equipment_img TEXT,                       -- Image of the equipment
    rating INTEGER NOT NULL DEFAULT 5,        -- Default rating of 5
    model_number INTEGER,                     -- Model or serial number
    purchase_date DATE,                       -- Date of purchase
    quantity INTEGER NOT NULL CHECK (quantity >= 0), -- Quantity >= 0
    status TEXT CHECK (status IN ('Available', 'In Use', 'Under Maintenance')), -- Status validation
    location TEXT,                            -- Location of the equipment
    category_ID INTEGER,                      -- Foreign key referencing Categories table
    supplier_ID INTEGER,                      -- Foreign key referencing Suppliers table
    category_name TEXT,                       -- Category name (to store)
    supplier_name TEXT,                       -- Supplier name (to store)

    -- Foreign key constraints
    CONSTRAINT fk_equipment_category FOREIGN KEY (category_ID)
        REFERENCES "Project"."Categories"(category_ID) ON DELETE SET NULL,
    CONSTRAINT fk_equipment_supplier FOREIGN KEY (supplier_ID)
        REFERENCES "Project"."Suppliers"(supplier_ID) ON DELETE SET NULL
);

-- ===================================================
-- Create Orders table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Orders" (
    order_ID SERIAL PRIMARY KEY,              -- Primary key
    user_ID INTEGER NOT NULL,                 -- Foreign key referencing Users table
    date DATE DEFAULT CURRENT_DATE,           -- Date of order placement

    -- Foreign key constraint
    CONSTRAINT fk_order_user FOREIGN KEY (user_ID)
        REFERENCES "Project"."Users"(user_ID) ON DELETE CASCADE
);

-- ===================================================
-- Create Cart table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Cart" (
    cart_ID SERIAL PRIMARY KEY,               -- Primary key
    user_ID INTEGER NOT NULL,                 -- Foreign key referencing Users table
    equipment_ID INTEGER NOT NULL,            -- Foreign key referencing Equipments table
    quantity INTEGER NOT NULL CHECK (quantity > 0), -- Quantity > 0

    -- Foreign key constraints
    CONSTRAINT fk_cart_user FOREIGN KEY (user_ID)
        REFERENCES "Project"."Users"(user_ID) ON DELETE CASCADE,
    CONSTRAINT fk_cart_equipment FOREIGN KEY (equipment_ID)
        REFERENCES "Project"."Equipments"(equipment_ID) ON DELETE CASCADE
);

-- ===================================================
-- Create Rating table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."Rating" (
    rating_ID SERIAL PRIMARY KEY,             -- Primary key
    user_ID INTEGER NOT NULL,                 -- Foreign key referencing Users table
    equipment_ID INTEGER NOT NULL,            -- Foreign key referencing Equipments table
    comment TEXT,                             -- Rating comment
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5), -- Score between 1 and 5

    -- Foreign key constraints
    CONSTRAINT fk_rating_user FOREIGN KEY (user_ID)
        REFERENCES "Project"."Users"(user_ID) ON DELETE CASCADE,
    CONSTRAINT fk_rating_equipment FOREIGN KEY (equipment_ID)
        REFERENCES "Project"."Equipments"(equipment_ID) ON DELETE CASCADE
);

-- ===================================================
-- Create EquipmentOrder table
-- ===================================================
CREATE TABLE IF NOT EXISTS "Project"."EquipmentOrder" (
    order_ID INTEGER NOT NULL,                -- Foreign key referencing Orders table
    equipment_ID INTEGER NOT NULL,            -- Foreign key referencing Equipments table
    quantity INTEGER NOT NULL CHECK (quantity > 0), -- Quantity > 0

    -- Composite primary key
    PRIMARY KEY (order_ID, equipment_ID),

    -- Foreign key constraints
    CONSTRAINT fk_order FOREIGN KEY (order_ID)
        REFERENCES "Project"."Orders"(order_ID) ON DELETE CASCADE,
    CONSTRAINT fk_order_equipment FOREIGN KEY (equipment_ID)
        REFERENCES "Project"."Equipments"(equipment_ID) ON DELETE CASCADE
);

-- ===================================================
-- Populate category_name and supplier_name from related tables
-- ===================================================
-- Update Equipments table to populate category_name and supplier_name from related tables
UPDATE "Project"."Equipments" 
SET 
    category_name = c.category_name,
    supplier_name = s.supplier_name
FROM "Project"."Categories" c, "Project"."Suppliers" s
WHERE "Project"."Equipments".category_ID = c.category_ID
AND "Project"."Equipments".supplier_ID = s.supplier_ID;


-- ===================================================
-- Verify table creation
-- ===================================================
SELECT 'Tables Created Successfully!' AS Status;
