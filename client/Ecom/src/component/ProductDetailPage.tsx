import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StarIcon from "@mui/icons-material/Star";

import NavBar from "./NavBar";
import Footer from "./Footer";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState } from "../redux/store";

import { useGetProductMutation, type Product } from "../service/product.auth";

import { useAddToCartMutation } from "../service/productCart.auth";

const API_BASE_URL = "http://localhost:4040";

const ProductDetailPage = () => {
  const navigate = useNavigate();

  // Product ID from Redux
  const sharedId = useSelector((state: RootState) => state.activeId.value);

  // Product state
  const [product, setProduct] = useState<Product | null>(null);

  // Selected image
  const [selectedImage, setSelectedImage] = useState<string>("");

  // UI states
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // API hooks
  const [getProduct, { isLoading, error }] = useGetProductMutation();

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  // Fetch product details
  useEffect(() => {
    if (!sharedId) {
      setProduct(null);
      setSelectedImage("");
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      try {
        const response = await getProduct({
          productId: sharedId,
        }).unwrap();


        if (cancelled) return;

        // Expected response:
        // { success: true, data: { product: {...} } }
        const productData = response?.data?.product;
        console.log(productData)
        if (productData) {
          setProduct(productData);
          setSelectedImage(productData.images?.[0] ?? "");
          setSelectedSize("");
          setQuantity(1);
          setLiked(false);
        } else {
          setProduct(null);
          setSelectedImage("");
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch product:", err);
          setProduct(null);
          setSelectedImage("");
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [sharedId, getProduct]);

  // Build image URL
  const getImageUrl = (image: string) => {
    if (!image) return "";

    // Support both full URLs and backend-relative paths
    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    if (product.size?.length && !selectedSize) {
      alert("Please select a size");
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      alert("Please select a valid quantity");
      return;
    }

    try {
      await addToCart({
        productId: product._id,
        quantity,
        ...(selectedSize ? { size: selectedSize } : {}),
      }).unwrap();

      navigate("/product-cart");
    } catch (err) {
      console.error("Failed to add product to cart:", err);
    }
  };

  // No product selected
  if (!sharedId) {
    return (
      <Box>
        <NavBar
          onCategoryChange={() => console.log("Category clicked")}
          onFilterChange={() => console.log("Filter clicked")}
        />

        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography variant="h5">No product selected</Typography>

          <Typography sx={{ mt: 1 }}>
            Please select a product from the product listing.
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate("/")}
          >
            Browse Products
          </Button>
        </Box>

        <Footer />
      </Box>
    );
  }

  return (
    <Box>
      <NavBar
        onCategoryChange={() => console.log("Category clicked")}
        onFilterChange={() => console.log("Filter clicked")}
      />

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 6 },
          minHeight: "60vh",
        }}
      >
        {/* Loading */}
        {isLoading && !product && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error */}
        {error && !product && !isLoading && (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography color="error">
              Failed to load product. Please try again.
            </Typography>

            <Button
              sx={{ mt: 2 }}
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Product not found */}
        {!isLoading && !error && !product && (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h6">Product not found</Typography>
          </Box>
        )}

        {/* Product details */}
        {product && (
          <>
            <Typography
              variant="h4"
              sx={{
                mb: 4,
                fontWeight: 700,
              }}
            >
              {product.title}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "1.1fr 1fr",
                },
                gap: { xs: 4, md: 6 },
                alignItems: "start",
              }}
            >
              {/* LEFT: Product image gallery */}
              <Box>
                {/* Main image */}
                <Paper
                  elevation={1}
                  sx={{
                    height: { xs: 300, sm: 400, md: 480 },
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100",
                  }}
                >
                  {selectedImage ? (
                    <Box
                      component="img"
                      src={getImageUrl(selectedImage)}
                      alt={product.title}
                      onError={(event) => {
                        event.currentTarget.style.visibility = "hidden";
                      }}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <Typography color="text.secondary">
                      No image available
                    </Typography>
                  )}
                </Paper>

                {/* All image thumbnails */}
                {product.images && product.images.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      mt: 2,
                      overflowX: "auto",
                      pb: 1,
                    }}
                  >
                    {product.images.map((image, index) => (
                      <Box
                        key={`${image}-${index}`}
                        onClick={() => setSelectedImage(image)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Show product image ${index + 1}`}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedImage(image);
                          }
                        }}
                        sx={{
                          flex: "0 0 auto",
                          width: 80,
                          height: 80,
                          borderRadius: 2,
                          overflow: "hidden",
                          cursor: "pointer",
                          border: "2px solid",
                          borderColor:
                            selectedImage === image
                              ? "primary.main"
                              : "divider",
                          opacity: selectedImage === image ? 1 : 0.7,
                          transition: "all 0.2s",
                          "&:hover": {
                            opacity: 1,
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(image)}
                          alt={`${product.title} ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* RIGHT: Product details */}
              <Stack spacing={3}>
                {/* Price and rating */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ₹{product.price}
                  </Typography>

                  <Stack
                    sx={{
                      direction: "row",
                      alignItems: "center",
                      spacing: 1,
                    }}
                  >
                    <StarIcon color="warning" />
                    <Typography variant="body2">Rating unavailable</Typography>
                  </Stack>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  Brand: {product.brand || "Not specified"}
                </Typography>

                <Divider />

                {/* Size selection */}
                {product.size && product.size.length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1.5 }}>
                      Size
                    </Typography>

                    <FormControl fullWidth>
                      <InputLabel id="size-label">Select Size</InputLabel>

                      <Select
                        labelId="size-label"
                        value={selectedSize}
                        label="Select Size"
                        onChange={(event) =>
                          setSelectedSize(event.target.value)
                        }
                      >
                        {product.size.map((item) => (
                          <MenuItem key={item} value={item}>
                            {item}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Stock */}
                <Typography
                  color={product.stock > 0 ? "success.main" : "error.main"}
                >
                  {product.stock > 0
                    ? `Available stock: ${product.stock}`
                    : "Out of stock"}
                </Typography>

                {/* Quantity and favorite */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <FormControl fullWidth disabled={product.stock <= 0}>
                    <InputLabel id="quantity-label">Quantity</InputLabel>

                    <Select
                      labelId="quantity-label"
                      value={quantity}
                      label="Quantity"
                      onChange={(event) =>
                        setQuantity(Number(event.target.value))
                      }
                    >
                      {Array.from(
                        {
                          length: Math.min(Math.max(0, product.stock), 10),
                        },
                        (_, index) => index + 1,
                      ).map((qty) => (
                        <MenuItem key={qty} value={qty}>
                          {qty}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    onClick={() => setLiked((prev) => !prev)}
                    startIcon={
                      liked ? <FavoriteIcon /> : <FavoriteBorderIcon />
                    }
                    color={liked ? "error" : "primary"}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      p: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Favorite
                  </Button>
                </Box>

                {/* Total price */}
                <Typography variant="body1">
                  Total:{" "}
                  <Box component="span" sx={{ fontWeight: 700 }}>
                    ₹{(product.price * quantity).toLocaleString("en-IN")}
                  </Box>
                </Typography>

                {/* Description */}
                <Box
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Description
                  </Typography>

                  <Typography color="text.secondary">
                    {product.description || "No description available."}
                  </Typography>
                </Box>

                {/* Purchase actions */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ pt: 1 }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={
                      product.stock <= 0 ||
                      quantity > product.stock ||
                      (Boolean(product.size?.length) && !selectedSize)
                    }
                    onClick={() => {
                      // Checkout flow can be connected here.
                      navigate("/checkout", {
                        state: {
                          productId: product._id,
                          quantity,
                          ...(selectedSize ? { size: selectedSize } : {}),
                        },
                      });
                    }}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    Buy Now
                  </Button>

                  <Button
                    onClick={handleAddToCart}
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<ShoppingCartIcon />}
                    disabled={
                      isAddingToCart ||
                      product.stock <= 0 ||
                      quantity > product.stock ||
                      (Boolean(product.size?.length) && !selectedSize)
                    }
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    {isAddingToCart ? "Adding..." : "Add to Cart"}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </>
        )}
      </Box>

      <Footer />
    </Box>
  );
};

export default ProductDetailPage;
