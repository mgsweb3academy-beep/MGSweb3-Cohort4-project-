from typing import TypedDict, Annotated, Sequence, Any
import operator
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

# Define state
class ManagerState(TypedDict):
    cohort_id: str
    user_id: str
    action: str
    context: dict
    messages: Annotated[Sequence[Any], operator.add]
    actions_taken: list

def agent_node(state: ManagerState):
    llm = ChatOpenAI(temperature=0)
    
    # Simple logic mapping action to prompts
    system_msg = SystemMessage(
        content="You are the AI Manager for Corridor LMS. Your job is to oversee student tasks and flag issues."
    )
    
    user_msg = HumanMessage(
        content=f"Review tasks for cohort {state['cohort_id']}. The action requested is {state['action']}."
    )
    
    # In a real app, this would query DB state via tools.
    response = llm([system_msg, user_msg])
    
    # Mocking actions taken based on response
    return {
        "messages": [response], 
        "actions_taken": [{"type": "warn", "targetId": "user_123", "reason": "Late on submission"}]
    }

def build_manager_graph():
    graph = StateGraph(ManagerState)
    
    graph.add_node("manager", agent_node)
    graph.set_entry_point("manager")
    graph.add_edge("manager", END)
    
    return graph.compile()
