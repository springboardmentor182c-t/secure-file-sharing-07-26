from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.entities.user import User
from src.todos.models import TodoCreate, TodoUpdate, TodoResponse
from src.todos.service import get_todos, get_todo_by_id, create_todo, update_todo, delete_todo
from src.auth.service import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("", response_model=List[TodoResponse])
def read_todos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_todos(db=db, owner_id=current_user.id)

@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_user_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_todo(db=db, todo_create=todo_data, owner_id=current_user.id)

@router.get("/{todo_id}", response_model=TodoResponse)
def read_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_todo = get_todo_by_id(db=db, todo_id=todo_id, owner_id=current_user.id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@router.put("/{todo_id}", response_model=TodoResponse)
def update_user_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_todo = get_todo_by_id(db=db, todo_id=todo_id, owner_id=current_user.id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return update_todo(db=db, db_todo=db_todo, todo_update=todo_data)

@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_todo = get_todo_by_id(db=db, todo_id=todo_id, owner_id=current_user.id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    delete_todo(db=db, db_todo=db_todo)
    return None
