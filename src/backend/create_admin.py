from database import SessionLocal
from models import User
from auth import hash_password

def create_first_admin():
    db = SessionLocal()
    
    # Check if admin already exists
    existing_user = db.query(User).filter(User.username == "admin").first()
    if existing_user:
        print("Admin user already exists!")
        return

    # Create the admin user
    admin_user = User(
        username="admin",
        hashed_password=hash_password("admin123"), # Default password
        role="admin"
    )
    
    db.add(admin_user)
    db.commit()
    print("Success! Admin account created. Username: admin | Password: admin123")
    db.close()

if __name__ == "__main__":
    create_first_admin()