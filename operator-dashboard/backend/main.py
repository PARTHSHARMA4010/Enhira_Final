from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select, SQLModel
from models import UserMaster
from db import engine, get_session
import logging
import csv
from sqlalchemy import text
from twilio.rest import Client
import razorpay
from dotenv import load_dotenv
from typing import List, Optional




import os
app = FastAPI(title="User Dashboard API")


from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("user-dashboard")

# Initialize FastAPI app

# --- CORS Middleware for React Frontend --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
# -------------------------------------------------------------

# --- Database Initialization on Startup ---------------------
@app.on_event("startup")
def on_startup() -> None:
    """
    Create all database tables on startup.
    """
    SQLModel.metadata.create_all(engine)
    logger.info("✅ Database tables created (if not already existing).")

# ---------- Health Check Endpoint ---------------------------
@app.get("/ping")
def ping():
    """
    Health check endpoint to verify backend is running.
    """
    logger.info("✅ Front-end just pinged the back-end")
    return {"status": "pong"}

# ---------- List Users Endpoint -----------------------------
@app.get("/users")
def list_users(
    location: str | None = Query(None),
    performance: int | None = Query(None),
    session=Depends(get_session)
):
    """
    Fetch users with optional filters for location and performance.
    """
    try:
        query = select(UserMaster)
        if location:
            query = query.where(UserMaster.location == location)
        if performance:
            query = query.where(UserMaster.scan_count >= performance)
        users = session.exec(query).all()
        logger.info(f"📤 Sent {len(users)} user(s) to front-end")
        return users
    except Exception as e:
        logger.error(f"❌ Failed to fetch users: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {e}")

# ---------- Create User Endpoint ----------------------------
@app.post("/users")
def create_user(user: UserMaster, session=Depends(get_session)):
    """
    Add a new user to the database.
    """
    try:
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"➕ Added user {user.fullusername}")
        return user

    except IntegrityError as exc:
        session.rollback()          # never forget this!

        msg = "Duplicate value"
        # exc.orig is the underlying psycopg2 error; str() has the constraint
        err_txt = str(exc.orig)

        if "uq_user_mobileno" in err_txt:
            msg = "Mobile number already exists"
        elif "uq_user_aadhar" in err_txt:
            msg = "Aadhar card already exists"
        elif "uq_user_upi" in err_txt:
            msg = "UPI ID already exists"

        raise HTTPException(status_code=400, detail=msg)
    # except Exception as e:
    #     logger.error(f"❌ Failed to add user: {e}")
    #     raise HTTPException(status_code=500, detail=f"Failed to add user: {e}")

# ---------- Upload CSV Endpoint -----------------------------
@app.post("/upload-csv")
def upload_csv(file: UploadFile, session=Depends(get_session)):
    """
    Upload and process a CSV file containing operator data.
    """
    try:
        csv_reader = csv.DictReader(file.file.read().decode("utf-8").splitlines())
        operators = []
        for row in csv_reader:
            # Validate required fields
            if not row.get("fullusername") or not row.get("mobileno"):
                raise HTTPException(status_code=400, detail="Invalid CSV format. 'name' and 'phone' are required.")
            operators.append(row)
        
        for operator in operators:
            new_operator = UserMaster(**operator)
            session.add(new_operator)
        session.commit()

        logger.info(f"✅ Processed {len(operators)} operators from CSV")
        return {"status": "success", "operators": operators}
    except Exception as e:
        logger.error(f"❌ Failed to process CSV: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {e}")

# ---------- Update User Endpoint ----------------------------
@app.put("/users/{userid}")
def update_user(userid: str, updated_user: UserMaster, session=Depends(get_session)):
    """
    Update an existing user's details.
    """
    try:
        user = session.get(UserMaster, userid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        for key, value in updated_user.dict(exclude_unset=True).items():
            setattr(user, key, value)
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info(f"✏️ Updated user {user.fullusername}")
        return user
    except Exception as e:
        logger.error(f"❌ Failed to update user: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user")

# ---------- Delete User Endpoint ----------------------------
@app.delete("/users/{userid}")
def delete_user(userid: str, session=Depends(get_session)):
    """
    Delete a user from the database.
    """
    try:
        user = session.get(UserMaster, userid)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        session.delete(user)
        session.commit()
        logger.info(f"🗑️ Deleted user {user.fullusername}")
        return {"message": f"User {user.fullusername} deleted successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to delete user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user")



@app.post("/send-sms")
def send_sms(to: str, message: str):
    """
    Send an SMS message using Twilio.
    Args:
        to (str): Recipient's phone number (e.g., "+1234567890").
        message (str): The message to send.
    """
    try:
        # Send SMS
        sms = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to
        )
        logger.info(f"✅ SMS sent to {to}: {message}")
        return {"status": "success", "sid": sms.sid, "to": to, "message": message}
    except Exception as e:
        logger.error(f"❌ Failed to send SMS: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {e}")



# UPI INTEGRATION

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


from pydantic import BaseModel

# Define the request model
class PaymentRequest(BaseModel):
    amount: float
    upi_id: str
    note: str

# Update the endpoint to use the request model
@app.post("/create-upi-payment")
def create_upi_payment(request: PaymentRequest):
    """
    Create a UPI payment order using Razorpay.
    Args:
        request (PaymentRequest): The payment request containing amount, UPI ID, and note.
    Returns:
        dict: Razorpay order details.
    """
    try:
        # Convert amount to paise (Razorpay uses paise)
        amount_in_paise = int(request.amount * 100)

        # Create Razorpay order
        order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,  # Auto-capture payment
            "notes": {"note": request.note}
        })

        # Return order details
        return {
            "status": "success",
            "order_id": order["id"],
            "amount": request.amount,
            "upi_id": request.upi_id,
            "note": request.note
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create UPI payment: {e}")



# Endpoint to create a UPI payment order
# @app.post("/create-upi-payment")
# def create_upi_payment(amount: float, upi_id: str, note: str = "UPI Payment"):
#     """
#     Create a UPI payment order using Razorpay.
#     Args:
#         amount (float): Payment amount in INR.
#         upi_id (str): Recipient's UPI ID.
#         note (str): Payment note.
#     Returns:
#         dict: Razorpay order details.
#     """
#     try:
#         # Convert amount to paise (Razorpay uses paise)
#         amount_in_paise = int(amount * 100)
#         # Create Razorpay order
#         order = razorpay_client.order.create({
#             "amount": amount_in_paise,
#             "currency": "INR",
#             "payment_capture": 1,  # Auto-capture payment
#             "notes": {"note": note}
#         })

#         # Return order details
#         return {
#             "status": "success",
#             "order_id": order["id"],
#             "amount": amount,
#             "upi_id": upi_id,
#             "note": note
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to create UPI payment: {e}")


# Endpoint to verify payment status
@app.post("/verify-payment")
def verify_payment(order_id: str, payment_id: str, signature: str):
    """
    Verify the payment signature to ensure payment authenticity.
    Args:
        order_id (str): Razorpay order ID.
        payment_id (str): Razorpay payment ID.
        signature (str): Razorpay signature.
    Returns:
        dict: Verification status.
    """
    try:
        # Verify payment signature
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })
        return {"status": "success", "message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment verification failed: {e}")





# Query Builder Models
class QueryRequest(BaseModel):
    fields: List[str]
    filters: Optional[List[dict]] = None
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "asc"

# Query Builder Endpoint

@app.post("/run-query")
def run_query(query_request: QueryRequest):
    try:
        fields = ", ".join(query_request.fields)

        where_clauses = []
        if query_request.filters:
            for filter in query_request.filters:
                field = filter["field"]
                operator = filter["operator"]
                value = filter["value"]
                if operator == "contains":
                    where_clauses.append(f"{field} LIKE '%{value}%'")
                elif operator == "equals":
                    where_clauses.append(f"{field} = '{value}'")
                elif operator == "greater_than":
                    where_clauses.append(f"{field} > {value}")
                elif operator == "less_than":
                    where_clauses.append(f"{field} < {value}")
        
        where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
        sort_clause = f"ORDER BY {query_request.sort_by} {query_request.sort_order}" if query_request.sort_by else ""

        sql_query = f"SELECT {fields} FROM usermaster WHERE {where_clause} {sort_clause};"

        with engine.connect() as connection:
            result = connection.execute(text(sql_query)).mappings()  # <- FIXED HERE
            rows = [dict(row) for row in result]

        return {"query": sql_query, "results": rows}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




# ---------- Run the Server -----------------------------------
# Command to run the server:
# uvicorn main:app --reload --port 8000
