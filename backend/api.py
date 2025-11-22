import os
import sys
from contextlib import asynccontextmanager
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# --- Configuration ---
MCP_SERVER_SCRIPT = os.path.join(os.path.dirname(__file__), "mcp_server.py")

# --- Global State ---
# In a real app, we'd handle sessions better. For this demo, we keep a global client.
mcp_session: ClientSession | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage the lifecycle of the MCP Client."""
    # Start the MCP Server as a subprocess
    server_params = StdioServerParameters(
        command=sys.executable,
        args=[MCP_SERVER_SCRIPT],
        env=None
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            global mcp_session
            mcp_session = session
            print("Connected to MCP Server.")
            yield
            print("Disconnecting from MCP Server.")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request Models ---
class ChatRequest(BaseModel):
    message: str
    api_key: str
    use_plotting: bool = False

class ChatResponse(BaseModel):
    response: str
    plot_data: str | None = None

# --- LangChain Tools Wrapper ---
# Since LangChain tools need to be synchronous or async, and we have an async session.
# We will define async tools that call the global mcp_session.

@tool
async def list_tables() -> List[str]:
    """Lists all tables in the database."""
    if not mcp_session:
        raise RuntimeError("MCP Session not initialized")
    result = await mcp_session.call_tool("list_tables", arguments={})
    return result.content[0].text

@tool
async def get_table_schema(table_name: str) -> str:
    """Returns the CREATE TABLE statement for a specific table."""
    if not mcp_session:
        raise RuntimeError("MCP Session not initialized")
    result = await mcp_session.call_tool("get_table_schema", arguments={"table_name": table_name})
    return result.content[0].text

@tool
async def query_database(query: str) -> List[Dict[str, Any]]:
    """Executes a SQL query and returns the results."""
    if not mcp_session:
        raise RuntimeError("MCP Session not initialized")
    result = await mcp_session.call_tool("query_database", arguments={"query": query})
    # The result from MCP is text, we might need to parse it if it was JSON, 
    # but our MCP server returns a list of dicts. FastMCP handles serialization.
    # Let's assume it comes back as a string representation of the list.
    import ast
    try:
        return ast.literal_eval(result.content[0].text)
    except:
        return result.content[0].text

@tool
async def create_plot(data: List[Dict[str, Any]], x: str, y: str, chart_type: str = "bar", title: str = "Chart") -> str:
    """Creates a Plotly chart from data.
    
    Args:
        data: List of dictionaries containing the data.
        x: Column name for x-axis.
        y: Column name for y-axis.
        chart_type: Type of chart ('bar', 'line', 'scatter', 'pie').
        title: Title of the chart.
    """
    if not mcp_session:
        raise RuntimeError("MCP Session not initialized")
    result = await mcp_session.call_tool("create_plot", arguments={
        "data": data,
        "x": x,
        "y": y,
        "type": chart_type,
        "title": title
    })
    return result.content[0].text

# --- Agent Setup ---
def get_agent_executor(api_key: str, use_plotting: bool = False):
    llm = ChatOpenAI(
        model="x-ai/grok-4.1-fast:free", # Using the model requested previously
        temperature=0,
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        default_headers={"HTTP-Referer": "http://localhost:3000", "X-Title": "Text-to-SQL Agent"}
    )
    
    tools = [list_tables, get_table_schema, query_database]
    if use_plotting:
        tools.append(create_plot)
    
    # Dynamic System Prompt based on plotting
    system_instructions = """You are an expert data analyst.
        
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

    if use_plotting:
        system_instructions += """
        8. PLOTTING MODE IS ENABLED. You MUST generate a visualization for EVERY query that returns data.
           a) Execute the SQL query to get the data.
           b) Call the 'create_plot' tool with the data.
           c) The 'create_plot' tool returns a JSON string. YOU MUST include this exact JSON string in your final response, wrapped in ```json ... ``` blocks.
           d) DO NOT generate HTML, JS, or any other visualization code yourself. ONLY use the tool.
        """
    else:
        system_instructions += """
        8. If the user explicitly asks for a visualization, explain that they need to enable the plotting feature in the settings.
        """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_instructions),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    agent = create_openai_tools_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

# --- Endpoints ---
import re
import json

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    agent_executor = get_agent_executor(request.api_key, request.use_plotting)
    try:
        result = await agent_executor.ainvoke({"input": request.message})
        output_text = result["output"]
        plot_data = None

        # Extract JSON block if present (handling optional 'json' tag)
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", output_text, re.DOTALL)
        if json_match:
            try:
                potential_json = json_match.group(1)
                # Validate it's proper JSON
                json.loads(potential_json)
                plot_data = potential_json
                # Remove the JSON block from the text response to avoid duplication
                output_text = output_text.replace(json_match.group(0), "").strip()
            except json.JSONDecodeError:
                pass

        return ChatResponse(response=output_text, plot_data=plot_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
