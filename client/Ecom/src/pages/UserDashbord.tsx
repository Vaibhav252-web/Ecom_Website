import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import NavBar from "../component/NavBar";
import CatogeryList from "../component/CatogeryList";
import ProductCard from "../component/ProductCard";
import Footer from "../component/Footer";
import {
  useGetAllProductQuery,
  useGetProductByCategoryMutation,
} from "../service/product.auth";
import type { Product } from "../service/product.auth";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import { useNavigate } from "react-router-dom";

const UserDashbord = () => {
  // const navigate = useNavigate();
  const { data, isLoading: isLoadingAll } = useGetAllProductQuery();

  const [getProductsByCategory, { isLoading: isLoadingCategory }] =
    useGetProductByCategoryMutation();

  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(
    null,
  );

  // NavBar filter connection
  const [sortBy, setSortBy] = useState("");

  const handleFilterChange = (filter: string) => {
    setSortBy(filter);
  };

  const allProducts = data?.data?.AllProduct ?? [];

  // const displayedProducts = filteredProducts ?? allProducts;

  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

  const displayedProducts = [...(filteredProducts ?? allProducts)]
    .filter((product) => {
      if (sortBy !== "newest") return true;

      const createdAt = new Date(product.createdAt).getTime();

      return createdAt >= twoDaysAgo && createdAt <= Date.now();
    })
    .sort((a, b) => {
      if (sortBy === "Newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (sortBy === "price-low-high") return a.price - b.price;
      if (sortBy === "price-high-low") return b.price - a.price;

      if (sortBy === "Availability") {
        return Number(b.stock > 0) - Number(a.stock > 0);
      }

      return 0;
    });

  const handleCategorySelect = async (category: string) => {
    if (!category) {
      setFilteredProducts(null);
      return;
    }

    try {
      const response = await getProductsByCategory({
        productCategory: category,
      }).unwrap();

      setFilteredProducts(response.data?.products ?? []);
    } catch (error) {
      console.error("Category fetch failed:", error);
    }
  };

  const handleChange = () => {};

  const isLoading = isLoadingAll || isLoadingCategory;

  // const handleBack = () => {
  //   navigate(-1); // Previous page
  // };

  // const handleForward = () => {
  //   navigate(1); // Next page in browser history
  // };

  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavBar
        onFilterChange={handleFilterChange}
        onCategoryChange={handleChange}
      />
      {/* 
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pt: 2,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ textTransform: "none" }}
        >
          Back
        </Button>

        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleForward}
          sx={{ textTransform: "none" }}
        >
          Forward
        </Button>
      </Box> */}

      <Box sx={{ flexGrow: 1, mx: { xs: 2, md: 4 }, my: 3 }}>
        <Typography sx={{ variant: "h5", fontWeight: "bold", mb: 2 }}>
          Product Categories
        </Typography>

        <CatogeryList onCategorySelect={handleCategorySelect} />

        <Box sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography sx={{ variant: "h5", fontWeight: "bold" }}>
              {filteredProducts === null ? "All Products" : "Filtered Products"}
            </Typography>

            {filteredProducts !== null && (
              <Button onClick={() => handleCategorySelect("")}>
                Clear Filter
              </Button>
            )}
          </Box>

          {isLoading ? (
            <Typography>Loading products...</Typography>
          ) : displayedProducts.length === 0 ? (
            <Typography>No products found.</Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {displayedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default UserDashbord;
