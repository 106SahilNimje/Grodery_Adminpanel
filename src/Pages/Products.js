import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Switch,
  IconButton,
  Chip
} from "@mui/material";

import { Add, Edit, Delete } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct, updateProduct } from "../Store/ProductSlice";

export default function ProductManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.products);

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
  const [statusFilter, setStatusFilter] = useState("all");

  const categories = [...new Set(products.map(p => p.categoryId?.name).filter(Boolean))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.categoryId?.name === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? product.isActive : !product.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });


  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);


  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/40x40?text=No+Img";

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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(id));
    }
  };

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const formData = new FormData();
    formData.append("isActive", !currentStatus);
    dispatch(updateProduct({ id, data: formData }));
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={24} fontWeight={700}>
            Product Management
          </Typography>
          <Typography color="text.secondary">
            Add and manage products in your inventory
          </Typography>
        </Box>

        <Button
          startIcon={<Add />}
          onClick={() => navigate("/products/add")}
          sx={{
            bgcolor: "#16A34A",
            color: "#fff",
            px: 3,
            py: 1.5,
            borderRadius: "12px",
            fontWeight: 600,
            "&:hover": { bgcolor: "#15803D" }
          }}
        >
          Add Product
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 3, border: "1px solid #eee" }}>
        <Box p={3} display="flex" gap={2} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: "100%", sm: "auto" }, flexGrow: 1 }}
          />
          <Select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" } }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120, width: { xs: "100%", sm: "auto" } }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </Box>

        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: "#F9FAFB" }}>
              <TableRow>
                {["Product", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading &&
                filteredProducts.map((p) => {
                  const totalStock = p.variants?.reduce(
                    (sum, v) => sum + v.stock,
                    0
                  );

                  return (
                    <TableRow key={p._id} hover>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Box
                            component="img"
                            src={getImageUrl(p.image)}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40?text=No+Img" }}
                            sx={{ width: 40, height: 40, borderRadius: 2 }}
                          />
                          <Box>
                            <Typography fontWeight={600} sx={{ whiteSpace: "nowrap" }}>{p.name}</Typography>
                            <Typography fontSize={12} color="text.secondary">
                              SKU: {p.sku}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>


                      <TableCell fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
                        ₹{p.variants?.[0]?.price} / {p.variants?.[0]?.unit}
                      </TableCell>


                      <TableCell>
                        <Chip
                          label={
                            totalStock > 0
                              ? `In Stock (${totalStock})`
                              : "Out of Stock"
                          }
                          color={totalStock > 0 ? "success" : "error"}
                          size="small"
                          sx={{ whiteSpace: "nowrap" }}
                        />
                      </TableCell>


                      <TableCell>
                        <Switch
                          checked={p.isActive}
                          color="success"
                          onChange={() => handleToggleStatus(p._id, p.isActive)}
                        />
                      </TableCell>

                      <TableCell>
                        <Box display="flex" gap={1}>
                          <IconButton
                            onClick={() => handleEdit(p._id)}
                            sx={{ color: "#16A34A" }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(p._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!loading && filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
