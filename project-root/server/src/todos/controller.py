from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.database.core import get_db
from src.todos import models, service

router = APIRouter()

@router.get('/', response_model=list[models.TodoOut])
def list_todos(db: Session = Depends(get_db)):
    return service.get_all_todos(db)

@router.post('/', response_model=models.TodoOut, status_code=201)
def create_todo(data: models.TodoCreate, db: Session = Depends(get_db)):
    return service.create_todo(db, data)

@router.patch('/{todo_id}', response_model=models.TodoOut)
def update_todo(todo_id: int, data: models.TodoUpdate, db: Session = Depends(get_db)):
    return service.update_todo(db, todo_id, data)

@router.delete('/{todo_id}', status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    service.delete_todo(db, todo_id)
