import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UpiPayment() {
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");

  const pay = async () => {
    const { data } = await api.post("/create-upi-payment", {
      amount: parseFloat(amount),
      upi_id: upi,
      note,
    });

    const keyResp = await api.get("/get-razorpay-key");
    const options = {
      key: keyResp.data.key,
      amount: data.amount * 100,
      currency: "INR",
      order_id: data.order_id,
      name: "Enhira",
      description: note,
      handler: async (resp: any) => {
        await api.post("/verify-payment", {
          order_id: resp.razorpay_order_id,
          payment_id: resp.razorpay_payment_id,
          signature: resp.razorpay_signature,
        });
        setMsg("Payment Verified 🎉");
      },
    };
    new window.Razorpay(options).open();
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        One-off UPI Payment
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
        <TextField
          label="UPI ID"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          size="small"
        />
        <TextField
          label="Amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          size="small"
          type="number"
        />
        <TextField
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={pay}>
          Pay Now
        </Button>
      </Box>
      <Snackbar
        open={!!msg}
        autoHideDuration={4000}
        onClose={() => setMsg("")}
      >
        <Alert severity="success">{msg}</Alert>
      </Snackbar>
    </Box>
  );
}
