import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { useCreateProductMutation } from "../service/product.auth";

type AddProductProps = {
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
  images: File[];
};

const categories = [
  "Men",
  "Women",
  "Kids",
  "Electronics",
  "Foot_Wear",
  "Accessories",
];

const availableSizes = ["SM", "MD", "LG"];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const initialFormData: ProductFormState = {
  title: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  brand: "",
  size: [],
  images: [],
};

const AddProduct = ({ showTrigger = true }: AddProductProps) => {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState<ProductFormState>(initialFormData);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [imageError, setImageError] = useState("");

  const [submitError, setSubmitError] = useState("");

  const [createProduct, { isLoading, error: addingError }] =
    useCreateProductMutation();

  // Generate image previews and clean up object URLs.
  useEffect(() => {
    const urls = formData.images.map((file) => URL.createObjectURL(file));

    setImagePreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [formData.images]);

  const handleChange = (
    field: keyof Omit<ProductFormState, "images">,
    value: string | number | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    // Allow selecting the same file again later.
    event.target.value = "";

    setImageError("");

    if (selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG, PNG and WebP are allowed.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Image size must be 5 MB or less.`);
        continue;
      }

      validFiles.push(file);
    }

    const remainingSlots = MAX_IMAGES - formData.images.length;

    if (remainingSlots <= 0) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }

    if (validFiles.length > remainingSlots) {
      errors.push(`You can add only ${remainingSlots} more image(s).`);
    }

    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (errors.length > 0) {
      setImageError(errors.join(" "));
    }

    if (filesToAdd.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...filesToAdd].slice(0, MAX_IMAGES),
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIndex) => imageIndex !== index),
    }));

    setImageError("");
  };

  const handleClose = () => {
    if (isLoading) return;

    setOpen(false);
    setImageError("");
    setSubmitError("");
  };

  const handleAddProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitError("");

    if (formData.images.length === 0) {
      setImageError("Please select at least one product image.");
      return;
    }

    if (formData.images.length > MAX_IMAGES) {
      setImageError("You can upload a maximum of 5 images.");
      return;
    }

    const data = new FormData();

    data.append("title", formData.title.trim());
    data.append("description", formData.description.trim());
    data.append("price", String(formData.price));
    data.append("stock", String(formData.stock));
    data.append("category", formData.category);
    data.append("brand", formData.brand.trim());

    // Append each size as a repeated form field.
    formData.size.forEach((item) => {
      data.append("size", item);
    });

    // Field name MUST match upload.array("images", 5).
    formData.images.forEach((file) => {
      data.append("images", file);
    });

    try {
      const response = await createProduct(data).unwrap();

      console.log("Product created successfully:", response);

      setFormData({
        ...initialFormData,
        size: [],
        images: [],
      });

      setImageError("");
      setSubmitError("");
      setOpen(false);
    } catch (error) {
      console.error("Add Product Failed:", error);

      const apiError = error as {
        data?: {
          message?: string;
          errors?: string[];
        };
        error?: string;
      };

      setSubmitError(
        apiError.data?.message ??
          apiError.data?.errors?.join(", ") ??
          apiError.error ??
          "Failed to add product. Please try again.",
      );
    }
  };

  return (
    <Box>
      {addingError && !open && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to add product.
        </Alert>
      )}

      {showTrigger && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSubmitError("");
            setImageError("");
            setOpen(true);
          }}
          sx={{
            bgcolor: "#2563eb",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1.2,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#1d4ed8",
              boxShadow: "none",
            },
          }}
        >
          Add Product
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
        <Box component="form" id="product-form" onSubmit={handleAddProduct}>
          <DialogTitle
            sx={{
              px: { xs: 2.5, sm: 4 },
              pt: 3,
              pb: 2,
            }}
          >
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
                  sx={{
                    fontWeight: 750,
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Add Product
                </Typography>

                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.7 }}>
                  Add product details and upload images.
                </Typography>
              </Box>

              <IconButton
                onClick={handleClose}
                disabled={isLoading}
                aria-label="Close dialog"
                sx={{
                  color: "#64748b",
                  bgcolor: "#f1f5f9",
                  "&:hover": {
                    bgcolor: "#e2e8f0",
                  },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <Divider sx={{ borderColor: "#e2e8f0" }} />

          <DialogContent
            sx={{
              px: { xs: 2.5, sm: 4 },
              py: 3,
            }}
          >
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
                placeholder="Enter product name"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Product Brand"
                placeholder="Enter product brand"
                value={formData.brand}
                onChange={(e) => handleChange("brand", e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Product Price"
                placeholder="Enter price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  handleChange(
                    "price",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                slotProps={{
                  htmlInput: { min: 0, step: "any" },
                }}
                required
                fullWidth
              />

              <TextField
                label="Product Stock"
                placeholder="Enter stock quantity"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  handleChange(
                    "stock",
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                slotProps={{
                  htmlInput: { min: 0, step: 1 },
                }}
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
                <InputLabel id="size-label">Select Sizes</InputLabel>

                <Select
                  labelId="size-label"
                  multiple
                  value={formData.size}
                  label="Select Sizes"
                  onChange={(e) =>
                    handleChange("size", e.target.value as string[])
                  }
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

              {/* Multiple image upload */}
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                  Product Images
                </Typography>

                <Button
                  component="label"
                  variant="outlined"
                  disabled={isLoading || formData.images.length >= MAX_IMAGES}
                  startIcon={<AddIcon />}
                  sx={{ textTransform: "none" }}
                >
                  Choose Images ({formData.images.length}/{MAX_IMAGES})
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImageChange}
                  />
                </Button>

                <Typography
                  variant="caption"
                  sx={{ mt: 1, display: "block", color: "text.secondary" }}
                >
                  JPEG, PNG or WebP. Maximum 5 MB per image, up to 5 images.
                </Typography>

                {imageError && (
                  <Alert severity="warning" sx={{ mt: 1.5 }}>
                    {imageError}
                  </Alert>
                )}

                {imagePreviews.length > 0 && (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(110px, 1fr))",
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    {imagePreviews.map((src, index) => {
                      const file = formData.images[index];

                      // Safety check
                      if (!file) return null;

                      return (
                        <Box
                          key={`${file.name}-${file.lastModified}-${index}`}
                          sx={{
                            position: "relative",
                            minWidth: 0,
                          }}
                        >
                          <Box
                            component="img"
                            src={src}
                            alt={`Product preview ${index + 1}`}
                            sx={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                              display: "block",
                              borderRadius: 2,
                              border: "1px solid #e2e8f0",
                            }}
                          />

                          <IconButton
                            size="small"
                            aria-label={`Remove image ${index + 1}`}
                            disabled={isLoading}
                            onClick={() => handleRemoveImage(index)}
                            sx={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              bgcolor: "white",
                              color: "#dc2626",
                              boxShadow: 1,
                            }}
                          >
                            {/* <DeleteOutlineIcon fontSize="small" /> */}
                            D
                          </IconButton>

                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              mt: 0.5,
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
                )}
              </Box>

              <Box sx={{ gridColumn: "1 / -1" }}>
                <TextField
                  label="Product Description"
                  placeholder="Describe your product..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
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
          </DialogContent>

          <Divider sx={{ borderColor: "#e2e8f0" }} />

          <DialogActions
            sx={{
              px: { xs: 2.5, sm: 4 },
              py: 2.5,
              gap: 1,
            }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              disabled={isLoading}
              sx={{
                textTransform: "none",
                color: "#475569",
                borderColor: "#cbd5e1",
                borderRadius: 2,
                px: 3,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                bgcolor: "#2563eb",
                borderRadius: 2,
                px: 3,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                  boxShadow: "none",
                },
              }}
            >
              {isLoading ? "Uploading..." : "Add Product"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default AddProduct;
