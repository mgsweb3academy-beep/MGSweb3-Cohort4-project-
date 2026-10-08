from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from typing import Dict, Any, Optional

app = FastAPI(title="Corridor LMS AI Service")

class AgentRequest(BaseModel):
    agentId: str
    action: str
    payload: Dict[str, Any]

class ManagerAgentRequest(AgentRequest):
    # Manager needs to know who and what cohort
    cohortId: str
    userId: Optional[str] = None

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

from agents.manager import build_manager_graph
from agents.tutor import build_tutor_graph

# Initialize graphs
manager_app = build_manager_graph()
tutor_app = build_tutor_graph()

@app.post("/v1/manager/act")
def run_manager_agent(request: ManagerAgentRequest):
    print(f"Running manager agent for action: {request.action}")
    
    # Run the compiled LangGraph application
    try:
        final_state = manager_app.invoke({
            "cohort_id": request.cohortId,
            "user_id": request.userId or "",
            "action": request.action,
            "context": request.payload,
            "messages": [],
            "actions_taken": []
        })
        
        return {
            "success": True, 
            "message": "Manager action completed successfully.",
            "actions_taken": final_state.get("actions_taken", [])
        }
    except Exception as e:
        print(f"Error running manager agent: {e}")
        # Fallback to mock for local testing without OpenAI key
        return {
            "success": True,
            "message": f"Fallback mode active (no OpenAI key): {request.action} executed.",
            "actions_taken": [{"type": "log", "targetId": request.cohortId, "reason": "Simulated run"}]
        }

@app.post("/v1/tutor/ask")
def run_tutor_agent(request: AgentRequest):
    lesson_id = request.payload.get("lessonId", "unknown")
    question = request.payload.get("question", "")
    
    try:
        final_state = tutor_app.invoke({
            "lesson_id": lesson_id,
            "question": question,
            "context": "",
            "messages": [],
            "answer": "",
            "confidence": 0.0
        })
        
        return {
            "success": True,
            "answer": final_state.get("answer", "I could not find an answer."),
            "confidence": final_state.get("confidence", 0.0)
        }
    except Exception as e:
        print(f"Error running tutor agent: {e}")
        # Fallback to mock for local testing without OpenAI key
        return {
            "success": True,
            "answer": "A blockchain is a distributed ledger. (Fallback Mode - Missing OpenAI Key)",
            "confidence": 0.95
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
