# An API that serves the scikit-learn model saved in model.joblib.
from contextlib import asynccontextmanager

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

state = {}  # the model lives here, shared by every request


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs once when the server starts: load the model into memory.
    state["model"] = joblib.load("model.joblib")
    yield  # the server handles requests while paused here
    state.clear()  # runs when the server shuts down


app = FastAPI(lifespan=lifespan)


class Flower(BaseModel):
    # Four measurements (cm). Missing field, wrong type or <= 0: error 422.
    sepal_length: float = Field(gt=0)
    sepal_width: float = Field(gt=0)
    petal_length: float = Field(gt=0)
    petal_width: float = Field(gt=0)


@app.get("/health")
def health():
    if "model" not in state:  # not loaded yet: report "not ready"
        raise HTTPException(status_code=503, detail="model not loaded")
    return {"status": "ok"}


@app.post("/predict")
def predict(flower: Flower):
    model = state["model"]
    x = [[flower.sepal_length, flower.sepal_width,
          flower.petal_length, flower.petal_width]]
    proba = model.predict_proba(x)[0]
    return {
        "label": str(model.classes_[proba.argmax()]),
        "proba": {str(c): round(float(p), 3)
                  for c, p in zip(model.classes_, proba)},
    }
