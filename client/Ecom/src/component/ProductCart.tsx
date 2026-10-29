import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  // Grid,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
// import Footer from "./Footer";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateQuantityMutation,
} from "../service/productCart.auth";

const ProductCart = () => {
  const BASE_URL = "http://localhost:4040";
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useGetCartQuery();

  const [removeFromCart, { isLoading: isRemoving }] =
    useRemoveFromCartMutation();

  const [updateQuantity] = useUpdateQuantityMutation();

  console.log("Full RTK response:", response);
  // Supports both empty and non-empty cart responses
  const cartData = response?.data;
  console.log(cartData);
  const items = cartData?.cart?.items ?? [];
  console.log(items);

  const totalItems =
    cartData?.totalItems ??
    items.reduce((total, item) => total + item.quantity, 0);

  const subtotal =
    cartData?.subtotal ??
    items.reduce(
      (total, item) => total + (item.product?.price ?? 0) * item.quantity,
      0,
    );

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart({ cartItemId }).unwrap();
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    }
  };

  const handleIncrenment = async (productId: string, action: string) => {
    try {
      const response = await updateQuantity({ productId, action }).unwrap();
      console.log(response);
    } catch (error) {
      console.log("Failed to increnment", error);
    }
  };

  const handleDecrenment = async (productId: string, action: string) => {
    try {
      const response = await updateQuantity({ productId, action }).unwrap();
      console.log(response);
    } catch (error) {
      console.log("Failed to increnment", error);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 5 }}>
        <Alert severity="error">
          Unable to load your cart. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Stack
          sx={{
            direction: "row",
            alignItems: "center",
            spacing: 1.5,
            mb: 4,
          }}
        >
          <ShoppingCartOutlinedIcon
            sx={{ fontSize: 34, color: "primary.main" }}
          />

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              My Cart
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </Typography>
          </Box>
        </Stack>

        {items.length === 0 ? (
          /* Empty Cart */
          <Card
            sx={{
              textAlign: "center",
              py: 7,
              px: 2,
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <ShoppingCartOutlinedIcon
              sx={{ fontSize: 70, color: "text.disabled", mb: 2 }}
            />

            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Your cart is empty
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Looks like you haven't added anything yet.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/user-dashbord")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                borderRadius: 2,
              }}
            >
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Cart Items */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                {items.map((item) => (
                  <Card
                    key={item._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: { xs: 1, sm: 2 },
                      borderRadius: 3,
                      boxShadow: 2,
                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`${BASE_URL}${item.product.images[0]}`}
                      alt={item.product?.title ?? "Product"}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/product.jpg";
                      }}
                      sx={{
                        width: { xs: 90, sm: 130 },
                        height: { xs: 100, sm: 130 },
                        objectFit: "cover",
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <CardContent
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        p: { xs: 0.5, sm: 1 },
                        "&:last-child": { pb: 1 },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: { xs: "0.95rem", sm: "1.15rem" },
                          overflowWrap: "anywhere",
                          fontWeight: 700,
                        }}
                      >
                        {item.product?.title ?? "Product unavailable"}
                      </Typography>

                      {item.size && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Size: {item.size}
                        </Typography>
                      )}

                      {/* <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "flex", alignItems: "center" }}
                      >
                        Quantity: {item.quantity}
                        <Typography variant="h3" sx={{
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",

                        }}>
                          <Button
                          sx={{
                            p:0,
                            m:0,
                          }}
                            onClick={() =>
                              handleIncrenment(item.product._id, "increnment")
                            }
                          >
                            +
                          </Button>
                          <Button
                          sx={{
                            p:0,
                            m:0,
                          }}
                            onClick={() =>
                              handleDecrenment(item.product._id, "decrenment")
                            }
                          >
                            -
                          </Button>
                        </Typography>
                      </Typography> */}

                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          Quantity:
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            overflow: "hidden",
                            height: 34,
                            bgcolor: "background.paper",
                          }}
                        >
                          <Button
                            onClick={() =>
                              handleDecrenment(item.product._id, "decrenment")
                            }
                            disabled={item.quantity <= 1}
                            sx={{
                              minWidth: 34,
                              width: 34,
                              height: "100%",
                              p: 0,
                              borderRadius: 0,
                              fontSize: 20,
                              color: "text.primary",
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            −
                          </Button>

                          <Typography
                            sx={{
                              minWidth: 32,
                              textAlign: "center",
                              fontSize: 14,
                              fontWeight: 600,
                              color: "text.primary",
                            }}
                          >
                            {item.quantity}
                          </Typography>

                          <Button
                            onClick={() =>
                              handleIncrenment(item.product._id, "increnment")
                            }
                            sx={{
                              minWidth: 34,
                              width: 34,
                              height: "100%",
                              p: 0,
                              borderRadius: 0,
                              fontSize: 20,
                              color: "text.primary",
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            +
                          </Button>
                        </Box>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          mt: 1,
                          fontSize: { xs: "1rem", sm: "1.2rem" },
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      >
                        ₹
                        {(
                          (item.product?.price ?? 0) * item.quantity
                        ).toLocaleString("en-IN")}
                      </Typography>

                      <Button
                        size="small"
                        color="error"
                        // startIcon={<DeleteOutlineIcon />}
                        disabled={isRemoving}
                        onClick={() => handleRemove(item._id)}
                        sx={{
                          mt: 0.5,
                          textTransform: "none",
                          px: 0,
                        }}
                      >
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Order Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 2,
                  position: { md: "sticky" },
                  top: 24,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 700 }}
                  >
                    Order Summary
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={2}>
                    <Stack
                      sx={{
                        direction: "row",
                        justifyContent: "space-between",
                        spacing: 2,
                      }}
                    >
                      <Typography color="text.secondary">
                        Items ({totalItems})
                      </Typography>

                      <Typography sx={{ fontWeight: 500 }}>
                        ₹{subtotal.toLocaleString("en-IN")}
                      </Typography>
                    </Stack>

                    <Stack
                      sx={{
                        direction: "row",
                        justifyContent: "space-between",
                        spacing: 2,
                      }}
                    >
                      <Typography color="text.secondary">Shipping</Typography>

                      <Typography
                        sx={{ color: "success.main", fontWeight: 600 }}
                      >
                        Free
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack
                      sx={{
                        direction: "row",
                        justifyContent: "space-between",
                        spacing: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{
                          color: "primary.main",
                          fontWeight: 700,
                        }}
                      >
                        ₹{subtotal.toLocaleString("en-IN")}
                      </Typography>
                    </Stack>

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      onClick={() => navigate("/checkout")}
                      sx={{
                        mt: 1,
                        py: 1.3,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                      }}
                    >
                      Proceed to Checkout
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate("/user-dashbord")}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                      }}
                    >
                      Continue Shopping
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
      {/* <Box sx={{mt:3}}>
          <Footer/>
        </Box> */}
    </Box>
  );
};

export default ProductCart;
