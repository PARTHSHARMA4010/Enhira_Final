from sqlmodel import create_engine, Session
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Get the database URL from the .env file
DB_URL = os.getenv("DB_URL")

# Create the database engine
engine = create_engine(DB_URL, echo=True)

# Function to get a database session
def get_session():
    with Session(engine) as session:
        yield session
