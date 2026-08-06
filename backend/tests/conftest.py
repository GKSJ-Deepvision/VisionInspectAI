import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from app import create_app


@pytest.fixture
def app():
    """Create a test Flask application"""
    db_fd, db_path = tempfile.mkstemp()
    test_config = {
        'TESTING': True,
        'DATABASE_PATH': db_path,
        'UPLOAD_FOLDER': tempfile.gettempdir()
    }
    
    app = create_app(test_config)
    
    yield app
    
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """Create a test client for the app"""
    return app.test_client()


class TestAuth:
    def test_register_success(self, client):
        response = client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        })
        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'registered'
        assert data['access_token']
        assert data['token_type'] == 'bearer'
        assert data['user']['username'] == 'testuser'
    
    def test_register_missing_fields(self, client):
        response = client.post('/api/auth/register', json={
            'username': 'testuser'
        })
        assert response.status_code == 400
    
    def test_login_success(self, client):
        # Register first
        client.post('/api/auth/register', json={
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'password123'
        })
        
        # Login
        response = client.post('/api/auth/login', json={
            'username': 'testuser',
            'password': 'password123'
        })
        assert response.status_code == 200
        data = response.get_json()
        assert data['access_token']
        assert data['token_type'] == 'bearer'


class TestUpload:
    def test_upload_file(self, client):
        # Create a mock file
        from io import BytesIO
        data = {
            'file': (BytesIO(b'mock image data'), 'test.jpg')
        }
        response = client.post('/api/upload', data=data, content_type='multipart/form-data')
        assert response.status_code == 201
        assert 'filename' in response.get_json()


class TestAuthProfile:
    def test_me_returns_current_user(self, client):
        register_response = client.post('/api/auth/register', json={
            'username': 'profileuser',
            'email': 'profile@example.com',
            'password': 'password123'
        })
        token = register_response.get_json()['access_token']

        response = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
        assert response.status_code == 200
        data = response.get_json()
        assert data['user']['username'] == 'profileuser'


class TestInspection:
    def test_list_inspections(self, client):
        response = client.get('/api/inspection')
        assert response.status_code == 200
        assert isinstance(response.get_json(), list)
    
    def test_create_inspection(self, client):
        response = client.post('/api/inspection', json={
            'filename': 'test.jpg',
            'status': 'pending',
            'score': 0.5,
            'user_id': 1
        })
        assert response.status_code == 201

    def test_get_and_update_inspection(self, client):
        create_response = client.post('/api/inspection', json={
            'filename': 'test.jpg',
            'status': 'pending',
            'score': 0.2,
            'user_id': 1
        })
        inspection_id = create_response.get_json()['id']

        get_response = client.get(f'/api/inspection/{inspection_id}')
        assert get_response.status_code == 200
        assert get_response.get_json()['filename'] == 'test.jpg'

        update_response = client.put(f'/api/inspection/{inspection_id}', json={
            'status': 'completed',
            'score': 0.9
        })
        assert update_response.status_code == 200
        assert update_response.get_json()['status'] == 'completed'


class TestAnalytics:
    def test_analytics(self, client):
        response = client.get('/api/analytics')
        assert response.status_code == 200
        data = response.get_json()
        assert 'summary' in data
        assert 'total_inspections' in data['summary']


class TestHistory:
    def test_history(self, client):
        response = client.get('/api/history')
        assert response.status_code == 200
        data = response.get_json()
        assert 'results' in data
        assert 'total' in data
