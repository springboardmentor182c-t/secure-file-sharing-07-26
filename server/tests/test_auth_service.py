from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from src.auth.service import get_current_user_details
from src.entities.user import User
from src.entities.role import Role


def test_get_current_user_details_returns_username_and_role():
    # Arrange
    user_id = uuid4()
    role_id = uuid4()

    mock_user = MagicMock(spec=User)
    mock_user.id = user_id
    mock_user.role_id = role_id
    mock_user.username = "testuser"

    mock_role = MagicMock(spec=Role)
    mock_role.id = role_id
    mock_role.role_name = "user"

    mock_db = MagicMock()

    mock_db.query.return_value.filter.return_value.first.side_effect = [
        mock_user,
        mock_role,
    ]

    # Act
    result = get_current_user_details(mock_db, user_id)

    # Assert
    assert result == {
        "username": "testuser",
        "role": "user",
    }


def test_get_current_user_details_raises_error_for_missing_user():
    # Arrange
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None

    # Act & Assert
    with pytest.raises(ValueError, match="User not found"):
        get_current_user_details(mock_db, uuid4())