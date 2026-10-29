// import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";

interface CatogeryListProps {
  onCategorySelect: (category: string) => void;
}

// import { useGetProductByCategoryMutation } from "../service/product.auth";
// Apne project ke according import path change karna.

// import type { Product } from "../service/product.auth";

const categories = [
  { name: "Women", desc: "Western Wear · Ethnic Wear · Dresses", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0YE4EUVXbShiksVFaO9_aNG6df0q2XVojEatzFsSN7Q&s=10" },
  { name: "Men", desc: "Western Wear · Ethnic Wear · Shirts", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN3sMhAP1E-yZKvmu90O58oyFC1-TwIMml17cDNj_Z4A&s=10" },
  { name: "Kids", desc: "Clothing · Toys · Footwear", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRYtj0u4KGNqNg845ezSZx2otfixU01ZJ3kXMFM-9pDQ&s=10" },
  { name: "Electronics", desc: "Mobiles · Laptops · Gadgets", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKLGm_1Knrfz6frKBPK_Sgu5xCNeJJMSx0PFBqIaEB4Q&s=10" },
  { name: "Foot_Wear", desc: "Sneakers · Sandals · Formal Shoes", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAE-urSnyR-VUCgoeUWMnmFPL9eGrZeo4aKn9NBHHBgA&s=10" },
  { name: "Accessories", desc: "Bags · Watches · Belts · Jewelry", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR92W7o60_vu20UDmmOENb3hrcdyXg0-4qz8IbHZh2pYQ&s=10" },
];

export const CatogeryList = ({ onCategorySelect }: CatogeryListProps) => {
  // const [selectedCategory, setSelectedCategory] =
  //   useState<string>("");

  // const [products, setProducts] = useState<Product[]>([]);

  // const [getProductsByCategory, { isLoading, error }] =
  //   useGetProductByCategoryMutation();

  // const handleCategoryClick = async (category: string) => {
  //   setSelectedCategory(category);
  //   setProducts([]);

  //   try {
  //     const response = await getProductsByCategory({
  //       productCategory: category,
  //     }).unwrap();

  //     setProducts(response.data?.products ?? []);
  //   } catch (err) {
  //     console.error("Failed to fetch category products:", err);
  //   }
  // };

  // console.log(products)

  return (
    <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
      <Button onClick={() => onCategorySelect("")}>
        All Products
      </Button>

      {categories.map((cat) => (
        <Card
          key={cat.name}
          onClick={() => onCategorySelect(cat.name)}
          sx={{ minWidth: 180, cursor: "pointer" }}
        >
          <CardMedia
            component="img"
            height="140"
            image={cat.image}
            alt={cat.name}
          />

          <CardContent>
            <Typography sx={{fontWeight:"bold"}}>
              {cat.name.replace("_", " ")}
            </Typography>

            <Typography variant="body2">
              {cat.desc}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CatogeryList;
