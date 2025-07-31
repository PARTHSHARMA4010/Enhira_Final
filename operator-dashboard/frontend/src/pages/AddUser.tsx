/* src/pages/AddUser.tsx */
import { useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Stack,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "../api";

/* -------------------------------------------------------------- */
/* Labels + required flags in one array                           */
const fields = [
  ["userid",        "User ID",               true],
  ["fullusername",  "Full Name",             true],
  ["location",      "Location"],
  ["otp",           "OTP"],
  ["mobileno",      "Mobile No",             true],
  ["aadharcard",    "Aadhaar Card",          true],
  ["bank_acc_no",   "Bank Account No"],
  ["bank_ifsc_no",  "Bank IFSC Code"],
  ["upi_id",        "UPI ID"],
  ["remarks",       "Remarks"],
  ["joiningdt",     "Joining Date (YYYY-MM-DD)"],
] as const;

type Form = Record<(typeof fields)[number][0], string>;

export default function AddUser() {
  const [form, setForm] = useState({} as Form);
  const [ok,  setOk ]   = useState("");
  const [err, setErr]   = useState("");

  const handle = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    /* basic front-end required check */
    const miss = fields.filter(([k, , req]) => req && !form[k]).map(([,l])=>l);
    if (miss.length) { setErr(`Please fill: ${miss.join(", ")}`); return; }

    try {
      await api.post("/users", form);
      setOk("Operator added successfully");
      setForm({} as Form);
    } catch (e: any) {
      /* FastAPI returns 400 {"detail":"Mobile number already exists"} */
      setErr(e.response?.data?.detail || e.message || "Error saving user");
    }
  };

  return (
    <Box p={3}>
      <Card sx={{ maxWidth: 680, mx: "auto" }}>
        <CardHeader title="Add New Operator"
                    sx={{ "& .MuiCardHeader-title": { fontWeight: 600 } }} />
        <CardContent>
          <Stack spacing={2}>
            {fields.map(([k, label, req]) => (
              <TextField
                key={k}
                fullWidth
                size="small"
                label={label}
                required={req}
                value={form[k] || ""}
                onChange={handle(k)}
              />
            ))}

            <Stack direction="row" spacing={2} mt={1} justifyContent="flex-end">
              <Button onClick={() => setForm({} as Form)}>Reset</Button>
              <Button variant="contained" onClick={submit}>Save</Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar open={!!ok} autoHideDuration={3000} onClose={()=>setOk("")}>
        <Alert severity="success">{ok}</Alert>
      </Snackbar>

      <Snackbar open={!!err} autoHideDuration={4000} onClose={()=>setErr("")}>
        <Alert severity="error">{err}</Alert>
      </Snackbar>
    </Box>
  );
}
