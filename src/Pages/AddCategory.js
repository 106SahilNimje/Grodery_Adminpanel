import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Switch,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, updateCategory } from "../Store/CategorySlice";
import { IconMap, IconNames } from "../utils/IconMap";

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.categories);

  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [subCategories, setSubCategories] = useState([]);
  const [subInput, setSubInput] = useState("");

  const [iconName, setIconName] = useState("category");

  const [iconBg, setIconBg] = useState("#F3F4F6");
  const [iconColor, setIconColor] = useState("#111827");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && categories.length) {
      const category = categories.find((c) => c._id === id);
      if (category) {
        setName(category.name);
        setActive(category.isActive);
        setSubCategories(category.subCategories || []);
        setIconName(category.iconName || category.icon || "category");
        setIconBg(category.iconBg || "#F3F4F6");
        setIconColor(category.iconColor || "#111827");
      }
    }
  }, [id, categories]);


  const addSubCategory = () => {
    if (!subInput.trim()) return;
    setSubCategories([...subCategories, { name: subInput }]);
    setSubInput("");
  };

  const deleteSubCategory = (index) => {
    setSubCategories(subCategories.filter((_, i) => i !== index));
  };

  const submitHandler = async () => {
    const payload = {
      name,
      icon: iconName,
      iconName,
      iconBg,
      iconColor,
      isActive: active,
      subCategories
    };


    setSaving(true);
    setError(null);
    let result;
    if (id) {
      result = await dispatch(updateCategory({ id, ...payload }));
    } else {
      result = await dispatch(addCategory(payload));
    }
    setSaving(false);
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/categories");
    } else {
      setError(result.payload || "Category save failed");
    }
  };

  return (
    <Box p={3}>
      <Typography fontSize={24} fontWeight={700} mb={3}>
        {id ? "Edit Category" : "Add Category"}
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <TextField
          fullWidth
          label="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box display="flex" gap={2} mb={2}>
          <FormControl fullWidth>
            <InputLabel>Icon Name</InputLabel>
            <Select
              value={iconName}
              label="Icon Name"
              onChange={(e) => setIconName(e.target.value)}
              MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
            >
              {IconNames.map((name) => {
                const Icon = IconMap[name];
                if (!Icon) return null; // Skip undefined icons
                return (
                  <MenuItem key={name} value={name} sx={{ display: 'flex', gap: 2 }}>
                    <Icon fontSize="small" />
                    {name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        <Box
          mb={3}
          p={2}
          bgcolor={iconBg}
          borderRadius={2}
          display="flex"
          alignItems="center"
          gap={2}
          border="1px dashed #ccc"
        >
          <Typography variant="body2" color="text.secondary">Icon Preview:</Typography>
          {IconMap[iconName] ? (
            <Box color={iconColor}>
              {(() => {
                const Icon = IconMap[iconName];
                return Icon ? <Icon sx={{ fontSize: 32 }} /> : null;
              })()}
            </Box>
          ) : (
            <Typography>No Icon Selected</Typography>
          )}
        </Box>

        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            type="color"
            label="Icon Background"
            value={iconBg}
            onChange={(e) => setIconBg(e.target.value)}
            sx={{ width: 120 }}
          />

          <TextField
            type="color"
            label="Icon Color"
            value={iconColor}
            onChange={(e) => setIconColor(e.target.value)}
            sx={{ width: 120 }}
          />
        </Box>

        <Box display="flex" alignItems="center" mb={3}>
          <Typography mr={2}>Active</Typography>
          <Switch
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            color="success"
          />
        </Box>

        <Typography fontWeight={600} mb={1}>
          Sub-Categories
        </Typography>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <TextField
            size="small"
            placeholder="Add sub-category"
            value={subInput}
            onChange={(e) => setSubInput(e.target.value)}
            fullWidth
          />
          <IconButton color="success" onClick={addSubCategory}>
            <Add />
          </IconButton>
        </Box>

        {subCategories.map((sub, i) => (
          <Box
            key={i}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
            p={1}
            bgcolor="#F9FAFB"
            borderRadius={2}
          >
            <Typography>{sub.name}</Typography>
            <IconButton color="error" onClick={() => deleteSubCategory(i)}>
              <Delete />
            </IconButton>
          </Box>
        ))}

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            onClick={() => navigate("/categories")}
            sx={{
              color: "#16A34A",
              borderColor: "#16A34A",
              "&:hover": { borderColor: "#15803D", bgcolor: "rgba(22, 163, 74, 0.04)" }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitHandler}
            disabled={saving}
            sx={{
              bgcolor: "#16A34A",
              "&:hover": { bgcolor: "#15803D" }
            }}
          >
            {id ? "Update Category" : "Save Category"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
