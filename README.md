# 📦 Inventory Management System

A web-based Inventory Management System built using **HTML, CSS, Bootstrap, and JavaScript**, powered by a **Mock JSON Server** as a backend.

This system helps small businesses manage products, suppliers, stock levels, and purchase orders with a structured workflow and real-time updates.

---

## 🚀 Live Features

### 🔐 Authentication

- Login page is the entry point of the system
- Basic validation before accessing the dashboard

---

### 📊 Dashboard

- Overview of inventory status
- Displays alerts (e.g., low stock)
- Quick navigation to all modules

---

### 📦 Product Management

- Add, edit, and delete products
- Unique SKU validation
- Assign category & supplier
- Track product quantity and price

---

### 🗂️ Categories

- Organize products into groups
- Simple CRUD operations

---

### 🚚 Suppliers

- Manage supplier details
- Link suppliers to products and orders

---

### 📥 Purchase Orders

- Create orders for restocking
- Status flow:
  - `Pending`
  - `Received`

- Stock updates only when order is received

---

### 📈 Inventory Tracking

- Prevent negative stock
- Automatic **low stock alerts**
- Real-time quantity updates

---

### ⚙️ Stock Adjustment

- Manual increase/decrease of stock
- Used for damaged items or corrections
- Validation ensures stock never goes below zero

---

### 📝 Logs System

- Tracks all actions:
  - Add / Update / Delete product
  - Purchase orders
  - Stock changes

- Includes timestamp and details

---

### 📊 Reports

- Low stock report
- Inventory value calculation:
  - `Total Value = price × quantity`

---

## 🔄 System Workflow

1. User logs in
2. Adds products with initial stock
3. Stock decreases over time
4. System detects low stock
5. User creates purchase order
6. Order stays **Pending**
7. When received:
   - Stock increases
   - Order marked **Received**

8. All actions are logged

---

## 📏 Business Rules

- ❌ Quantity cannot be negative
- 🔑 SKU must be unique
- 📦 Stock updates only when order is received
- ⚠️ Low stock alert when `quantity ≤ reorder level`
- 📝 All actions are logged

---

## 🛠️ Technologies Used

- HTML5
- CSS3
- Bootstrap
- JavaScript
- JSON Server (Mock REST API)

---

## 📁 Project Structure

```
Inventory-App/
│
├── index.html                        # Entry point (Login Page)
├── db.json                           # Mock database
├── package.json
├── package-lock.json
├── .gitignore
├── LICENSE
├── README.md
│
├── css/
│   ├── activity-log.css
│   ├── categories.css
│   ├── dashboard.css
│   ├── inventory.css
│   ├── main.css
│   ├── products.css
│   ├── purchase-orders.css
│   └── suppliers.css
│
├── js/
│   ├── auth/
│   │   ├── authentication.js
│   │   └── getUser.js
│   ├── features/
│   │   ├── categories.js
│   │   ├── login.js
│   │   ├── logs.js
│   │   ├── products.js
│   │   ├── purchase-orders.js
│   │   ├── reports.js
│   │   ├── stock-adjustment.js
│   │   └── suppliers.js
│   ├── services/
│   │   ├── categories-services.js
│   │   ├── logs-services.js
│   │   ├── products-services.js
│   │   ├── purchase-orders-services.js
│   │   ├── suppliers-services.js
│   │   └── users-services.js
│   └── main.js
│
└── pages/
    ├── activity-log.html
    ├── categories.html
    ├── dashboard.html
    ├── navbar.html
    ├── products.html
    ├── purchase-orders.html
    ├── reports.html
    ├── stock-adjustment.html
    └── suppliers.html
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/thehendawy/Inventory-App.git
cd Inventory-App
```

### 2️⃣ Install JSON Server

```bash
npm install -g json-server
```

### 3️⃣ Run the backend

```bash
npm run dev
```

### 4️⃣ Run the project

- Open `index.html` in your browser

## 👨‍💻 Team members

1. Ahmed Elhendawy

2. Ahmed Mohamed

3. Ahmed Samir

4. Shorok Magdy
