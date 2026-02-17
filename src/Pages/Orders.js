import {
  Box,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  FormControl,
  InputLabel
} from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchOrders, updateOrderStatus } from "../Store/OrderSlice";

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

export default function OrdersManagement() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { orders, loading } = useSelector((state) => state.orders);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);


  useEffect(() => {
    const orderId = searchParams.get("id");
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        handleViewDetails(order);
      }
    }
  }, [searchParams, orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.name || order.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.email || order.customer?.phone || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.orderStatus.toLowerCase() === statusFilter.toLowerCase();

      const matchesDate =
        !dateFilter ||
        new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateOrderStatus({ id, status: newStatus }));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/40";

    // If it's a relative path (new backend logic)
    if (imagePath.startsWith("uploads/") || imagePath.startsWith("uploads\\")) {
      return `https://grocery-app-backend-0mdx.onrender.com/${imagePath.replace(/\\/g, "/")}`;
    }

    // If it's an external URL (not localhost), return as is
    if (imagePath.startsWith("http") && !imagePath.includes("localhost")) {
      return imagePath;
    }

    // Fallback for localhost URLs or bare filenames: extract filename and use Render URL
    const filename = imagePath.split(/[/\\]/).pop();
    return `https://grocery-app-backend-0mdx.onrender.com/uploads/${filename}`;
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  return (
    <Box p={3}>
      <Box mb={4}>
        <Typography fontSize={24} fontWeight={700}>
          Order Management
        </Typography>
        <Typography color="text.secondary">
          View and manage customer orders
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3, border: "1px solid #eee" }}>

        <Box p={3} display="flex" gap={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </Box>

        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              {[
                "Order ID",
                "Customer",
                "Date & Time",
                "Items",
                "Amount",
                "Status",
                "Actions"
              ].map(h => (
                <TableCell
                  key={h}
                  sx={{ fontSize: 12, fontWeight: 700 }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((o) => {
                const { bg, text } = getStatusColor(o.orderStatus);
                return (
                  <TableRow key={o._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      #{o._id.slice(-6).toUpperCase()}
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>{o.user?.name || o.customer?.name || "Guest"}</Typography>
                      <Typography fontSize={12} color="text.secondary">
                        {o.user?.email || o.customer?.phone || "N/A"}
                      </Typography>
                    </TableCell>

                    <TableCell>{new Date(o.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{o.items.length} items</TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      ₹{o.totalAmount}
                    </TableCell>

                    <TableCell>
                      <Select
                        size="small"
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        sx={{
                          bgcolor: bg,
                          color: text,
                          fontSize: 12,
                          fontWeight: 700,
                          borderRadius: "999px",
                          ".MuiOutlinedInput-notchedOutline": {
                            border: "none"
                          },
                          height: 32
                        }}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Confirmed">Confirmed</MenuItem>
                        <MenuItem value="Processing">Processing</MenuItem>
                        <MenuItem value="Shipped">Shipped</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                        <MenuItem value="Cancelled">Cancelled</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        sx={{
                          color: "#16A34A",
                          fontWeight: 600,
                          textTransform: "none"
                        }}
                        onClick={() => handleViewDetails(o)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No orders found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Box
          p={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography fontSize={14} color="text.secondary">
            Showing {filteredOrders.length} entries
          </Typography>
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Order Details #{selectedOrder?._id.slice(-6).toUpperCase()}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
                <Typography variant="body2"><strong>Name:</strong> {selectedOrder.user?.name || selectedOrder.customer?.name}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {selectedOrder.user?.phone || selectedOrder.customer?.phone}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {selectedOrder.user?.address || selectedOrder.customer?.address}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Order Information</Typography>
                <Typography variant="body2"><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                <Typography variant="body2"><strong>Status:</strong> {selectedOrder.orderStatus}</Typography>
                <Typography variant="body2"><strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>Order Items</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Variant</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              component="img"
                              src={getImageUrl(item.productId?.images?.[0])}
                              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover" }}
                            />
                            <Typography variant="body2">{item.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{item.variant}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>₹{item.quantity * item.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "#16A34A" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
