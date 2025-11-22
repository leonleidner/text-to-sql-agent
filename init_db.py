import sqlite3
import random
from datetime import datetime, timedelta

def create_connection(db_file):
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Exception as e:
        print(e)
    return conn

def create_tables(conn):
    # Drop tables if they exist to ensure clean state
    c = conn.cursor()
    c.execute("DROP TABLE IF EXISTS sales")
    c.execute("DROP TABLE IF EXISTS products")
    c.execute("DROP TABLE IF EXISTS regions")
    c.execute("DROP TABLE IF EXISTS customers")
    c.execute("DROP TABLE IF EXISTS employees")
    c.execute("DROP TABLE IF EXISTS campaigns")

    create_products_sql = """
    CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL
    );
    """
    
    create_regions_sql = """
    CREATE TABLE regions (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    );
    """
    
    create_customers_sql = """
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        segment TEXT NOT NULL, -- Enterprise, SMB, Consumer
        signup_date TEXT NOT NULL
    );
    """

    create_employees_sql = """
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        region_id INTEGER NOT NULL,
        FOREIGN KEY (region_id) REFERENCES regions (id)
    );
    """

    create_campaigns_sql = """
    CREATE TABLE campaigns (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        budget REAL NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL
    );
    """
    
    create_sales_sql = """
    CREATE TABLE sales (
        id INTEGER PRIMARY KEY,
        product_id INTEGER NOT NULL,
        region_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        campaign_id INTEGER, -- Can be NULL if organic sale
        date TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (region_id) REFERENCES regions (id),
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns (id)
    );
    """
    
    try:
        c.execute(create_products_sql)
        c.execute(create_regions_sql)
        c.execute(create_customers_sql)
        c.execute(create_employees_sql)
        c.execute(create_campaigns_sql)
        c.execute(create_sales_sql)
    except Exception as e:
        print(e)

def populate_data(conn):
    cursor = conn.cursor()
    
    # Products (Added Cost for Margin calculations)
    products = [
        ("Laptop Pro X", "Electronics", 1299.99, 800.00),
        ("Smartphone Z", "Electronics", 899.50, 450.00),
        ("Noise Cancelling Headphones", "Electronics", 249.99, 120.00),
        ("Ergonomic Chair", "Furniture", 350.00, 150.00),
        ("Standing Desk", "Furniture", 550.00, 250.00),
        ("Enterprise Software License", "Software", 5000.00, 100.00),
        ("Cloud Storage Plan", "Software", 120.00, 20.00),
        ("Consulting Hour", "Services", 250.00, 50.00)
    ]
    cursor.executemany("INSERT INTO products (name, category, price, cost) VALUES (?, ?, ?, ?)", products)
    
    # Regions
    regions = [("North America",), ("Europe",), ("Asia Pacific",), ("Latin America",)]
    cursor.executemany("INSERT INTO regions (name) VALUES (?)", regions)
    
    # Customers
    segments = ["Enterprise", "SMB", "Consumer"]
    customers = []
    for i in range(50):
        name = f"Customer_{i+1}"
        segment = random.choice(segments)
        date = "2023-01-01" # Simplified
        customers.append((name, segment, date))
    cursor.executemany("INSERT INTO customers (name, segment, signup_date) VALUES (?, ?, ?)", customers)

    # Employees
    roles = ["Sales Manager", "Senior Rep", "Junior Rep"]
    employees = []
    for i in range(20):
        name = f"Rep_{i+1}"
        role = random.choice(roles)
        region_id = random.randint(1, len(regions))
        employees.append((name, role, region_id))
    cursor.executemany("INSERT INTO employees (name, role, region_id) VALUES (?, ?, ?)", employees)

    # Campaigns
    campaigns = [
        ("Summer Sale", 50000.00, "2025-06-01", "2025-08-31"),
        ("Black Friday Push", 20000.00, "2024-11-01", "2024-11-30"),
        ("New Year Promo", 15000.00, "2025-01-01", "2025-01-31"),
        ("Tech Expo 2025", 100000.00, "2025-03-01", "2025-03-15")
    ]
    cursor.executemany("INSERT INTO campaigns (name, budget, start_date, end_date) VALUES (?, ?, ?, ?)", campaigns)

    # Sales
    sales_data = []
    start_date = datetime.now() - timedelta(days=365)
    
    for _ in range(2000): # Increased volume
        product_id = random.randint(1, len(products))
        region_id = random.randint(1, len(regions))
        customer_id = random.randint(1, len(customers))
        employee_id = random.randint(1, len(employees))
        
        # Randomly assign campaign (30% chance of being organic)
        if random.random() > 0.3:
            campaign_id = random.randint(1, len(campaigns))
        else:
            campaign_id = None

        days_offset = random.randint(0, 365)
        sale_date = (start_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
        quantity = random.randint(1, 10)
        
        sales_data.append((product_id, region_id, customer_id, employee_id, campaign_id, sale_date, quantity))
        
    cursor.executemany("INSERT INTO sales (product_id, region_id, customer_id, employee_id, campaign_id, date, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)", sales_data)
    
    conn.commit()
    print("Database populated successfully with extended schema!")

if __name__ == "__main__":
    database = "company_data.db"
    conn = create_connection(database)
    
    if conn is not None:
        create_tables(conn)
        populate_data(conn)
        conn.close()
    else:
        print("Error! cannot create the database connection.")
