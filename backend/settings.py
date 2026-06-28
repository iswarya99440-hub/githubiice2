from datetime import timedelta
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
ENV_FILE = BASE_DIR / ".env"
if ENV_FILE.exists():
    environ.Env.read_env(ENV_FILE)

# SECURITY
SECRET_KEY = 'django-insecure-CHANGE-ME'
DEBUG = False
ALLOWED_HOSTS = ["*"]

# APPLICATIONS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    "django_filters",
    "rest_framework",
    "rest_framework_simplejwt",

    'corsheaders',

    'auth.apps.AuthConfig',
    'auditlogs',
    'communication',
    'documents',
    'notifications',
    'reports',
    'internships',
    'evaluations',
    'tracking',
    'attendance',
]

# REST FRAMEWORK
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# JWT SETTINGS
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# MIDDLEWARE
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:3000"]
)

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'

# DATABASE
DATABASES = {
    "default": {
        "ENGINE": env("DB_ENGINE", default="django.db.backends.postgresql"),
        "NAME": env("DB_NAME", default="el_document"),
        "USER": env("DB_USER", default="postgres"),
        "PASSWORD": env("DB_PASSWORD", default=""),
        "HOST": env("DB_HOST", default="localhost"),
        "PORT": env("DB_PORT", default="5432"),
    }
}

# EMAIL
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC FILES
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# MEDIA FILES
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# WHITENOISE
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# DEFAULT AUTO FIELD
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CUSTOM USER
AUTH_USER_MODEL = "authapi.User"
