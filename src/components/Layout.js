import { Box, CircularProgress } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const SIDEBAR_WIDTH = 256;

export default function Layout() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
    setIsChecked(true);
  }, [token, navigate]);

  if (!isChecked) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (!token) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <Sidebar />

      <Box
        sx={{
          ml: `${SIDEBAR_WIDTH}px`,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <Topbar />

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
