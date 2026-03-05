import pytest
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


@pytest.mark.django_db
class TestAuthentication:
    def setup_method(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test_user',
            password='test_password123',
            email='test_user@example.com'
        )
        self.login_url = reverse('users:token_obtain_pair')

    def test_user_can_login_and_receive_jwt_token(self):
        """Testa se o usuário consegue logar e receber o access_token"""
        payload = {
            'username': 'test_user',
            'password': 'test_password123'
        }
        
        response = self.client.post(self.login_url, payload)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data

    def test_login_fails_with_wrong_password(self):
        """Testa se o sistema bloqueia senhas incorretas"""
        payload = {
            'username': 'test_user',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, payload)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestUserRegistrationAndProfile:
    def setup_method(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.me_url = '/api/auth/me/'
        
        self.existing_user = User.objects.create_user(
            username='existing_user',
            password='password123',
            email='existing@example.com'
        )

    def test_user_can_register(self):
        """Testa a criação de um novo usuário"""
        payload = {
            'username': 'new_user',
            'email': 'new@example.com',
            'password': 'strongpassword123'
        }
        response = self.client.post(self.register_url, payload)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == 'new_user'
        assert 'password' not in response.data

    def test_registration_fails_with_existing_username(self):
        """Testa se a API bloqueia a criação de usuário com username já em uso"""
        payload = {
            'username': 'existing_user',
            'email': 'another@example.com',
            'password': 'strongpassword123'
        }
        response = self.client.post(self.register_url, payload)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_authenticated_user_can_get_own_profile(self):
        """Testa se o usuário logado consegue buscar seus próprios dados"""
        self.client.force_authenticate(user=self.existing_user)
        response = self.client.get(self.me_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'existing_user'
        assert response.data['email'] == 'existing@example.com'

    def test_unauthenticated_user_cannot_get_profile(self):
        """Testa se a rota /me/ é protegida"""
        response = self.client.get(self.me_url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
