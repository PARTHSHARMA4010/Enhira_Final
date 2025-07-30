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

export default function SendSMS() {
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  const send = async () => {
    await api.post("/send-sms", null, { params: { to, message: msg } });
    setOpen(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Send SMS
      </Typography>
      <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
        <TextField
          label="Phone (+91...)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          size="small"
        />
        <TextField
          multiline
          rows={3}
          label="Message"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          size="small"
        />
        <Button onClick={send} variant="contained">
          Send
        </Button>
      </Box>
      <Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={3000}>
        <Alert severity="success">SMS sent!</Alert>
      </Snackbar>
    </Box>
  );
}
