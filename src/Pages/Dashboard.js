import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  ShoppingCart,
  CurrencyRupee,
  Inventory2,
  WarningAmber
} from "@mui/icons-material";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../Store/OrderSlice";
import { fetchProducts } from "../Store/ProductSlice";
import { fetchAnalyticsData } from "../Store/AnalyticsSlice";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444", "#8b5cf6"];

const getStatusColor = (status) => {
  const s = status ? status.toLowerCase() : "";
  switch (s) {
    case "delivered":
      return { bg: "#DCFCE7", text: "#16A34A" };
    case "shipped":
      return { bg: "#EDE9FE", text: "#7C3AED" };
    case "processing":
      return { bg: "#DBEAFE", text: "#2563EB" };
    case "confirmed":
      return { bg: "#E0F2FE", text: "#0284C7" };
    case "pending":
      return { bg: "#FEF9C3", text: "#CA8A04" };
    case "cancelled":
      return { bg: "#FEE2E2", text: "#DC2626" };
    default:
      return { bg: "#F3F4F6", text: "#374151" };
  }
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders } = useSelector((state) => state.orders);
  const { products } = useSelector((state) => state.products);
  const { dailySales, categoryPerformance } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    dispatch(fetchAnalyticsData());
  }, [dispatch]);


  const totalOrders = orders.length;
  const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
  const totalProducts = products.length;


  const lowStockCount = products.reduce((acc, product) => {
    const lowStockVariants = product.variants.filter(v => v.stock <= 10).length;
    return acc + lowStockVariants;
  }, 0);

  const activeProducts = products.filter(p => p.isActive !== false).length;

  const recentOrders = orders.slice(0, 5);

  const salesData = useMemo(() => {
    if (!dailySales || dailySales.length === 0) return [];
    return dailySales.map(item => ({
      name: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
      value: item.totalRevenue
    }));
  }, [dailySales]);

  const categoryData = useMemo(() => {
    if (!categoryPerformance || categoryPerformance.length === 0) return [];
    return categoryPerformance.map(item => ({
      name: item._id,
      value: item.totalSales
    }));
  }, [categoryPerformance]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4} mb={7}>
        <StatCard
          icon={<ShoppingCart />}
          bg="#dbeafe"
          color="#2563eb"
          label="Total Orders"
          value={totalOrders}
          badge="+12.5%"
          badgeColor="success"
        />
        <StatCard
          icon={<CurrencyRupee />}
          bg="#dcfce7"
          color="#16a34a"
          label="Total Sales"
          value={`₹${totalSales.toLocaleString()}`}
          badge="+8.2%"
          badgeColor="success"
        />
        <StatCard
          icon={<Inventory2 />}
          bg="#f3e8ff"
          color="#9333ea"
          label="Total Products"
          value={totalProducts}
          badge={`${activeProducts} Active`}
          badgeColor="default"
        />
        <StatCard
          icon={<WarningAmber />}
          bg="#fee2e2"
          color="#dc2626"
          label="Low Stock Items"
          value={lowStockCount}
          badge="Urgent"
          badgeColor="error"
        />
      </Grid>

      <Grid container spacing={4} mb={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={cardStyle}>
            <Box sx={cardHeader}>
              <Typography fontWeight={700}>Sales Overview</Typography>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  color: "#16A34A",
                  borderColor: "#16A34A",
                  "&:hover": { borderColor: "#15803D", bgcolor: "rgba(22, 163, 74, 0.04)" }
                }}
              >
                Last 7 Days
              </Button>
            </Box>
            <Box sx={{ height: 260, width: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="name" />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>

            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={cardStyle}>
            <Typography fontWeight={700} mb={2}>
              Category Distribution
            </Typography>
            <Box sx={{ height: 260, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    outerRadius={120}
                    innerRadius={70}
                    paddingAngle={2}
                  >

                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Card sx={cardStyle}>
        <Box sx={cardHeader}>
          <Typography fontWeight={700}>Recent Orders</Typography>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                {["Order ID", "Customer", "Date", "Amount", "Status", "Action"].map(
                  (h) => (
                    <TableCell
                      key={h}
                      sx={{ fontSize: 12, fontWeight: 700, color: "#4b5563", whiteSpace: "nowrap" }}
                    >
                      {h}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {recentOrders.map((o) => {
                const { bg, text } = getStatusColor(o.orderStatus);
                return (
                  <TableRow hover key={o._id}>
                    <TableCell fontWeight={600}>#{o._id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>{o.user?.name || o.customer?.name || "Guest"}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell fontWeight={600}>₹{o.totalAmount}</TableCell>
                    <TableCell>
                      <Chip
                        label={o.orderStatus}
                        size="small"
                        sx={{
                          bgcolor: bg,
                          color: text,
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        sx={{ color: "#16a34a" }}
                        onClick={() => navigate(`/orders?id=${o._id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {recentOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No recent orders</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  );
}

function StatCard({ icon, bg, color, label, value, badge, badgeColor }) {
  return (
    <Grid size={{ xs: 12, md: 6, lg: 3 }}>
      <Card sx={cardStyle}>
        <Box sx={{
          display: "flex", justifyContent: "space-between", mb: 2, width: 148,
          height: 68,
        }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              bgcolor: bg,
              color,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {icon}
          </Box>
          <Chip label={badge} color={badgeColor} size="small" />
        </Box>
        <Typography fontSize={13} color="text.secondary">
          {label}
        </Typography>
        <Typography fontSize={28} fontWeight={800}>
          {value}
        </Typography>
      </Card>
    </Grid>
  );
}

const cardStyle = {
  borderRadius: 4,
  border: "1px solid #f1f5f9",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  p: 3
};

const cardHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  mb: 3
};
