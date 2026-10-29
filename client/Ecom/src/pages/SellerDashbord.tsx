// import { useCallback } from "react";
import NavBar from "../component/NavBar";
import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableBody,
  TableRow,
  Paper,
} from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
import Footer from "../component/Footer";
// import EditIcon from "@mui/icons-material/Edit";
// import ShareIcon from '@mui/icons-material/Share';
// import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  useGetAllProductQuery,
  useGetProductByCategoryMutation,
} from "../service/product.auth";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import AddProduct from "../component/AddProduct";
import DeleteProduct from "../component/DeleteProduct";
import UpdateProduct from "../component/UpdateProduct";
import type { Product } from "../service/product.auth";

const SellerDashbord = () => {
  const { data, isLoading: isLoadingAll } = useGetAllProductQuery();

  const [getProductsByCategory, { isLoading: isLoadingCategory }] =
    useGetProductByCategoryMutation();

  const [filteredProducts, setFilteredProducts] = useState<Product[] | null>(
    null,
  );
  const [sortBy, setSortBy] = useState("");

  const Product = data?.data?.AllProduct ?? [];
  const totalPrice = Product.reduce((sum, product) => sum + product.price, 0);

  const handleFilterChange = (filter: string) => {
    setSortBy(filter);
  };

  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const displayedProducts = [...(filteredProducts ?? Product)]
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
  console.log(totalPrice);

  return (
    <Box
      sx={{
        bgcolor: "#f8f9fa",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <NavBar onFilterChange={handleFilterChange} onCategoryChange={handleCategorySelect}/>

      {/* Dashboard Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
          m: { xs: 2, md: 3 },
          p: { xs: 1, md: 2 },
        }}
      >
        {/* Total Products */}
        <Box
          sx={{
            p: 3,
            minHeight: 145,
            borderRadius: 3,
            bgcolor: "#ffffff",
            border: "1px solid #e5eaf0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.09)",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Total Products
              </Typography>

              <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                {Product.length}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Products listed in your store
              </Typography>
            </Box>

            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#e8f2ff",
                color: "#1976d2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Inventory2OutlinedIcon fontSize="large" />
            </Box>
          </Box>
        </Box>

        {/* Total Product Value */}
        <Box
          sx={{
            p: 3,
            minHeight: 145,
            borderRadius: 3,
            bgcolor: "#ffffff",
            border: "1px solid #e5eaf0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.09)",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Total Product Value
              </Typography>

              <Typography
                variant="h4"
                sx={{ mt: 1, overflowWrap: "anywhere", fontWeight: "bold" }}
              >
                ₹{totalPrice.toLocaleString("en-IN")}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Combined listed prices
              </Typography>
            </Box>

            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#e4f8ed",
                color: "#169b62",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CurrencyRupeeIcon fontSize="large" />
            </Box>
          </Box>
        </Box>

        {/* Total Stock */}
        <Box
          sx={{
            p: 3,
            minHeight: 145,
            borderRadius: 3,
            bgcolor: "#ffffff",
            border: "1px solid #e5eaf0",
            boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 10px 25px rgba(0,0,0,0.09)",
            },
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography color="text.secondary" variant="body2">
                Total Stock
              </Typography>

              <Typography variant="h4" sx={{ mt: 1, fontWeight: "bold" }}>
                {Product.reduce(
                  (sum, product) => sum + (Number(product.stock) || 0),
                  0,
                )}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Units available across products
              </Typography>
            </Box>

            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2,
                bgcolor: "#fff0df",
                color: "#ed8b19",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InventoryOutlinedIcon fontSize="large" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Product Section */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pb: 4,
          mt: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {/* {filteredProducts === null
      ? "All Products"
      : "Filtered Products"} */}
            Products
          </Typography>

          <AddProduct />
        </Box>

        {/* Responsive Product Table */}
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{
            width: "100%",
            overflowX: "auto",
            borderRadius: "8px",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="seller products table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#e8f2fc" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Category
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Stock
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            {displayedProducts.map((pro, index) => {
              return (
                <TableBody key={index}>
                  <TableRow
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                      "&:hover": {
                        backgroundColor: "#f5f9ff",
                      },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {pro.title}
                    </TableCell>
                    <TableCell align="right">{pro.price}</TableCell>
                    <TableCell align="right">{pro.category}</TableCell>
                    <TableCell align="right">{pro.stock}</TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        p: 1,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UpdateProduct productId={pro._id} />

                      <DeleteProduct productId={pro._id} />

                      <Button>
                        <OpenInNewIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              );
            })}
          </Table>
        </TableContainer>
      </Box>
      <Box>
        {/* <AddProduct/> */}
        {/* <DeleteProduct/> */}
      </Box>
      <Footer />
    </Box>
  );
};

export default SellerDashbord;
