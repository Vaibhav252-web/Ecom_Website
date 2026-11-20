import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

import {
  getApiErrorMessage,
  useGetOrderByIdQuery,
  useVerifyPaymentMutation,
} from "../service/order.auth";
import {
  formatDate,
  getDeliveryText,
  formatPrice,
  imageUrl,
  orderStatusColor,
  paymentStatusColor,
} from "../utils/orderUi";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("orderId") ?? "";
  // Only present when the user comes back from Stripe
  const sessionId = searchParams.get("session_id") ?? "";

  const [verifyPayment, { error: verifyError, data: verifyData }] =
    useVerifyPaymentMutation();

  const {
    data: orderResponse,
    isLoading: isOrderLoading,
    isError: isOrderError,
  } = useGetOrderByIdQuery(orderId, { skip: !orderId });

  const order = orderResponse?.data.order;

  // Confirm the Stripe payment once
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!orderId || !sessionId || verifiedRef.current) return;

    verifiedRef.current = true;
    verifyPayment({ orderId, sessionId });
  }, [orderId, sessionId, verifyPayment]);

  const retryVerify = () => {
    if (orderId && sessionId) {
      verifyPayment({ orderId, sessionId });
    }
  };

  if (!orderId) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">Order not found.</Alert>
      </Container>
    );
  }

  // Back from Stripe and we have no answer yet from the server
  const isConfirming = Boolean(sessionId) && !verifyData && !verifyError;

  if (isOrderLoading || isConfirming) {
    return (
      <Stack  sx={{ py: 12, alignItems:"center", spacing:2 }}>
        <CircularProgress />
        <Typography color="text.secondary">
          {isConfirming ? "Confirming your payment..." : "Loading your order..."}
        </Typography>
      </Stack>
    );
  }

  if (isOrderError || !order) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">We could not load this order.</Alert>
      </Container>
    );
  }

  // Back from Stripe but the payment could not be confirmed
  const paymentProblem =
    Boolean(sessionId) &&
    (Boolean(verifyError) || verifyData?.data.paid === false);

  const deliveryText = getDeliveryText(order);

  const isPaymentPending =
    order.paymentMethod === "ONLINE" && order.paymentStatus !== "PAID";

  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Stack  sx={{ mb: 4, textAlign: "center", alignItems:"center", spacing:1 }}>
          <CheckCircleOutlinedIcon
            sx={{
              fontSize: 72,
              color: isPaymentPending ? "warning.main" : "success.main",
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {isPaymentPending ? "Payment pending" : "Order placed!"}
          </Typography>
          <Typography color="text.secondary">
            {isPaymentPending
              ? "We have not received your payment yet."
              : order.paymentMethod === "COD"
                ? "Thank you! Please keep the cash ready at delivery."
                : "Thank you! Your payment was successful."}
          </Typography>
        </Stack>

        {paymentProblem && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={retryVerify}>
                Check again
              </Button>
            }
          >
            {verifyError
              ? getApiErrorMessage(verifyError)
              : "Your payment is not confirmed yet."}
          </Alert>
        )}

        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack sx={{
              direction:"row", justifyContent:"space-between", flexWrap:"wrap", gap:1
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Order ID
                </Typography>
                <Typography sx={{ fontWeight: 600, wordBreak: "break-all" }}>
                  {order._id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Placed on
                </Typography>
                <Typography sx={{ fontWeight: 600 }}>
                  {formatDate(order.createdAt)}
                </Typography>
              </Box>
            </Stack>

            {deliveryText && (
              <Alert icon={<LocalShippingOutlinedIcon />} severity="info" sx={{ mt: 2 }}>
                {deliveryText}
              </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
              <Chip
                size="small"
                label={order.orderStatus}
                color={orderStatusColor(order.orderStatus)}
              />
              <Chip
                size="small"
                variant="outlined"
                label={
                  order.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : `Online • ${order.paymentStatus}`
                }
                color={paymentStatusColor(order.paymentStatus)}
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              {order.items.map((item) => (
                <Stack key={item._id} sx={{
                  direction:"row", spacing:2, alignItems:"center"
                }}>
                  <Avatar
                    variant="rounded"
                    src={imageUrl(item.image)}
                    alt={item.title}
                    sx={{ width: 52, height: 52 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty {item.quantity}
                      {item.size ? ` • Size ${item.size}` : ""}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack  sx={{ mb: 2, direction:"row", justifyContent:"space-between" }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatPrice(order.totalAmount)}
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Delivering to
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {order.shippingAddress.fullName} • {order.shippingAddress.phone}
            </Typography>
            <Typography color="text.secondary">
              {order.shippingAddress.addressLine}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} - {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.country}
            </Typography>
          </CardContent>
        </Card>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/my-orders")}
            sx={{ textTransform: "none", py: 1.2 }}
          >
            View my orders
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/user-dashbord")}
            sx={{ textTransform: "none", py: 1.2 }}
          >
            Continue shopping
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default OrderSuccess;
