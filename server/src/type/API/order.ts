
export type PlaceOrderRequest = {
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  paymentMethod: "COD" | "ONLINE";
}