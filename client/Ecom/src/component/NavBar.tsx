import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";

interface NavBarProps {
  onFilterChange: (filter: string) => void;
  onCategoryChange: (category: string) => void;
}

import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useGetUserQuery, authUserApi } from "../service/user.auth";

const NavBar = ({ onFilterChange, onCategoryChange }: NavBarProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Get user ID from localStorage
  const userId = localStorage.getItem("userId");

  const userRole = localStorage.getItem("userRole");

  // RTK Query automatically fetches and caches user data
  const {
    data,
    isLoading,
    // isFetching,
    // error,
  } = useGetUserQuery({ userId: userId ?? "" }, { skip: !userId });

  // Get user from API response
  const userData = data?.data.user;

  const userInitial = userData?.username
    ? userData.username.charAt(0).toUpperCase()
    : "V";

  console.log(userInitial);

  const displayName = userData?.username || "Guest";

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Clear cached API data
    dispatch(authUserApi.util.resetApiState());

    // Clear authentication data
    localStorage.clear();

    navigate("/login");
  };

  const handleBack = () => {
    navigate(-1); // Previous page
  };

  const handleForward = () => {
    navigate(1); // Next page in browser history
  };

  return (
    <AppBar position="static">
      <Toolbar
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: 0.5,
          flexWrap: { xs: "wrap", md: "nowrap" },
          py: { xs: 1, md: 0 },
        }}
      >
        {/* Welcome Message */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: { xs: 1, md: 0 },
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              mr: { md: 4 },
              fontSize: { xs: "1rem", sm: "1.25rem" },
              whiteSpace: "nowrap",
            }}
          >
            {isLoading ? "Loading..." : `Welcome to the store ${displayName}!`}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            alignContent: "center",
            maxWidth: 1200,
            mx: "auto",
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              color: "#fff",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          ></Button>

          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={handleForward}
            sx={{
              color: "#fff",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          ></Button>
        </Box>

        {/* Search Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderRadius: 1,
            px: 1,
            py: 0.5,
            flexGrow: 1,
            maxWidth: { xs: "100%", md: 400 },
            order: { xs: 3, md: 2 },
            width: { xs: "100%", md: "auto" },
            mt: { xs: 1, md: 0 },
          }}
        >
          <SearchIcon sx={{ mr: 1, color: "inherit" }} />

          <InputBase
            placeholder="Search..."
            inputProps={{ "aria-label": "search" }}
            fullWidth
            sx={{
              color: "inherit",
              "& input::placeholder": {
                color: "inherit",
                opacity: 0.7,
              },
            }}
          />
        </Box>

        {/* Desktop Menu */}
        {!isMobile ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              order: 3,
            }}
          >
            {/* Product Filters */}

            <FormControl
              size="small"
              sx={{
                minWidth: 140,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: 1,
              }}
            >
              <Select
                defaultValue=""
                displayEmpty
                onChange={(event) => onFilterChange(event.target.value)}
                inputProps={{ "aria-label": "filter products" }}
                sx={{
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  ".MuiSvgIcon-root": {
                    color: "white",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Filter Products
                </MenuItem>

                <MenuItem value="price-low-high">Price: Low to High</MenuItem>

                <MenuItem value="price-high-low">Price: High to Low</MenuItem>
                <MenuItem value="Availability">Availability</MenuItem>
                <MenuItem value="Newest">Newest</MenuItem>
              </Select>
            </FormControl>

            {/* Categories */}

            {userRole === "seller" ? (
              <FormControl
                size="small"
                sx={{
                  minWidth: 140,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 1,
                }}
              >
                <Select
                  defaultValue=""
                  displayEmpty
                  inputProps={{
                    "aria-label": "product category",
                  }}
                  sx={{
                    color: "white",
                    ".MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    ".MuiSvgIcon-root": {
                      color: "white",
                    },
                  }}
                >
                  <MenuItem
                    value=""
                    disabled
                    onClick={() => onCategoryChange("")}
                  >
                    Category
                  </MenuItem>

                  <MenuItem
                    value="women"
                    onClick={() => onCategoryChange("Women")}
                  >
                    Women
                  </MenuItem>
                  <MenuItem value="men" onClick={() => onCategoryChange("Men")}>
                    Men
                  </MenuItem>
                  <MenuItem
                    value="kids"
                    onClick={() => onCategoryChange("Kids")}
                  >
                    Kids
                  </MenuItem>
                  <MenuItem
                    value="footwear"
                    onClick={() => onCategoryChange("Foot_Wear")}
                  >
                    Foot Wear
                  </MenuItem>
                  <MenuItem
                    value="electronics"
                    onClick={() => onCategoryChange("Electronics")}
                  >
                    Electronics
                  </MenuItem>
                  <MenuItem
                    value="accessories"
                    onClick={() => onCategoryChange("Accessories")}
                  >
                    Accessories
                  </MenuItem>
                </Select>
              </FormControl>
            ) : (
              " "
            )}

            {/* Cart */}
            {userRole === "user" ? (
              <Box
                onClick={() => navigate("/product-cart")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: 1,
                  p: 1,
                  cursor: "pointer",
                }}
              >
                <ShoppingCartIcon sx={{ mr: 1 }} />
                Cart
              </Box>
            ) : (
              " "
            )}

            {/* Logout and Avatar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>

              <Avatar
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                  color: "white",
                }}
              >
                {userInitial}
              </Avatar>
            </Box>
          </Box>
        ) : (
          /* Mobile Menu Button */
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ order: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 260,
              p: 2,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 1,
            }}
          >
            <IconButton onClick={handleDrawerToggle}>
              <CloseIcon />
            </IconButton>
          </Box>

          <List
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {/* Mobile Product Filters */}
            <ListItem disablePadding>
              <FormControl size="small" fullWidth>
                <Select
                  defaultValue=""
                  displayEmpty
                  onChange={(event) => onFilterChange(event.target.value)}
                  inputProps={{
                    "aria-label": "filter products",
                  }}
                >
                  <MenuItem value="" disabled>
                    Filter Products
                  </MenuItem>

                  <MenuItem value="price-low-high">Price: Low to High</MenuItem>

                  <MenuItem value="price-high-low">Price: High to Low</MenuItem>
                  <MenuItem value="Availability">Availability</MenuItem>
                  <MenuItem value="Newest">Newest</MenuItem>
                </Select>
              </FormControl>
            </ListItem>
            <ListItem disablePadding>
              {userRole === "seller" ? (
                <FormControl size="small" fullWidth>
                  <Select
                    defaultValue=""
                    displayEmpty
                    // onChange={(event) => onFilterChange(event.target.value)}
                    inputProps={{
                      "aria-label": "filter products",
                    }}
                  >
                    <MenuItem
                      value=""
                      disabled
                      onClick={() => onCategoryChange("")}
                    >
                      Category
                    </MenuItem>

                    <MenuItem
                      value="women"
                      onClick={() => onCategoryChange("Women")}
                    >
                      Women
                    </MenuItem>
                    <MenuItem
                      value="men"
                      onClick={() => onCategoryChange("Men")}
                    >
                      Men
                    </MenuItem>
                    <MenuItem
                      value="kids"
                      onClick={() => onCategoryChange("Kids")}
                    >
                      Kids
                    </MenuItem>
                    <MenuItem
                      value="footwear"
                      onClick={() => onCategoryChange("Foot_Wear")}
                    >
                      Foot Wear
                    </MenuItem>
                    <MenuItem
                      value="electronics"
                      onClick={() => onCategoryChange("Electronics")}
                    >
                      Electronics
                    </MenuItem>
                    <MenuItem
                      value="accessories"
                      onClick={() => onCategoryChange("Accessories")}
                    >
                      Accessories
                    </MenuItem>
                  </Select>
                </FormControl>
              ) : (
                " "
              )}
            </ListItem>

            {/* Mobile Categories */}
            {/* <ListItem disablePadding>
              <FormControl size="small" fullWidth>
                <Select
                  defaultValue=""
                  displayEmpty
                  inputProps={{
                    "aria-label": "product category",
                  }}
                >
                  <MenuItem value="" disabled>
                    Category
                  </MenuItem>

                  <MenuItem value="women">Women</MenuItem>
                  <MenuItem value="men">Men</MenuItem>
                  <MenuItem value="kids">Kids</MenuItem>
                  <MenuItem value="footwear">Foot Wear</MenuItem>
                  <MenuItem value="electronics">
                    Electronics
                  </MenuItem>
                  <MenuItem value="accessories">
                    Accessories
                  </MenuItem>
                </Select>
              </FormControl>
            </ListItem> */}

            {/* Mobile Cart */}
            {userRole === "user" ? (
              <ListItem disablePadding>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    py: 1,
                  }}
                >
                  Cart
                </Button>
              </ListItem>
            ) : (
              " "
            )}

            {/* Mobile User and Logout */}
            <ListItem disablePadding>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  pt: 1,
                  borderTop: "1px solid #eee",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>{userInitial}</Avatar>

                  <Typography variant="body2">{displayName}</Typography>
                </Box>

                <Button color="error" size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </Box>
            </ListItem>
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
