import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

import {
  getApiErrorMessage,
  useCancleOrderMutation,
} from "../service/order.auth";

// Stripe sends the user here when they close / cancel the payment page
const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";

  const [cancleOrder, { isLoading, error }] = useCancleOrderMutation();

  // Cancel the unpaid order once so the reserved stock is released
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!orderId || cancelledRef.current) return;

    cancelledRef.current = true;
    cancleOrder({ orderId });
  }, [orderId, cancleOrder]);

  if (isLoading) {
    return (
      <Stack  sx={{ py: 12, alignItems:"center", spacing:2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Cancelling your payment...</Typography>
      </Stack>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
      <HighlightOffIcon sx={{ fontSize: 72, color: "error.main" }} />

      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 1 }}>
        Payment cancelled
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        No money was charged. Your items are still saved in your cart.
      </Typography>

      {Boolean(error) && (
        <Alert severity="info" sx={{ mb: 3, textAlign: "left" }}>
          {getApiErrorMessage(error)}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/checkout", { replace: true })}
          sx={{ textTransform: "none", py: 1.2 }}
        >
          Try again
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate("/product-cart")}
          sx={{ textTransform: "none", py: 1.2 }}
        >
          Back to cart
        </Button>
      </Stack>
    </Container>
  );
};

export default PaymentCancelled;
