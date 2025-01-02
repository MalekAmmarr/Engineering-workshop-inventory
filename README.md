# Engineering Workshop Inventory

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Future Improvements](#future-improvements)

## Introduction
The Equipment Management System is a web-based application designed to manage and track equipment details, categories, suppliers, and user activities. It allows admin users to perform CRUD operations on equipment and users, while regular users can view, rate, and manage equipment in their carts.

## Features
- **Admin Features**:
  - Add, update, delete, and view equipment.
  - Add, update, delete, and view users.
  - View equipment ratings.

- **User Features**:
  - Search and filter equipment by name, category, supplier, and status.
  - Add equipment to the cart.
  - View and place orders.
  - Rate equipment.

- **General**:
  - Authentication and authorization using JSON Web Tokens (JWT).
  - Secure API access with role-based permissions.
  - Responsive user interface using Bootstrap.

## Technologies Used
- **Frontend**:
  - HTML5, CSS3
  - JavaScript
  - Bootstrap 5

- **Backend**:
  - Node.js
  - Express.js

- **Database**:
  - PostgreSQL

- **Authentication**:
  - JSON Web Tokens (JWT)

## Installation
### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- Git

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/MalekAmmarr/Engineering-workshop-inventory.git
   cd Engineering-workshop-inventory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database (e.g., `equipment_db`).
   - Import the SQL schema into the database.
  ```bash
  npm run seed
  ```

4. Configure environment variables:
   Create a `.env` file in the project root and add the following:
   ```env
   PORT=3000
   JWT_SECRET=your_secret_key
   DATABASE_URL=your_database_connection_string
   ```

5. Start the server:
   ```bash
   npm start
   ```

6. Open the application in your browser at `http://localhost:3000`.

## Usage
### Admin User
1. Log in with admin credentials.
2. Manage equipment and users via the dashboard.
3. View equipment ratings.

### Regular User
1. Log in with user credentials.
2. Search, filter, and view equipment.
3. Add equipment to the cart and place orders.
4. Rate equipment.

## API Endpoints
### Public Endpoints
- `POST /api/v1/auth/login` - Log in to the system.
- `POST /api/v1/auth/register` - Register a new user.

### Protected Endpoints
#### Equipment
- `GET /api/v1/equipment` - View all equipment.
- `POST /api/v1/equipment/new` - Add new equipment (Admin only).
- `PUT /api/v1/equipment/:id` - Update equipment details (Admin only).
- `DELETE /api/v1/equipment/:id` - Delete equipment (Admin only).

#### Users
- `GET /api/v1/users/view` - View all users (Admin only).
- `PUT /api/v1/users/:id` - Update user details (Admin only).
- `DELETE /api/v1/users/:id` - Delete user (Admin only).

#### Ratings
- `GET /api/v1/ratings/view` - View all ratings.
- `POST /api/v1/rating/new` - Add a new rating.

#### Cart
- `POST /api/v1/cart/new` - Add item to cart.
- `GET /api/v1/cart/view` - View cart items.
- `POST /api/v1/cart/remove-item` - Remove an item from the cart.

#### Orders
- `POST /api/v1/order/new` - Place an order.
- `GET /api/v1/orders/view` - View all orders.

## Future Improvements
- Add more detailed reports and analytics for admin users.
- Implement notifications for low stock or critical actions.
- Add multi-language support.
- Enhance the UI/UX with advanced animations and responsiveness.

---

For more information, feel free to reach out or create an issue in the repository!

