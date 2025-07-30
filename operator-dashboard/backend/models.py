from sqlmodel import SQLModel, Field

class UserMaster(SQLModel, table=True):
    userid: str = Field(primary_key=True, max_length=75)
    fullusername: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=150)
    otp: str | None = Field(default=None, max_length=20)
    mobileno: str = Field(max_length=10)
    aadharcard: str = Field(max_length=12)
    bank_acc_no: str | None = Field(default=None, max_length=30)
    bank_ifsc_no: str | None = Field(default=None, max_length=20)
    upi_id: str | None = Field(default=None, max_length=150)
    remarks: str | None = Field(default=None, max_length=250)
    joiningdt: str | None = Field(default=None, max_length=10)  # Use lowercase here
