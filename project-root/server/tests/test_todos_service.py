import pytest
from fastapi import HTTPException
from src.todos.models import TodoCreate
from src.todos.service import create_todo, delete_todo

def test_create_todo_success(db):
    """Backend Test 1: Creating a todo successfully persists it to the database."""
    todo_data = TodoCreate(title="Test backend unit todo", user_id=1)
    created = create_todo(db, todo_data)
    
    assert created.id is not None
    assert created.title == "Test backend unit todo"
    assert created.user_id == 1

def test_delete_nonexistent_todo_raises_404(db):
    """Backend Test 2: Attempting to delete a non-existent todo raises HTTPException 404."""
    with pytest.raises(HTTPException) as exc_info:
        delete_todo(db, todo_id=999999)
    
    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Todo not found"
