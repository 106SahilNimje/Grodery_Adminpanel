import {
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  List,
  ListItem
} from "@mui/material";

import {
  Menu as MenuIcon,
  Notifications,
  Search,
  ShoppingCart,
  Warning,
  Error as ErrorIcon
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";

const pageTitles = {
  "/": "Dashboard",
  "/categories": "Category Management",
  "/products": "Product Management",
  "/inventory": "Inventory Management",
  "/orders": "Order Management",
  "/analytics": "Reports & Analytics",
  "/settings": "Settings"
};

export default function Topbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || "Dashboard";

  // Notifications State
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { orders } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const notifications = useMemo(() => {
    const list = [];

    const pendingOrders = orders.filter((o) => o.status === "Pending");
    pendingOrders.forEach((o) => {
      list.push({
        id: o._id,
        type: "order",
        message: `New Order #${o._id.slice(-6).toUpperCase()}`,
        subtext: `₹${o.totalAmount} • ${o.customer.name}`,
        time: new Date(o.createdAt),
        link: "/orders"
      });
    });

    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock === 0) {
          list.push({
            id: `${p._id}-${v.unit}-out`,
            type: "out_stock",
            message: `Out of Stock: ${p.name}`,
            subtext: `Variant: ${v.unit}`,
            time: new Date(), 
            link: "/inventory"
          });
        } else if (v.stock <= 10) {
          list.push({
            id: `${p._id}-${v.unit}-low`,
            type: "low_stock",
            message: `Low Stock: ${p.name}`,
            subtext: `Only ${v.stock} left (${v.unit})`,
            time: new Date(),
            link: "/inventory"
          });
        }
      });
    });

   
    return list.sort((a, b) => {
       if (a.type === "order" && b.type !== "order") return -1;
       if (a.type === "out_stock" && b.type === "low_stock") return -1;
       return 0;
    }).slice(0, 10);
  }, [orders, products]);

  const handleNotificationClick = (link) => {
    navigate(link);
    handleClose();
  };

  return (
    <Box
      component="header"
      sx={{
        height: 66,
        bgcolor: "#fff",
        borderBottom: "1px solid #e5e7eb",
        borderLeft: "1px solid #e5e7eb",
        px: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 40
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={onMenuClick}
          sx={{
            color: "#4b5563",
            display: { lg: "none" }
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: "#1f2937"
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          sx={{ color: "#4b5563" }}
          onClick={handleClick}
        >
          <Badge
            badgeContent={notifications.length}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: "#ef4444",
                color: "#fff",
                fontSize: 11,
                minWidth: 20,
                height: 20,
                borderRadius: "50%"
              }
            }}
          >
            <Notifications />
          </Badge>
        </IconButton>

       
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              width: 320,
              maxHeight: 400,
              mt: 1.5,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
            }
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box p={2} borderBottom="1px solid #f3f4f6">
            <Typography fontWeight={700} fontSize={16}>
              Notifications
            </Typography>
          </Box>
          
          <List sx={{ p: 0 }}>
            {notifications.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No new notifications" 
                  secondary="You're all caught up!" 
                  sx={{ textAlign: "center", py: 2 }}
                />
              </ListItem>
            ) : (
              notifications.map((n) => (
                <ListItem
                  key={n.id}
                  button
                  onClick={() => handleNotificationClick(n.link)}
                  sx={{
                    borderBottom: "1px solid #f9fafb",
                    "&:hover": { bgcolor: "#f9fafb" }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {n.type === "order" && <ShoppingCart sx={{ color: "#2563eb", fontSize: 20 }} />}
                    {n.type === "out_stock" && <ErrorIcon sx={{ color: "#dc2626", fontSize: 20 }} />}
                    {n.type === "low_stock" && <Warning sx={{ color: "#ca8a04", fontSize: 20 }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography fontSize={14} fontWeight={600} color="#374151">
                        {n.message}
                      </Typography>
                    }
                    secondary={
                      <Typography fontSize={12} color="text.secondary">
                        {n.subtext}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
          
          <Box p={1.5} borderTop="1px solid #f3f4f6" textAlign="center">
            <Typography 
              fontSize={12} 
              color="primary" 
              sx={{ cursor: "pointer", fontWeight: 600 }}
              onClick={handleClose}
            >
              Mark all as read
            </Typography>
          </Box>
        </Menu>

        <IconButton sx={{ color: "#4b5563" }}>
          <Search />
        </IconButton>
      </Box>
    </Box>
  );
}
