export type AddToCartRequest = {
  productId: string;
  quantity: number;
  size: string;
  // userId: string;
};

export type removeFromCartRequest = {
  cartItemId: string;
}