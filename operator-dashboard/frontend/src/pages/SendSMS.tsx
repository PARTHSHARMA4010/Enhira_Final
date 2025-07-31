/* SendSMS.tsx – polished WhatsApp/SMS messaging page */
import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Snackbar,
  Alert,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../api";

interface User {
  userid: string;
  fullusername: string;
  mobileno: string;
  location: string;
}

const templates: Record<string, string> = {
  Custom: "",
  "Payment Reminder":
    "Dear {Name}, your pending payment will be settled today.",
  "Thank You":
    "Dear {Name}, thank you for your excellent work in {Location}.",
};

export default function SendSMS() {
  /* ----------------------------------------------------------------------------
   * 1 – state
   * ------------------------------------------------------------------------- */
  const [tab, setTab] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);

  const [template, setTemplate] = useState("Custom");
  const [msg, setMsg] = useState("");

  const [confirm, setConfirm] = useState(false);

  const [toast, setToast] = useState({ text: "", ok: true });

  /* ----------------------------------------------------------------------------
   * 2 – fetch users once (for autocomplete)
   * ------------------------------------------------------------------------- */
  useEffect(() => {
    api
      .get<User[]>("/users")
      .then((r) => setUsers(r.data))
      .catch((e) => setToast({ text: e.message, ok: false }));
  }, []);

  /* ----------------------------------------------------------------------------
   * 3 – when template or recipient changes, fill message
   * ------------------------------------------------------------------------- */
  useEffect(() => {
    if (template === "Custom") return;
    if (!selected) return;

    const tpl = templates[template]
      .replace("{Name}", selected.fullusername.split(" ")[0])
      .replace("{Location}", selected.location);

    setMsg(tpl);
  }, [template, selected]);

  /* ----------------------------------------------------------------------------
   * 4 – derived
   * ------------------------------------------------------------------------- */
  const charLeft = 160 - msg.length;
  const segments = Math.ceil(msg.length / 160);

  const disabled =
    !selected || msg.length === 0 || !confirm || msg.length > 480;

  /* ----------------------------------------------------------------------------
   * 5 – send call
   * ------------------------------------------------------------------------- */
  const send = async () => {
    if (!selected) return;
    try {
      await api.post("/send-sms", null, {
        params: { to: selected.mobileno, message: msg },
      });
      setToast({ text: "Message sent ✅", ok: true });
      setConfirm(false);
      setMsg("");
      setTemplate("Custom");
    } catch (e: any) {
      setToast({
        text: e.response?.data?.detail || e.message || "Failed to send",
        ok: false,
      });
    }
  };

  /* ----------------------------------------------------------------------------
   * 6 – UI helpers
   * ------------------------------------------------------------------------- */
  const RecipientsCard = () =>
    selected ? (
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: "grey.50",
          minHeight: 160,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography fontWeight={600}>Recipients (1)</Typography>
        <Divider />
        <Typography>{selected.fullusername}</Typography>
        <Typography variant="body2" color="text.secondary">
          +91&nbsp;{selected.mobileno}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Preview: “
          {msg
            .replace("{Name}", selected.fullusername.split(" ")[0])
            .replace("{Location}", selected.location)}
          ”
        </Typography>
      </Paper>
    ) : (
      <Paper
        variant="outlined"
        sx={{ p: 2, minHeight: 160, display: "flex", alignItems: "center" }}
      >
        <Typography color="text.secondary">
          Pick a recipient to see preview
        </Typography>
      </Paper>
    );

  /* ----------------------------------------------------------------------------
   * 7 – render
   * ------------------------------------------------------------------------- */
  return (
    <Box p={3}>
      <Card>
        <CardHeader
          title="Messaging"
          sx={{ "& .MuiCardHeader-title": { fontWeight: 700 } }}
        />

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          aria-label="message modes"
        >
          <Tab label="Individual" />
          <Tab label="Group by Location" />
          <Tab label="Group by Performance" />
          <Tab label="CSV Upload" />
        </Tabs>

        {/* Only individual mode fully implemented */}
        {tab === 0 && (
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems="flex-start"
            >
              {/* LEFT COLUMN -------------------------------------------------- */}
              <Box flex={1} minWidth={280} display="flex" flexDirection="column">
                <Autocomplete
                  options={users}
                  getOptionLabel={(u) =>
                    `${u.fullusername} (${u.mobileno})`
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Search Operator" size="small" />
                  )}
                  value={selected}
                  onChange={(_, v) => setSelected(v)}
                  sx={{ mb: 2 }}
                />

                <Select
                  fullWidth
                  size="small"
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as string)}
                  sx={{ mb: 2 }}
                >
                  {Object.keys(templates).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t === "Custom" ? "Custom Message" : t}
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  multiline
                  minRows={4}
                  label="Message"
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  helperText={`${charLeft}/160 characters · ${segments} SMS`}
                />

                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={
                    <Checkbox
                      checked={confirm}
                      onChange={(e) => setConfirm(e.target.checked)}
                    />
                  }
                  label="Confirm message content"
                />

                <Stack direction="row" spacing={2} mt={2}>
                  <Button
                    variant="contained"
                    onClick={send}
                    disabled={disabled}
                  >
                    Send Message
                  </Button>
                  {template !== "Custom" && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        templates[template] = msg;
                        setToast({ text: "Template saved", ok: true });
                      }}
                    >
                      Save Template
                    </Button>
                  )}
                </Stack>
              </Box>

              {/* RIGHT COLUMN ------------------------------------------------- */}
              <Box width={{ xs: "100%", md: 300 }}>
                <RecipientsCard />
              </Box>
            </Stack>
          </CardContent>
        )}

        {tab !== 0 && (
          <CardContent sx={{ color: "text.secondary" }}>
            <Typography>
              Only Individual mode is implemented in this demo. Add your logic
              here for bulk selection or CSV parsing.
            </Typography>
            {tab === 3 && (
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                sx={{ mt: 2 }}
                component="label"
              >
                Upload CSV
                <input type="file" hidden accept=".csv" />
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* TOASTS ------------------------------------------------------------- */}
      <Snackbar
        open={!!toast.text}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, text: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.ok ? "success" : "error"}>{toast.text}</Alert>
      </Snackbar>
    </Box>
  );
}
