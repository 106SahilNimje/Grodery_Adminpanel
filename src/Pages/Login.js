import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link
} from "@mui/material";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../Store/AuthSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = () => {
    dispatch(adminLogin({ email, password }));
  };

useEffect(() => {
  if (token) {
    navigate("/", { replace: true });
  }
}, [token, navigate]);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
        p: 2
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4
        }}
      >
        <Box textAlign="center" mb={4}>
          <Box
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#16A34A",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2
            }}
          >
            <ShoppingBasketIcon sx={{ fontSize: 40, color: "#fff" }} />
          </Box>

          <Typography fontSize={28} fontWeight={700} color="#1F2937">
            Smart Grocery Admin
          </Typography>
          <Typography color="text.secondary">
            Sign in to manage your store
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={3}>
          <Box>
            <Label>Email Address</Label>
            <TextField
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartgrocery.com"
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ color: "#9CA3AF", mr: 1 }} />
                )
              }}
              sx={inputStyle}
            />
          </Box>

          <Box>
            <Label>Password</Label>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: "#9CA3AF", mr: 1 }} />
                )
              }}
              sx={inputStyle}
            />
          </Box>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    color: "#16A34A",
                    "&.Mui-checked": { color: "#16A34A" }
                  }}
                />
              }
              label={
                <Typography fontSize={14} color="text.secondary">
                  Remember me
                </Typography>
              }
            />

            <Link
              underline="none"
              fontSize={14}
              fontWeight={600}
              color="#16A34A"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </Link>
          </Box>

          {error && (
            <Typography color="error" fontSize={13} textAlign="center">
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            disabled={loading}
            onClick={onLogin}
            sx={{
              mt: 1,
              bgcolor: "#16A34A",
              color: "#fff",
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: 16,
              textTransform: "none",
              boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#15803D" }
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

const Label = ({ children }) => (
  <Typography
    component="label"
    fontSize={13}
    fontWeight={600}
    mb={1}
    color="#374151"
  >
    {children}
  </Typography>
);

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    "&.Mui-focused fieldset": {
      borderColor: "#22C55E",
      borderWidth: 2
    }
  }
};
