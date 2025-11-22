import os
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI

def get_agent(openai_api_key=None):
    # Connect to the SQLite database
    # Use absolute path to ensure it works from app.py
    db_path = os.path.join(os.path.dirname(__file__), "company_data.db")
    db = SQLDatabase.from_uri(f"sqlite:///{db_path}")
    
    # Initialize the LLM with OpenRouter
    # Note: In a real scenario, you'd want to handle the key more securely
    if not openai_api_key:
        # Fallback or error handling if no key is provided
        # For now, we assume the user will provide it in the UI
        return None

    llm = ChatOpenAI(
        model="x-ai/grok-4.1-fast:free", # OpenRouter model format
        temperature=0,
        api_key=openai_api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={"HTTP-Referer": "http://localhost:8501", "X-Title": "Text-to-SQL Agent"}
    )
    
    # Define a system prompt to guide the agent
    system_message = """
    You are an expert data analyst.
    
    IMPORTANT RULES:
    1. To calculate REVENUE, you MUST multiply 'sales.quantity' by 'products.price'.
       Formula: SUM(sales.quantity * products.price)
    2. To calculate PROFIT/MARGIN, use (products.price - products.cost) * sales.quantity.
    3. To calculate CAMPAIGN ROI: (Total Revenue from Campaign - Campaign Budget) / Campaign Budget.
       Join 'sales' with 'campaigns' on 'campaign_id'.
    4. Always perform aggregations (SUM, AVG, COUNT) in the SQL query itself.
    5. When joining tables:
       - sales.product_id = products.id
       - sales.customer_id = customers.id
       - sales.employee_id = employees.id
       - sales.campaign_id = campaigns.id
    6. If the user asks for a specific name (Product, Rep, Campaign), use a LIKE clause.
    7. Always return the final answer as a complete sentence based on the SQL result.
    """

    # Create the SQL Agent
    # agent_type="openai-tools" is efficient for function calling
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="openai-tools",
        verbose=True,
        agent_executor_kwargs={"handle_parsing_errors": True},
        prefix=system_message
    )
    
    return agent_executor

def run_query(agent, query):
    if not agent:
        return "Please provide an OpenAI API Key to proceed."
    
    try:
        response = agent.invoke(query)
        return response['output']
    except Exception as e:
        return f"Error executing query: {e}"
