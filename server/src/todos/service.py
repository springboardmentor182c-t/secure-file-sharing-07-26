from sqlalchemy.orm import Session
from typing import List, Optional
from src.entities.todo import Todo
from src.todos.models import TodoCreate, TodoUpdate

def get_todos(db: Session, owner_id: int) -> List[Todo]:
    return db.query(Todo).filter(Todo.owner_id == owner_id).all()

def get_todo_by_id(db: Session, todo_id: int, owner_id: int) -> Optional[Todo]:
    return db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == owner_id).first()

def create_todo(db: Session, todo_create: TodoCreate, owner_id: int) -> Todo:
    db_todo = Todo(
        title=todo_create.title,
        description=todo_create.description,
        completed=todo_create.completed,
        due_date=todo_create.due_date,
        priority=todo_create.priority,
        owner_id=owner_id
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, db_todo: Todo, todo_update: TodoUpdate) -> Todo:
    update_data = todo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_todo, key, value)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, db_todo: Todo) -> None:
    db.delete(db_todo)
    db.commit()
