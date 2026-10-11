import logging
import os
from typing import Any, Dict, Optional

import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from agents.manager import build_manager_graph
from agents.tutor import build_tutor_graph

logger = logging.getLogger("ai-service")

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


# Initialize graphs
manager_app = build_manager_graph()
tutor_app = build_tutor_graph()


def require_llm_key() -> None:
    # Fail loudly: callers must be able to tell "AI is not configured" apart from a real answer.
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(
            status_code=503,
            detail={"code": "AI_NOT_CONFIGURED", "message": "OPENAI_API_KEY is not set for the AI service."},
        )


@app.post("/v1/manager/act")
def run_manager_agent(request: ManagerAgentRequest):
    require_llm_key()
    logger.info("Running manager agent for action: %s", request.action)

    try:
        final_state = manager_app.invoke({
            "cohort_id": request.cohortId,
            "user_id": request.userId or "",
            "action": request.action,
            "context": request.payload,
            "messages": [],
            "actions_taken": [],
        })
    except Exception:
        logger.exception("Manager agent failed")
        raise HTTPException(
            status_code=502,
            detail={"code": "AI_AGENT_FAILED", "message": "The manager agent failed to complete the action."},
        )

    return {
        "success": True,
        "message": "Manager action completed successfully.",
        "actions_taken": final_state.get("actions_taken", []),
    }


@app.post("/v1/tutor/ask")
def run_tutor_agent(request: AgentRequest):
    require_llm_key()
    lesson_id = request.payload.get("lessonId") or "unknown"
    question = request.payload.get("question", "")
    if not question:
        raise HTTPException(
            status_code=422,
            detail={"code": "QUESTION_REQUIRED", "message": "A question is required."},
        )

    try:
        final_state = tutor_app.invoke({
            "lesson_id": lesson_id,
            "question": question,
            "context": request.payload.get("lessonContext") or "",
            "messages": [],
            "answer": "",
            "confidence": None,
        })
    except Exception:
        logger.exception("Tutor agent failed")
        raise HTTPException(
            status_code=502,
            detail={"code": "AI_AGENT_FAILED", "message": "The tutor agent failed to answer."},
        )

    return {
        "success": True,
        "answer": final_state.get("answer", ""),
        "grounded": bool(final_state.get("context")),
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
