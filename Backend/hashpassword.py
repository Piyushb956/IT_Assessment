"""
Run this once on your own machine to generate a real bcrypt hash for your
seed/demo users, since plain-text passwords no longer work with the app.

Usage:
    pip install passlib bcrypt
    python hash_password.py

Then paste the printed hash into your SQL INSERT statements in place of
the plain-text password.
"""
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

if __name__ == "__main__":
    plain = input("Password to hash: ")
    print("\nHashed value (paste this into your SQL insert):\n")
    print(pwd_context.hash(plain))