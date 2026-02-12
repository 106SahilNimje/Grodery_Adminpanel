import { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/admin/forgot-password", { email });
      setStatus({ type: "success", text: res.data.message || "Reset link generated" });
      if (res.data?.token && res.data?.resetLink) {
        setTokenInfo({ token: res.data.token, resetLink: res.data.resetLink });
      }
    } catch (e) {
      setStatus({ type: "error", text: e.response?.data?.message || "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f7fb", p: 2 }}>
      <Paper sx={{ p: 4, maxWidth: 420, width: "100%", borderRadius: 4 }}>
        <Typography fontSize={24} fontWeight={700} mb={1}>
          Forgot Password
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Enter your admin email to receive a reset link
        </Typography>

        {status && <Alert severity={status.type} sx={{ mb: 2 }}>{status.text}</Alert>}

        <TextField
          fullWidth
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          disabled={loading || !email}
          onClick={submit}
          sx={{ bgcolor: "#16A34A", color: "#fff", "&:hover": { bgcolor: "#15803D" } }}
        >
          {loading ? "Submitting..." : "Send Reset Link"}
        </Button>

        {tokenInfo && (
          <Box mt={3}>
            <Typography fontWeight={600} mb={1}>Test Link (dev):</Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{tokenInfo.resetLink}</Typography>
            <Button sx={{ mt: 2 }} onClick={() => navigate(`/reset-password?token=${tokenInfo.token}&email=${encodeURIComponent(email)}`)}>
              Open Reset Page
            </Button>
          </Box>
        )}

        <Button sx={{ mt: 2 }} onClick={() => navigate("/login")}>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
}
