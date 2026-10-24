# API phục vụ mô hình scikit-learn đã lưu ở model.joblib.
from contextlib import asynccontextmanager

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

state = {}  # mô hình nằm ở đây, dùng chung cho mọi yêu cầu


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Chạy một lần khi server khởi động: nạp mô hình vào bộ nhớ.
    state["model"] = joblib.load("model.joblib")
    yield  # server nhận yêu cầu trong lúc dừng ở đây
    state.clear()  # chạy khi server tắt


app = FastAPI(lifespan=lifespan)


class Flower(BaseModel):
    # Bốn số đo (cm). Thiếu trường, sai kiểu hay số <= 0: lỗi 422.
    sepal_length: float = Field(gt=0)
    sepal_width: float = Field(gt=0)
    petal_length: float = Field(gt=0)
    petal_width: float = Field(gt=0)


@app.get("/health")
def health():
    if "model" not in state:  # chưa nạp xong: báo "chưa sẵn sàng"
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
