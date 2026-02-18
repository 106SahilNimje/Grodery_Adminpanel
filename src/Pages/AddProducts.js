import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Paper,
  Switch,
  IconButton,
  FormControl,
  InputLabel
} from "@mui/material";
import { ArrowBack, Add, Delete, CloudUpload } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addProduct, updateProduct, fetchProducts } from "../Store/ProductSlice";
import { fetchCategories } from "../Store/CategorySlice";
import { useState, useEffect, useRef } from "react";

export default function AddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { categories } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);


  const [vUnit, setVUnit] = useState("");
  const [vPrice, setVPrice] = useState("");
  const [vStock, setVStock] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products, fetchCategories, fetchProducts]);

  const subCategories = categories.find((c) => c._id === categoryId)?.subCategories || [];

  useEffect(() => {
    if (id && products.length > 0) {
      const product = products.find((p) => p._id === id);
      if (product) {
        setName(product.name || "");
        setSku(product.sku || "");
        setCategoryId(product.categoryId?._id || product.categoryId || "");
        setSubCategoryId(product.subCategoryId || "");
        setDescription(product.description || "");
        setIsActive(product.isActive !== false);
        setVariants(product.variants || []);
        setImages([]);
      }
    }
  }, [id, products]);

  const handleImageChange = (e) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const addVariant = () => {
    if (vUnit && vPrice && vStock) {
      setVariants([...variants, { unit: vUnit, price: Number(vPrice), stock: Number(vStock) }]);
      setVUnit("");
      setVPrice("");
      setVStock("");
    }
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const saveProduct = () => {
    if (!name || !sku || !categoryId || !subCategoryId || variants.length === 0) {
      alert("Please fill in all required fields and add at least one variant.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    formData.append("categoryId", categoryId);
    formData.append("subCategoryId", subCategoryId);
    formData.append("description", description);
    formData.append("isActive", isActive);
    formData.append("variants", JSON.stringify(variants));

    images.forEach((img) => {
      formData.append("images", img);
    });

    const action = id ? updateProduct({ id, data: formData }) : addProduct(formData);
    dispatch(action).then((res) => {
      if (!res.error) {
        navigate("/products");
      } else {
        alert(`Failed to ${id ? "update" : "save"} product: ` + res.payload);
      }
    });
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Box>
          <Typography fontSize={24} fontWeight={700}>
            {id ? "Edit Product" : "Add New Product"}
          </Typography>
          <Typography color="text.secondary">
            {id ? "Update the product details below" : "Fill in the product details below"}
          </Typography>
        </Box>

        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/products")}
        >
          Back to Products
        </Button>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={3}>
          <TextField
            label="Product Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="SKU *"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <FormControl fullWidth>
            <InputLabel>Category *</InputLabel>
            <Select
              value={categoryId}
              label="Category *"
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryId("");
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!categoryId}>
            <InputLabel>Sub-Category *</InputLabel>
            <Select
              value={subCategoryId}
              label="Sub-Category *"
              onChange={(e) => setSubCategoryId(e.target.value)}
            >
              {subCategories.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          mt={4}
          p={4}
          border="2px dashed #D1D5DB"
          borderRadius={3}
          textAlign="center"
          sx={{ cursor: "pointer", "&:hover": { borderColor: "#16A34A" }, bgcolor: "#F9FAFB" }}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <CloudUpload sx={{ fontSize: 40, color: "#9CA3AF", mb: 1 }} />
          <Typography>Click to upload images</Typography>
          <Typography fontSize={12} color="text.secondary">
            {images.length > 0 ? `${images.length} files selected` : "PNG, JPG up to 5MB"}
          </Typography>
          <Box mt={2} display="flex" gap={1} flexWrap="wrap" justifyContent="center">
            {images.map((file, index) => (
              <Typography key={index} fontSize={12} sx={{ bgcolor: "#E5E7EB", px: 1, borderRadius: 1 }}>
                {file.name}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box mt={4}>
          <Typography fontWeight={600} mb={2}>Product Variants *</Typography>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr auto" }} gap={2} alignItems="center">
            <TextField
              label="Unit (e.g. 1kg)"
              value={vUnit}
              onChange={(e) => setVUnit(e.target.value)}
            />
            <TextField
              label="Price"
              type="number"
              InputProps={{ startAdornment: "₹" }}
              value={vPrice}
              onChange={(e) => setVPrice(e.target.value)}
            />
            <TextField
              label="Stock"
              type="number"
              value={vStock}
              onChange={(e) => setVStock(e.target.value)}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ bgcolor: "#16A34A", height: "56px" }}
              onClick={addVariant}
            >
              Add
            </Button>
          </Box>

          <Box mt={3} display="flex" flexDirection="column" gap={2}>
            {variants.map((v, i) => (
              <Box key={i} display="flex" justifyContent="space-between" alignItems="center" p={2} border="1px solid #E5E7EB" borderRadius={2}>
                <Box>
                  <Typography fontWeight={600}>{v.unit}</Typography>
                  <Typography fontSize={12} color="text.secondary">
                    ₹{v.price} • Stock: {v.stock}
                  </Typography>
                </Box>
                <IconButton color="error" onClick={() => removeVariant(i)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            {variants.length === 0 && (
              <Typography color="text.secondary" fontSize={14} fontStyle="italic">
                No variants added yet. Please add at least one variant.
              </Typography>
            )}
          </Box>
        </Box>

        <TextField
          multiline
          rows={4}
          label="Description"
          fullWidth
          sx={{ mt: 4 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Box display="flex" alignItems="center" gap={2} mt={3}>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            color="success"
          />
          <Typography fontWeight={600}>Active Product</Typography>
        </Box>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="contained"
            sx={{ bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" } }}
            onClick={saveProduct}
            size="large"
          >
            Save Product
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/products")}
            sx={{
              color: "#16A34A",
              borderColor: "#16A34A",
              "&:hover": { borderColor: "#15803D", bgcolor: "rgba(22, 163, 74, 0.04)" }
            }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
