import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setId } from "../utils/productIdSlice";

import type { Product } from "../service/product.auth";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleCardClick = (productId: string) => {
    dispatch(setId(productId));
    console.log(productId);
    navigate("/Product-detail");
  };
  return (
    <Card
      onClick={() => handleCardClick(product._id)}
      sx={{
        height: "100%",
        boxShadow: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={
          product.images?.[0]
            ? `http://localhost:4040${product.images[0]}`
            : "/placeholder.png"
        }
        alt={product.title}
        sx={{ objectFit: "cover" }}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography sx={{ variant: "h6", fontWeight: "bold" }}>
          {product.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {product.description}
        </Typography>

        <Typography variant="body2">{product.brand}</Typography>

        <Typography
          variant="h6"
          color="primary"
          sx={{ mt: 1.5, fontWeight: 600 }}
        >
          ₹{product.price}/-
        </Typography>
      </CardContent>

      {/* <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
        onClick={() => handleAddToCart(product._id, product.size )}
          variant="contained"
          fullWidth
          disabled={product.stock === 0}
          sx={{ textTransform: "none", fontWeight: "bold" }}
        >
          Add to Cart
        </Button>
      </CardActions> */}
    </Card>
  );
};

export default ProductCard;
