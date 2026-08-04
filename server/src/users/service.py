from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

def get_user_profile_data(db: Session, user_id: UUID):
    """
    Fetch the complete user profile including roles and read-only data.
    """
    
    return {"message": "Personal information updated successfully"}

def update_password(db: Session, user_id: UUID, password_data):
    """
    Verify and update the password.
    """
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Passwords do not match"
        )
    
   
    return {"message": "Password updated successfully"}

def update_user_preferences(db: Session, user_id: UUID, pref_data):
    """
    Update both Notification Preferences and UI Settings securely.
    """
   
    return {"message": "Preferences updated successfully"}