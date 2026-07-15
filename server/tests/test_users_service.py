from src.users.service import create_user, get_user_by_email, update_user
from src.users.models import UserCreate, UserUpdate

def test_user_creation_and_update(db_session):
    # Setup
    user_in = UserCreate(email="test@example.com", password="password123", full_name="Test User")
    
    # Test Create
    user = create_user(db_session, user_in)
    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    
    # Test Retrieve
    retrieved = get_user_by_email(db_session, "test@example.com")
    assert retrieved is not None
    assert retrieved.id == user.id

    # Test Update
    update_in = UserUpdate(full_name="New Name", bio="Cool bio")
    updated = update_user(db_session, user, update_in)
    assert updated.full_name == "New Name"
    assert updated.bio == "Cool bio"
