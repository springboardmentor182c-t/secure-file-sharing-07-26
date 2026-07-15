from src.todos.service import create_todo, get_todos, get_todo_by_id, update_todo, delete_todo
from src.todos.models import TodoCreate, TodoUpdate
from src.users.service import create_user
from src.users.models import UserCreate

def test_todo_crud_lifecycle(db_session):
    # Setup owner
    user_in = UserCreate(email="owner@example.com", password="password123", full_name="Owner User")
    owner = create_user(db_session, user_in)
    
    # Test Create
    todo_in = TodoCreate(title="Test Task", description="Some test desc", priority="high", due_date="2026-12-31")
    todo = create_todo(db_session, todo_in, owner.id)
    assert todo.title == "Test Task"
    assert todo.owner_id == owner.id
    assert todo.completed is False

    # Test Retrieve List
    todos = get_todos(db_session, owner.id)
    assert len(todos) == 1
    assert todos[0].id == todo.id

    # Test Retrieve Single
    retrieved = get_todo_by_id(db_session, todo.id, owner.id)
    assert retrieved is not None
    assert retrieved.title == "Test Task"

    # Test Update
    update_in = TodoUpdate(title="Updated Title", completed=True)
    updated = update_todo(db_session, todo, update_in)
    assert updated.title == "Updated Title"
    assert updated.completed is True

    # Test Delete
    delete_todo(db_session, todo)
    assert get_todo_by_id(db_session, todo.id, owner.id) is None
