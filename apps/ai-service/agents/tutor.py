from typing import TypedDict, Annotated, Sequence, Any
import operator
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

class TutorState(TypedDict):
    lesson_id: str
    question: str
    context: str
    messages: Annotated[Sequence[Any], operator.add]
    answer: str
    confidence: float

def retrieve_context(state: TutorState):
    # Mock retrieval logic (RAG)
    mock_context = f"Context for {state['lesson_id']}: A blockchain is a distributed ledger technology."
    return {"context": mock_context}

def generate_answer(state: TutorState):
    llm = ChatOpenAI(temperature=0.2)
    system_msg = SystemMessage(
        content=f"You are an AI Tutor. Answer based ONLY on context: {state['context']}"
    )
    user_msg = HumanMessage(content=state['question'])
    
    response = llm([system_msg, user_msg])
    
    return {
        "messages": [response],
        "answer": response.content,
        "confidence": 0.95
    }

def build_tutor_graph():
    graph = StateGraph(TutorState)
    
    graph.add_node("retrieve", retrieve_context)
    graph.add_node("generate", generate_answer)
    
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)
    
    return graph.compile()
