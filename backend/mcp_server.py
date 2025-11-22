from fastmcp import FastMCP
import sqlite3
import os
from typing import List, Dict, Any

# Initialize FastMCP
mcp = FastMCP("DataWarehouseMCP")

# Database Path (relative to this file)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "company_data.db")

def get_connection():
    """Creates a connection to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row # Allow accessing columns by name
        return conn
    except Exception as e:
        raise RuntimeError(f"Failed to connect to database at {DB_PATH}: {e}")

@mcp.tool()
def list_tables() -> List[str]:
    """Lists all tables in the database."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    return tables

@mcp.tool()
def get_table_schema(table_name: str) -> str:
    """Returns the CREATE TABLE statement for a specific table."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?;", (table_name,))
    result = cursor.fetchone()
    conn.close()
    if result:
        return result[0]
    else:
        return f"Table '{table_name}' not found."

@mcp.tool()
def query_database(query: str) -> List[Dict[str, Any]]:
    """Executes a SQL query and returns the results as a list of dictionaries.
    
    Args:
        query: The SQL query to execute.
    """
    # Basic safety check (in production, use read-only user)
    if not query.strip().upper().startswith("SELECT"):
        raise ValueError("Only SELECT queries are allowed.")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    except Exception as e:
        conn.close()
        return [{"error": str(e)}]

@mcp.tool()
def create_plot(data: List[Dict[str, Any]], x: str, y: str, type: str = "bar", title: str = "Chart") -> str:
    """Generates a Plotly JSON configuration for visualization.
    
    Args:
        data: List of dictionaries containing the data.
        x: Key for x-axis.
        y: Key for y-axis.
        type: Chart type ('bar', 'line', 'scatter', 'pie').
        title: Title of the chart.
    """
    import json
    
    # Basic validation
    if not data:
        return json.dumps({"error": "No data provided for plotting"})
        
    plot_config = {
        "data": [{
            "x": [row.get(x) for row in data],
            "y": [row.get(y) for row in data],
            "type": type,
            "marker": {"color": "#2563eb"} # Primary blue
        }],
        "layout": {
            "title": title,
            "xaxis": {"title": x},
            "yaxis": {"title": y},
            "template": "plotly_white"
        }
    }
    
    return json.dumps(plot_config)

if __name__ == "__main__":
    mcp.run()
