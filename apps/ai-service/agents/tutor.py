from typing import TypedDict, Annotated, Sequence, Any, Optional
import operator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END

class TutorState(TypedDict):
    lesson_id: str
    question: str
    context: str
    messages: Annotated[Sequence[Any], operator.add]
    answer: str
    confidence: Optional[float]

def retrieve_context(state: TutorState):
    # Lesson text is supplied by the API with the request; there is no retrieval store yet.
    return {"context": state.get("context", "")}

def generate_answer(state: TutorState):
    llm = ChatOpenAI(temperature=0.2)
    if state["context"]:
        instructions = f"You are an AI Tutor. Answer based ONLY on this lesson material:\n{state['context']}"
    else:
        instructions = (
            "You are an AI Tutor. No lesson material is available for this question, "
            "so answer from general knowledge and say that it is not drawn from the lesson."
        )
    system_msg = SystemMessage(content=instructions)
    user_msg = HumanMessage(content=state['question'])

    response = llm.invoke([system_msg, user_msg])

    # No calibrated confidence signal exists, so none is reported.
    return {
        "messages": [response],
        "answer": response.content,
    }

def build_tutor_graph():
    graph = StateGraph(TutorState)

    graph.add_node("retrieve", retrieve_context)
    graph.add_node("generate", generate_answer)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)

    return graph.compile()
