# models.py
from sqlmodel import SQLModel, Field
from sqlalchemy import UniqueConstraint, Column, String

class UserMaster(SQLModel, table=True):
    __tablename__ = "usermaster_copy"
    # ① tell Postgres which columns must stay unique
    __table_args__ = (
        UniqueConstraint("mobileno",   name="uq_user_mobileno"),
        UniqueConstraint("aadharcard", name="uq_user_aadhar"),
        UniqueConstraint("upi_id",     name="uq_user_upi"),
    )

    userid: str = Field(primary_key=True, max_length=75)

    # each uses sa_column so we can set unique=True & length precisely
    fullusername: str | None = Field(default=None, max_length=255)

    mobileno: str = Field(
        sa_column=Column("mobileno", String(10), unique=True)
    )
    aadharcard: str = Field(
        sa_column=Column("aadharcard", String(12), unique=True)
    )

    location: str | None = Field(default=None, max_length=150)
    otp: str | None = Field(default=None, max_length=20)
    bank_acc_no: str | None = Field(default=None, max_length=30)
    bank_ifsc_no: str | None = Field(default=None, max_length=20)
    upi_id: str | None = Field(
        default=None,
        sa_column=Column("upi_id", String(150), unique=True)
    )
    remarks: str | None    = Field(default=None, max_length=250)
    joiningdt: str | None  = Field(default=None, max_length=10)
