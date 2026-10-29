import {
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  IconButton,
  Divider,
  FormControl,
  Select,
  ListItemText,
  Checkbox,
  InputLabel,
  Alert,
} from "@mui/material";

import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  useGetProductMutation,
  useUpdateProductMutation,
} from "../service/product.auth";

import type { Product } from "../service/product.auth";

type UpdateProductProp = {
  productId: string;
  showTrigger?: boolean;
};

type ProductFormState = {
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  size: string[];
};

const categories = [
  "Men",
  "Women",
  "Kids",
  "Electronics",
  "Footwear",
  "Accessories",
  "Home & Living",
  "Beauty",
];

const availableSizes = ["SM", "MD", "LG"];

const API_BASE_URL = "http://localhost:4040";
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const UpdateProduct = ({
  productId,
  showTrigger = true,
}: UpdateProductProp) => {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<ProductFormState>({
    title: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    brand: "",
    size: [],
  });

  // Existing images already saved on the server.
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Newly selected image files.
  const [newImages, setNewImages] = useState<File[]>([]);

  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [getProduct] = useGetProductMutation();

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const isBusy = isUpdating || loadingProduct;

  // Create temporary preview URLs for newly selected images.
  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));

    setNewImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const getImageUrl = (image: string) => {
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const handleChange = (
    field: keyof ProductFormState,
    value: string | number | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchProduct = async () => {
    setLoadingProduct(true);
    setSubmitError("");
    setImageError("");

    try {
      const response = await getProduct({ productId }).unwrap();
      const fetchedProduct = response.data?.product;

      if (!fetchedProduct) {
        setSubmitError("Product not found.");
        return;
      }

      setFormData({
        title: fetchedProduct.title,
        description: fetchedProduct.description,
        price: fetchedProduct.price,
        stock: fetchedProduct.stock,
        category: fetchedProduct.category,
        brand: fetchedProduct.brand,
        size: fetchedProduct.size ?? [],
      });

      setExistingImages(fetchedProduct.images ?? []);
      setNewImages([]);
    } catch (error) {
      console.error("Error fetching product:", error);
      setSubmitError("Failed to load product details.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleOpen = async () => {
    setOpen(true);
    await fetchProduct();
  };

  const handleClose = () => {
    if (isBusy) return;

    setOpen(false);
    setImageError("");
    setSubmitError("");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    // Allow selecting the same file again.
    event.target.value = "";

    setImageError("");

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Use JPEG, PNG or WebP.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Maximum size is 5 MB.`);
        continue;
      }

      validFiles.push(file);
    }

    const availableSlots =
      MAX_IMAGES - existingImages.length - newImages.length;

    if (availableSlots <= 0) {
      setImageError("You can keep or upload a maximum of 5 images.");
      return;
    }

    if (validFiles.length > availableSlots) {
      errors.push(`You can add only ${availableSlots} more image(s).`);
    }

    const filesToAdd = validFiles.slice(0, availableSlots);

    if (errors.length > 0) {
      setImageError(errors.join(" "));
    }

    if (filesToAdd.length > 0) {
      setNewImages((prev) => [...prev, ...filesToAdd].slice(0, availableSlots));
    }
  };

  // Remove an existing server image from the keep list.
  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  // Remove a newly selected file before uploading.
  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  const handleUpdateProduct = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setImageError("");
    setSubmitError("");

    if (existingImages.length + newImages.length === 0) {
      setImageError("At least one product image is required.");
      return;
    }

    if (existingImages.length + newImages.length > MAX_IMAGES) {
      setImageError("You can keep or upload a maximum of 5 images.");
      return;
    }

    const data = new FormData();

    data.append("productId", productId);
    data.append("title", formData.title.trim());
    data.append("description", formData.description.trim());
    data.append("price", String(formData.price));
    data.append("stock", String(formData.stock));
    data.append("category", formData.category);
    data.append("brand", formData.brand.trim());

    // Send the sizes as JSON so the backend can parse them reliably.
    data.append("size", JSON.stringify(formData.size));

    // Tell the backend which existing image paths to keep.
    data.append("keepImages", JSON.stringify(existingImages));

    // Upload only newly selected files.
    newImages.forEach((file) => {
      data.append("images", file);
    });

    try {
      await updateProduct(data).unwrap();

      setOpen(false);
      setNewImages([]);
      setExistingImages([]);
      setImageError("");
      setSubmitError("");
    } catch (error) {
      console.error("Error updating product:", error);

      const apiError = error as {
        data?: { message?: string; errors?: string[] };
        error?: string;
      };

      setSubmitError(
        apiError.data?.message ??
          apiError.data?.errors?.join(", ") ??
          apiError.error ??
          "Failed to update product.",
      );
    }
  };

  return (
    <Box>
      {showTrigger && (
        <Button onClick={handleOpen} disabled={isBusy} startIcon={<EditIcon />}>
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: "#ffffff",
              backgroundImage: "none",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
            },
          },
        }}
      >
        <Box
          component="form"
          id={`update-product-${productId}`}
          onSubmit={handleUpdateProduct}
        >
          <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3, pb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 750, color: "#0f172a" }}
                >
                  Update Product
                </Typography>

                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.7 }}>
                  Edit product details and manage images.
                </Typography>
              </Box>

              <IconButton
                onClick={handleClose}
                disabled={isBusy}
                aria-label="Close popup"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
            {loadingProduct ? (
              <Typography>Loading product...</Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2.5,
                }}
              >
                <TextField
                  label="Product Name"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                  fullWidth
                />

                <TextField
                  label="Product Brand"
                  value={formData.brand}
                  onChange={(e) => handleChange("brand", e.target.value)}
                  required
                  fullWidth
                />

                <TextField
                  label="Product Price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    handleChange(
                      "price",
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  slotProps={{ htmlInput: { min: 0, step: "any" } }}
                  required
                  fullWidth
                />

                <TextField
                  label="Product Stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    handleChange(
                      "stock",
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  slotProps={{ htmlInput: { min: 0, step: 1 } }}
                  required
                  fullWidth
                />

                <TextField
                  select
                  label="Product Category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  required
                  fullWidth
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>

                <FormControl fullWidth>
                  <InputLabel id={`size-label-${productId}`}>
                    Available Sizes
                  </InputLabel>

                  <Select
                    labelId={`size-label-${productId}`}
                    multiple
                    value={formData.size}
                    label="Available Sizes"
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange(
                        "size",
                        typeof value === "string" ? value.split(",") : value,
                      );
                    }}
                    renderValue={(selected) => selected.join(", ")}
                  >
                    {availableSizes.map((item) => (
                      <MenuItem key={item} value={item}>
                        <Checkbox checked={formData.size.includes(item)} />
                        <ListItemText primary={item} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Existing and new image gallery */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    Product Images ({existingImages.length + newImages.length}/
                    {MAX_IMAGES})
                  </Typography>

                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AddPhotoAlternateIcon />}
                    disabled={
                      isBusy ||
                      existingImages.length + newImages.length >= MAX_IMAGES
                    }
                    sx={{ textTransform: "none" }}
                  >
                    Add Images
                    <input
                      type="file"
                      hidden
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block", color: "text.secondary" }}
                  >
                    JPEG, PNG or WebP. Maximum 5 MB per image.
                  </Typography>

                  {imageError && (
                    <Alert severity="warning" sx={{ mt: 1.5 }}>
                      {imageError}
                    </Alert>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {existingImages.map((image, index) => (
                      <Box
                        key={`existing-${image}-${index}`}
                        sx={{ minWidth: 0 }}
                      >
                        <Box sx={{ position: "relative" }}>
                          <Box
                            component="img"
                            src={getImageUrl(image)}
                            alt={`Existing product image ${index + 1}`}
                            sx={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 2,
                              border: "1px solid #e2e8f0",
                            }}
                          />

                          <IconButton
                            size="small"
                            disabled={isBusy}
                            aria-label="Remove existing image"
                            onClick={() => handleRemoveExistingImage(index)}
                            sx={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              bgcolor: "white",
                              color: "#dc2626",
                            }}
                          >
                            {/* <DeleteOutlineIcon fontSize="small" /> */}
                            D
                          </IconButton>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          Existing image
                        </Typography>
                      </Box>
                    ))}

                    {newImagePreviews.map((src, index) => {
                      const file = newImages[index];
                      if (!file) return null;

                      return (
                        <Box
                          key={`${file.name}-${file.lastModified}-${index}`}
                          sx={{ minWidth: 0 }}
                        >
                          <Box sx={{ position: "relative" }}>
                            <Box
                              component="img"
                              src={src}
                              alt={file.name}
                              sx={{
                                width: "100%",
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 2,
                                border: "1px solid #e2e8f0",
                              }}
                            />

                            <IconButton
                              size="small"
                              disabled={isBusy}
                              aria-label="Remove new image"
                              onClick={() => handleRemoveNewImage(index)}
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                bgcolor: "white",
                                color: "#dc2626",
                              }}
                            >
                              {/* <DeleteOutlineIcon fontSize="small" /> */}
                              D
                            </IconButton>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={file.name}
                          >
                            {file.name}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                <Box sx={{ gridColumn: "1 / -1" }}>
                  <TextField
                    label="Product Description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    multiline
                    rows={4}
                    required
                    fullWidth
                  />
                </Box>

                {submitError && (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Alert severity="error">{submitError}</Alert>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>

          <Divider />

          <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, gap: 1 }}>
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={isBusy}
              sx={{ textTransform: "none", borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isBusy}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#2563eb",
                borderRadius: 2,
                px: 3,
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {isUpdating ? "Updating..." : "Update Product"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default UpdateProduct;
