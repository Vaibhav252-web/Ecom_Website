import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import {
  getApiErrorMessage,
  useCancleOrderMutation,
  useGetMyOrderQuery,
} from "../service/order.auth";
import type { Order } from "../service/order.auth";
import {
  formatDate,
  getDeliveryText,
  formatPrice,
  imageUrl,
  orderStatusColor,
  paymentStatusColor,
} from "../utils/orderUi";

const CANCELLABLE = ["PLACED", "CONFIRMED", "PROCESSING"];

const MyOrders = () => {
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useGetMyOrderQuery();
  const [cancleOrder] = useCancleOrderMutation();

  const [openId, setOpenId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const orders: Order[] = response?.data.myOrder ?? [];

  const handleCancel = async (order: Order) => {
    const refundNote =
      order.paymentStatus === "PAID" ? " Your payment will be refunded." : "";

    if (!window.confirm(`Cancel this order?${refundNote}`)) return;

    setMessage(null);
    setCancellingId(order._id);

    try {
      await cancleOrder({ orderId: order._id }).unwrap();
      setMessage({
        type: "success",
        text:
          order.paymentStatus === "PAID"
            ? "Order cancelled. Your refund has been started."
            : "Order cancelled.",
      });
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error) });
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fb", minHeight: "100vh", py: 5 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/user-dashbord")}
          sx={{ textTransform: "none", mb: 1 }}
        >
          Back to shopping
        </Button>

        <Stack  sx={{ mb: 3, direction:"row", spacing:1.5, alignItems:"center" }}>
          <ReceiptLongIcon sx={{ fontSize: 34, color: "primary.main" }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            My Orders
          </Typography>
        </Stack>

        {message && (
          <Alert
            severity={message.type}
            onClose={() => setMessage(null)}
            sx={{ mb: 2 }}
          >
            {message.text}
          </Alert>
        )}

        {isError && (
          <Alert severity="error">Unable to load your orders. Please try again.</Alert>
        )}

        {!isError && orders.length === 0 && (
          <Card sx={{ borderRadius: 3, boxShadow: 2, textAlign: "center", p: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No orders yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              When you place an order it will show up here.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/user-dashbord")}
              sx={{ textTransform: "none" }}
            >
              Start shopping
            </Button>
          </Card>
        )}

        <Stack spacing={2}>
          {orders.map((order) => {
            const isOpen = openId === order._id;
            const canCancel = CANCELLABLE.includes(order.orderStatus);
            const deliveryText = getDeliveryText(order);

            return (
              <Card key={order._id} sx={{ borderRadius: 3, boxShadow: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    sx={{
                      direction:"row",
                    justifyContent:"space-between",
                    alignItems:"flex-start",
                    flexWrap:"wrap",
                    gap:1
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        Order #{order._id.slice(-8).toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(order.createdAt)}
                      </Typography>
                      {deliveryText && (
                        <Typography
                          variant="body2"
                          sx={{ color: "info.main", fontWeight: 600, mt: 0.5 }}
                        >
                          {deliveryText}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1}>
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
                            ? "COD"
                            : `Online • ${order.paymentStatus}`
                        }
                        color={paymentStatusColor(order.paymentStatus)}
                      />
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                    {order.items.slice(0, 4).map((item) => (
                      <Avatar
                        key={item._id}
                        variant="rounded"
                        src={imageUrl(item.image)}
                        alt={item.title}
                        sx={{ width: 52, height: 52 }}
                      />
                    ))}
                    {order.items.length > 4 && (
                      <Avatar variant="rounded" sx={{ width: 52, height: 52 }}>
                        +{order.items.length - 4}
                      </Avatar>
                    )}
                  </Stack>

                  <Stack
                    sx={{
                      direction:"row",
                    justifyContent:"space-between",
                    alignItems:"center",
                    flexWrap:"wrap",
                    gap:1
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {formatPrice(order.totalAmount)}
                    </Typography>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => setOpenId(isOpen ? null : order._id)}
                        sx={{ textTransform: "none" }}
                      >
                        {isOpen ? "Hide details" : "View details"}
                      </Button>

                      {canCancel && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={cancellingId === order._id}
                          onClick={() => handleCancel(order)}
                          sx={{ textTransform: "none" }}
                        >
                          {cancellingId === order._id ? "Cancelling..." : "Cancel order"}
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  <Collapse in={isOpen} unmountOnExit>
                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      {order.items.map((item) => (
                        <Stack
                          key={item._id}
                          sx={{
                            direction:"row",
                          justifyContent:"space-between",
                          gap:2
                          }}
                        >
                          <Typography sx={{ overflowWrap: "anywhere" }}>
                            {item.title}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {" "}
                              × {item.quantity}
                              {item.size ? ` • ${item.size}` : ""}
                            </Typography>
                          </Typography>
                          <Typography>
                            {formatPrice(item.price * item.quantity)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="body2" color="text.secondary">
                      Delivering to
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {order.shippingAddress.fullName} •{" "}
                      {order.shippingAddress.phone}
                    </Typography>
                    <Typography color="text.secondary">
                      {order.shippingAddress.addressLine},{" "}
                      {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.postalCode},{" "}
                      {order.shippingAddress.country}
                    </Typography>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default MyOrders;
