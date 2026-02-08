import bcrypt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    
    Args:
        plain_password: The plain text password to verify
        hashed_password: The hashed password to verify against
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        # Convert to bytes
        password_bytes = plain_password.encode('utf-8')
        hash_bytes = hashed_password.encode('utf-8')
        
        # Verify using bcrypt
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception as e:
        print(f"Password verification error: {e}")
        return False


def get_password_hash(password: str) -> str:
    """
    Hash a password for storing.
    
    Args:
        password: The plain text password to hash
        
    Returns:
        The hashed password as a string
        
    Note:
        bcrypt has a 72-byte limit. Passwords longer than this will be truncated.
    """
    # Convert to bytes
    password_bytes = password.encode('utf-8')
    
    # Truncate to 72 bytes if necessary (bcrypt limitation)
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    
    # Generate salt and hash
    salt = bcrypt.gensalt(rounds=12)  # 12 rounds is a good balance of security and speed
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string
    return hashed.decode('utf-8')
