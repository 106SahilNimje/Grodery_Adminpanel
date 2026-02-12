import { useEffect, useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../Api/axios";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    const e = searchParams.get("email");
    if (t) setToken(t);
    if (e) setEmail(e);
  }, [searchParams]);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/admin/reset-password", { token, email, newPassword });
      setStatus({ type: "success", text: res.data.message || "Password reset successful" });
      setTimeout(() => navigate("/login"), 1000);
    } catch (e) {
      setStatus({ type: "error", text: e.response?.data?.message || "Reset failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f7fb", p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 420, width: "100%", borderRadius: 4 }}>
        <Typography fontSize={24} fontWeight={700} mb={1}>
          Reset Password
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Enter your new password
        </Typography>

        {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.text}</Alert>}

        <TextField
          fullWidth
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          disabled={loading || !email || !token || !newPassword}
          onClick={submit}
          sx={{ bgcolor: "#16A34A", color: "#fff", "&:hover": { bgcolor: "#15803D" } }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </Button>

        <Button sx={{ mt: 2 }} onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
}
