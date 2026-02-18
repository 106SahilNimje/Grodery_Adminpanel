import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  IconButton
} from "@mui/material";

import { Add, Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, deleteCategory, updateCategory } from "../Store/CategorySlice";
import { IconMap } from "../utils/IconMap";

export default function CategoryManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, loading } = useSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleToggleStatus = (id, currentStatus) => {
    dispatch(updateCategory({ id, isActive: !currentStatus }));
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? category.isActive : !category.isActive);

    return matchesSearch && matchesStatus;
  });

  const renderIcon = (category) => {
    // Try to find icon in IconMap using icon property (primary) or iconName (secondary)
    const iconKey = category.icon || category.iconName;

    if (iconKey) {
      const normalizedKey = iconKey.toLowerCase();
      if (IconMap[iconKey] || IconMap[normalizedKey]) {
        const IconComponent = IconMap[iconKey] || IconMap[normalizedKey];
        return <IconComponent sx={{ fontSize: 20, color: category.iconColor || "inherit" }} />;
      }
    }

    // Fallback for iconFamily (if used)
    if (category.iconFamily && category.iconName) {
      return (
        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: "bold" }}>
          {category.iconName.slice(0, 2).toUpperCase()}
        </Typography>
      );
    }

    // Final fallback: display text or emoji if no map match found
    const icon = category.icon;
    if (!icon) return "📦";
    if (icon.length > 2) {
      return (
        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: "bold" }}>
          {icon.slice(0, 3).toUpperCase()}
        </Typography>
      );
    }
    return icon;
  };

  return (
    <>
      <Box p={3}>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography fontSize={24} fontWeight={700}>
              Category Management
            </Typography>
            <Typography color="#6B7280">
              Manage product categories and sub-categories
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/categories/add")}
            sx={{
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803D" }
            }}
          >
            Add Category
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>

          <Box p={3} display="flex" gap={2} flexWrap="wrap">
            <TextField
              placeholder="Search categories..."
              size="small"
              sx={{ width: { xs: "100%", sm: 250 } }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: { xs: "100%", sm: 160 } }}
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
                  {[
                    "Category Name",
                    "Icon",
                    "Sub-Categories",
                    "Products",
                    "Status",
                    "Actions"
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCategories.map((c) => (
                  <TableRow key={c._id}>

                    <TableCell>{c.name}</TableCell>


                    <TableCell>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: c.iconBg || "#E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          overflow: "hidden"
                        }}
                        title={c.iconName ? `${c.iconFamily}: ${c.iconName}` : c.icon}
                      >
                        {renderIcon(c)}
                      </Box>
                    </TableCell>

                    <TableCell>{c.subCategories?.length || 0}</TableCell>

                    <TableCell>{c.productsCount || 0}</TableCell>

                    <TableCell>
                      <Switch
                        checked={c.isActive}
                        color="success"
                        onChange={() => handleToggleStatus(c._id, c.isActive)}
                      />
                    </TableCell>

                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          onClick={() => navigate(`/categories/edit/${c._id}`)}
                          sx={{ color: "#16A34A" }}
                        >
                          <Edit />
                        </IconButton>

                        <IconButton
                          sx={{ color: "red" }}
                          onClick={() => dispatch(deleteCategory(c._id))}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && filteredCategories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>




          <Box
            p={2}
            borderTop="1px solid #F3F4F6"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography fontSize={14} color="#6B7280">
              Showing 1 to 5 of 5 entries
            </Typography>

            <Box display="flex" gap={1}>
              <Button variant="outlined" size="small">Previous</Button>
              <Button variant="contained" size="small" sx={{ bgcolor: "#16A34A" }}>
                1
              </Button>
              <Button variant="outlined" size="small">Next</Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
