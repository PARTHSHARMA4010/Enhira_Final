import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import api from "../api";

const fieldLabels = [
  ["userid", "User ID"],
  ["fullusername", "Full Name"],
  ["location", "Location"],
  ["otp", "OTP"],
  ["mobileno", "Mobile No"],
  ["aadharcard", "Aadhar Card"],
  ["bank_acc_no", "Bank Account No"],
  ["bank_ifsc_no", "Bank IFSC Code"],
  ["upi_id", "UPI ID"],
  ["remarks", "Remarks"],
  ["joiningdt", "Joining Date (YYYY-MM-DD)"],
];

export default function AddUser() {
  const [form, setForm] = useState<any>({});
  const [open, setOpen] = useState(false);

  const handleChange = (field: string) => (e: any) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    try {
      await api.post("/users", form);
      setOpen(true);
      setForm({});
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Add New Operator
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
        {fieldLabels.map(([key, label]) => (
          <TextField
            key={key}
            label={label}
            value={form[key] || ""}
            onChange={handleChange(key)}
            size="small"
          />
        ))}

        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </Box>
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={3000}
      >
        <Alert severity="success">User added!</Alert>
      </Snackbar>
    </Box>
  );
}
