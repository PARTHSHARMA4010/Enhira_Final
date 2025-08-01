from sqlalchemy import create_engine, text

# Replace with your actual DB_URL
DB_URL = "postgresql+psycopg2://postgres:parth%402019@localhost:5432/enhira"

# Create the database engine
engine = create_engine(DB_URL)

try:
    # Connect to the database
    with engine.connect() as connection:
        # Use SQLAlchemy's `text` to execute raw SQL queries
        result = connection.execute(text("SELECT * FROM usermaster_copy;"))
        # Iterate through the results and print each row
        for row in result:
            print(row)
except Exception as e:
    print(f"Error: {e}")
