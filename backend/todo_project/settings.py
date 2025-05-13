import os
from environ import Env
import dj_database_url
from pathlib import Path
env = Env()
Env.read_env()
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = env('SECRET_KEY', default='django-insecure-TODO-REPLACE-IN-PRODUCTION')
DEBUG = env.bool('DEBUG', default=True)
ALLOWED_HOSTS = []
NEXT_PUBLIC_STACK_PROJECT_ID = env('NEXT_PUBLIC_STACK_PROJECT_ID', default='c2024aa6-78a7-47a2-8da7-42029ddbcfe6')
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY = env('NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY', default='pck_g01tghqg3jr2taj6dzvzcxr8a41ddbm8tzbe9f0q8wpa0')
STACK_SECRET_SERVER_KEY = env('STACK_SECRET_SERVER_KEY', default='ssk_sj0r5nms7jsabvrz145ms0zs1cnsp57p7tzsmhpf1v1b0')
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party apps
    'rest_framework',
    'corsheaders',
    'django_crontab',  # Added for cron jobs
    # Custom apps
    'todo_api',
]
# Cron jobs configuration
CRONJOBS = [
    # Run the task to update expired todos every minute
    ('* * * * *', 'todo_api.cron.update_todo_statuses'),
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'todo_api.middleware.UpdateExpiredTodosMiddleware',  # Task expiration middleware
]
ROOT_URLCONF = 'todo_project.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'todo_project.wsgi.application'
# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
# Database configuration using DATABASE_URL from environment
DATABASE_URL = env('DATABASE_URL', default='')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    }
else:
    # Fallback to default SQLite database if DATABASE_URL is not available
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 100,
}
# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only, should be restricted in production
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
