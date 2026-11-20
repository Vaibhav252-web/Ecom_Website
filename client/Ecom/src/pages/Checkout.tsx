import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

import { useGetCartQuery } from "../service/productCart.auth";
import {
  getApiErrorMessage,
  usePlaceOrderMutation,
} from "../service/order.auth";
import type { PaymentMethod, ShippingAddress } from "../service/order.auth";
import { formatPrice, imageUrl } from "../utils/orderUi";

type AddressErrors = Partial<Record<keyof ShippingAddress, string>>;

const emptyAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const validate = (address: ShippingAddress): AddressErrors => {
  const errors: AddressErrors = {};

  if (address.fullName.trim().length < 3) {
    errors.fullName = "Enter your full name";
  }
  if (!/^\d{10}$/.test(address.phone.trim())) {
    errors.phone = "Enter a valid 10 digit phone number";
  }
  if (address.addressLine.trim().length < 5) {
    errors.addressLine = "Enter your full address";
  }
  if (!address.city.trim()) {
    errors.city = "Enter your city";
  }
  if (!address.state.trim()) {
    errors.state = "Enter your state";
  }
  if (!/^\d{6}$/.test(address.postalCode.trim())) {
    errors.postalCode = "Enter a valid 6 digit PIN code";
  }
  if (!address.country.trim()) {
    errors.country = "Enter your country";
  }

  return errors;
};

const Checkout = () => {
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useGetCartQuery();
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();

  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [submitError, setSubmitError] = useState("");
  // Stays true while the browser is being sent to Stripe
  const [redirecting, setRedirecting] = useState(false);

  const items = response?.data?.cart?.items ?? [];

  const subtotal = items.reduce(
    (total, item) => total + (item.product?.price ?? 0) * item.quantity,
    0,
  );

  const handleChange =
    (field: keyof ShippingAddress) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setAddress((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handlePlaceOrder = async () => {
    setSubmitError("");

    const validationErrors = validate(address);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const result = await placeOrder({
        shippingAddress: {
          fullName: address.fullName.trim(),
          phone: address.phone.trim(),
          addressLine: address.addressLine.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          postalCode: address.postalCode.trim(),
          country: address.country.trim(),
        },
        paymentMethod,
      }).unwrap();

      const { order, checkoutUrl } = result.data;

      if (paymentMethod === "ONLINE") {
        if (!checkoutUrl) {
          throw new Error("Could not start the payment. Please try again.");
        }

        // Go to Stripe's secure payment page
        setRedirecting(true);
        window.location.assign(checkoutUrl);
        return;
      }

      navigate(`/order-success?orderId=${order._id}`, { replace: true });
    } catch (error) {
      setRedirecting(false);
      setSubmitError(getApiErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
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

  if (items.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Your cart is empty
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Add some products before checking out.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/user-dashbord")}
          sx={{ textTransform: "none" }}
        >
          Continue shopping
        </Button>
      </Container>
    );
  }

  const busy = isPlacing || redirecting;

  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/product-cart")}
          sx={{ textTransform: "none", mb: 1 }}
        >
          Back to cart
        </Button>

        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Checkout
        </Typography>

        <Grid container spacing={3}>
          {/* Left: address + payment */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <LocalShippingOutlinedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Shipping address
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Full name"
                      fullWidth
                      value={address.fullName}
                      onChange={handleChange("fullName")}
                      error={Boolean(errors.fullName)}
                      helperText={errors.fullName}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Phone number"
                      fullWidth
                      value={address.phone}
                      onChange={handleChange("phone")}
                      error={Boolean(errors.phone)}
                      helperText={errors.phone}
                      slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Address (house no, street, area)"
                      fullWidth
                      multiline
                      minRows={2}
                      value={address.addressLine}
                      onChange={handleChange("addressLine")}
                      error={Boolean(errors.addressLine)}
                      helperText={errors.addressLine}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="City"
                      fullWidth
                      value={address.city}
                      onChange={handleChange("city")}
                      error={Boolean(errors.city)}
                      helperText={errors.city}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="State"
                      fullWidth
                      value={address.state}
                      onChange={handleChange("state")}
                      error={Boolean(errors.state)}
                      helperText={errors.state}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="PIN code"
                      fullWidth
                      value={address.postalCode}
                      onChange={handleChange("postalCode")}
                      error={Boolean(errors.postalCode)}
                      helperText={errors.postalCode}
                      slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 6 } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Country"
                      fullWidth
                      value={address.country}
                      onChange={handleChange("country")}
                      error={Boolean(errors.country)}
                      helperText={errors.country}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Payment method
                </Typography>

                <RadioGroup
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod)
                  }
                >
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor:
                        paymentMethod === "COD" ? "primary.main" : "divider",
                      borderRadius: 2,
                      px: 2,
                      mb: 1.5,
                    }}
                  >
                    <FormControlLabel
                      value="COD"
                      control={<Radio />}
                      sx={{ width: "100%", py: 1 }}
                      label={
                        <Stack sx={{
                            direction:"row", spacing:1.5, alignItems:"center"
                        }}>
                          <PaymentsOutlinedIcon color="action" />
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              Cash on Delivery
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pay in cash when your order arrives
                            </Typography>
                          </Box>
                        </Stack>
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor:
                        paymentMethod === "ONLINE" ? "primary.main" : "divider",
                      borderRadius: 2,
                      px: 2,
                    }}
                  >
                    <FormControlLabel
                      value="ONLINE"
                      control={<Radio />}
                      sx={{ width: "100%", py: 1 }}
                      label={
                        <Stack sx={{
                            direction:"row", spacing:1.5, alignItems:"center"
                        }}>
                          <CreditCardIcon color="action" />
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                              Pay online (Card)
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Secure payment powered by Stripe
                            </Typography>
                          </Box>
                        </Stack>
                      }
                    />
                  </Box>
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>

          {/* Right: order summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, position: "sticky", top: 24 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Order summary
                </Typography>

                <Stack spacing={2}>
                  {items.map((item) => (
                    <Stack
                      key={item._id}
                      sx={{
                        direction:"row",
                      spacing:2,
                      alignItems:"center"
                      }}
                    >
                      <Avatar
                        variant="rounded"
                        src={imageUrl(item.product?.images?.[0])}
                        alt={item.product?.title ?? "Product"}
                        sx={{ width: 56, height: 56 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
                        >
                          {item.product?.title ?? "Product unavailable"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Qty {item.quantity}
                          {item.size ? ` • Size ${item.size}` : ""}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 600 }}>
                        {formatPrice((item.product?.price ?? 0) * item.quantity)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  <Stack sx={{
                    direction:"row", justifyContent:"space-between"
                  }}>
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography>{formatPrice(subtotal)}</Typography>
                  </Stack>
                  <Stack sx={{
                    direction:"row", justifyContent:"space-between"
                  }}>
                    <Typography color="text.secondary">Shipping</Typography>
                    <Typography color="success.main">Free</Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack  sx={{ mb: 2, direction:"row", justifyContent:"space-between" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {formatPrice(subtotal)}
                  </Typography>
                </Stack>

                {submitError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {submitError}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={busy}
                  onClick={handlePlaceOrder}
                  sx={{ py: 1.5, borderRadius: 2, textTransform: "none" }}
                >
                  {busy ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : paymentMethod === "ONLINE" ? (
                    `Pay ${formatPrice(subtotal)}`
                  ) : (
                    "Place order"
                  )}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;
