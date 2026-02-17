import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel
} from "@mui/material";

import {
  Download,
  CheckCircle,
  Error,
  Cancel
} from "@mui/icons-material";

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, addStockEntry } from "../Store/ProductSlice";

export default function InventoryManagement() {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockData, setStockData] = useState({
    quantity: "",
    type: "IN",
    reason: ""
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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

  const inventoryItems = products.flatMap(product =>
    product.variants.map(variant => ({
      productId: product._id,
      name: product.name,
      sku: product.sku,
      img: getImageUrl(product.image),
      category: product.categoryId?.name || "Uncategorized",
      subCategory: product.subCategoryId?.name,
      variant: variant.unit,
      stock: variant.stock,
      price: variant.price
    }))
  );

  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchTerm(query);
    } else {
      setSearchTerm("");
    }
  }, [searchParams]);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [...new Set(inventoryItems.map(item => item.category))];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });



  const inStock = inventoryItems.filter(i => i.stock > 10).length;
  const lowStock = inventoryItems.filter(i => i.stock > 0 && i.stock <= 10).length;
  const outOfStock = inventoryItems.filter(i => i.stock === 0).length;

  const stats = [
    {
      label: "In Stock Products",
      value: inStock,
      icon: <CheckCircle />,
      bg: "#DCFCE7",
      color: "#16A34A"
    },
    {
      label: "Low Stock Items",
      value: lowStock,
      icon: <Error />,
      bg: "#FEF9C3",
      color: "#CA8A04"
    },
    {
      label: "Out of Stock",
      value: outOfStock,
      icon: <Cancel />,
      bg: "#FEE2E2",
      color: "#DC2626"
    }
  ];

  const handleUpdateClick = (item) => {
    setSelectedItem(item);
    setStockData({ quantity: "", type: "IN", reason: "" });
    setOpen(true);
  };

  const handleSaveStock = async () => {
    if (!selectedItem || !stockData.quantity) return;

    const result = await dispatch(
      addStockEntry({
        productId: selectedItem.productId,
        variant: selectedItem.variant,
        quantity: Number(stockData.quantity),
        type: stockData.type,
        reason: stockData.reason || "Manual Update"
      })
    );

    if (result.meta.requestStatus === "fulfilled") {
      setOpen(false);
      dispatch(fetchProducts());
    }
  };

  const handleExport = () => {
    const headers = ["Product,SKU,Category,Variant,Stock,Price,Status"];
    const rows = inventoryItems.map(item => {
      const status = item.stock === 0 ? "Out of Stock" : item.stock <= 10 ? "Low Stock" : "In Stock";
      return [
        `"${item.name}"`,
        item.sku,
        item.category,
        item.variant,
        item.stock,
        item.price,
        status
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={24} fontWeight={700}>
            Inventory Management
          </Typography>
          <Typography color="text.secondary">
            Track stock levels and manage inventory
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
        >
          Export Report
        </Button>
      </Box>

      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: stat.bg,
                color: stat.color,
                borderRadius: 3
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "white",
                  borderRadius: "50%",
                  display: "flex"
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography fontWeight={600} fontSize={14}>
                  {stat.label}
                </Typography>
                <Typography fontWeight={700} fontSize={24}>
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box p={3} display="flex" gap={2}>
          <TextField
            placeholder="Search inventory..."
            size="small"
            sx={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: 160 }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </Box>

        <Table>
          <TableHead sx={{ bgcolor: "#F9FAFB" }}>
            <TableRow>
              {[
                "Product",
                "SKU",
                "Category",
                "Variant",
                "Current Stock",
                "Status",
                "Action"
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#6B7280",
                    textTransform: "uppercase"
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredItems.map((item, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box
                      component="img"
                      src={item.img}
                      sx={{ width: 40, height: 40, borderRadius: 2 }}
                    />
                    <Box>
                      <Typography fontWeight={600} fontSize={14}>
                        {item.name}
                      </Typography>
                      <Typography fontSize={13} color="text.secondary">
                        {item.variant} • {item.category} {item.subCategory && `> ${item.subCategory}`}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Chip label={item.variant} size="small" />
                </TableCell>
                <TableCell fontWeight={700}>{item.stock}</TableCell>
                <TableCell>
                  {item.stock === 0 ? (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      size="small"
                      variant="outlined"
                    />
                  ) : item.stock <= 10 ? (
                    <Chip
                      label="Low Stock"
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label="In Stock"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleUpdateClick(item)}
                    sx={{
                      bgcolor: "#16A34A",
                      "&:hover": { bgcolor: "#15803D" }
                    }}
                  >
                    Update Stock
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>


      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <Typography variant="subtitle2" color="text.secondary">
              {selectedItem?.name} ({selectedItem?.variant})
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Update Type</InputLabel>
              <Select
                value={stockData.type}
                label="Update Type"
                onChange={(e) =>
                  setStockData({ ...stockData, type: e.target.value })
                }
              >
                <MenuItem value="IN">Stock In (+)</MenuItem>
                <MenuItem value="OUT">Stock Out (-)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={stockData.quantity}
              onChange={(e) =>
                setStockData({ ...stockData, quantity: e.target.value })
              }
            />

            <TextField
              label="Reason (Optional)"
              fullWidth
              multiline
              rows={2}
              value={stockData.reason}
              onChange={(e) =>
                setStockData({ ...stockData, reason: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: "#16A34A" }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStock}
            disabled={!stockData.quantity}
            sx={{
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803D" }
            }}
          >
            Save Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
