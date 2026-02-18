import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Drawer
} from "@mui/material";

import {
  Home,
  Category,
  Inventory2,
  Warehouse,
  ShoppingCart,
  BarChart,
  Settings,
  Logout,
  ShoppingBasket
} from "@mui/icons-material";
import { logout } from "../Store/AuthSlice";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const SIDEBAR_WIDTH = 256;

const menuItems = [
  { label: "Dashboard", path: "/", icon: <Home /> },
  { label: "Categories", path: "/categories", icon: <Category /> },
  { label: "Products", path: "/products", icon: <Inventory2 /> },
  { label: "Inventory", path: "/inventory", icon: <Warehouse /> },
  { label: "Orders", path: "/orders", icon: <ShoppingCart /> },
  { label: "Reports", path: "/analytics", icon: <BarChart /> },
  { label: "Settings", path: "/settings", icon: <Settings /> }
];

export default function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#16a34a",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <ShoppingBasket sx={{ color: "#fff", fontSize: 26 }} />
        </Box>

        <Box>
          <Typography fontWeight={700} fontSize={18}>
            Smart Grocery
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            Admin Panel
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
        <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              component={NavLink}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when an item is clicked
                if (mobileOpen && handleDrawerToggle) {
                  handleDrawerToggle();
                }
              }}
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: "12px",
                color: "#4b5563",
                "&:hover": {
                  bgcolor: "#f9fafb"
                },
                "&.active": {
                  bgcolor: "#ecfdf5",
                  color: "#16a34a",
                  "& .MuiListItemIcon-root": {
                    color: "#16a34a"
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: "inherit"
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e7eb"
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 0,
            py: 1.5
          }}
        >
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: "#dcfce7",
              color: "#16a34a"
            }}
          >
            {admin?.name?.charAt(0) || "A"}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography fontSize={14} fontWeight={600}>
              {admin?.name || "Admin User"}
            </Typography>
            <Typography fontSize={12} color="text.secondary">
              {admin?.email || "admin@smartgrocery.com"}
            </Typography>
          </Box>

          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#9ca3af",
              "&:hover": {
                color: "#dc2626",
                bgcolor: "#fee2e2"
              }
            }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: SIDEBAR_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: SIDEBAR_WIDTH },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
