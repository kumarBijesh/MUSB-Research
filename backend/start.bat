@echo off
echo Starting MusB Research Backend...
echo API will be available at http://localhost:8000
echo Docs available at http://localhost:8000/docs
echo.
.\venv\Scripts\uvicorn main:app --reload --port 8000
