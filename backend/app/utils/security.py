from cryptography.fernet import Fernet
from app.config import get_settings

settings = get_settings()
cipher_suite = Fernet(settings.ENCRYPTION_KEY.encode())

def encrypt_data(data: str) -> str:
    """Encrypts a string of data."""
    if not data:
        return data
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_data(encrypted_data: str) -> str:
    """Decrypts an encrypted string of data."""
    if not encrypted_data:
        return encrypted_data
    try:
        return cipher_suite.decrypt(encrypted_data.encode()).decode()
    except Exception:
        # If decryption fails (e.g., data was not encrypted), return as is
        return encrypted_data
