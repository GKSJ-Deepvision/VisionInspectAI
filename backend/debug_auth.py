from app import create_app
import tempfile
import os
import jwt
from routes.auth import create_access_token, get_current_user

fd, path = tempfile.mkstemp()
os.close(fd)
app = create_app({'TESTING': True, 'DATABASE_PATH': path, 'UPLOAD_FOLDER': tempfile.gettempdir()})

with app.test_request_context('/api/auth/me', headers={'Authorization': 'Bearer bad'}):
    print('get_current_user bad', get_current_user())

with app.test_request_context('/api/auth/me'):
    print('get_current_user no auth', get_current_user())

with app.test_request_context('/api/auth/me'):
    token = create_access_token(1, 'u')
    print('token', token)
    print('decode', jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256']))
