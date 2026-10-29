import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Stack,
  Link,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#111827",
        color: "#9ca3af",
        pt: 6,
        pb: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content using Flexbox to avoid all Grid TS errors */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          {/* Brand & Short Info */}
          <Box sx={{ width: { xs: "100%", sm: "48%", md: "26%" } }}>
            <Typography
              variant="h6"
              sx={{ color: "#ffffff", fontWeight: "bold", mb: 2 }}
            >
              MyStore
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Your one-stop destination for quality fashion, electronics, and
              lifestyle essentials delivered right to your doorstep.
            </Typography>

            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                sx={{ color: "#9ca3af", "&:hover": { color: "#ffffff" } }}
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "#9ca3af", "&:hover": { color: "#ffffff" } }}
              >
                <Instagram fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "#9ca3af", "&:hover": { color: "#ffffff" } }}
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ color: "#9ca3af", "&:hover": { color: "#ffffff" } }}
              >
                <LinkedIn fontSize="small" />
              </IconButton>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Box sx={{ width: { xs: "46%", sm: "22%", md: "15%" } }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#ffffff", fontWeight: "bold", mb: 2 }}
            >
              Shop Categories
            </Typography>
            <Stack spacing={1}>
              {["Women", "Men", "Kids", "Ethnic Wear", "Footwear"].map(
                (item) => (
                  <Link
                    key={item}
                    underline="hover"
                    sx={{
                      color: "#9ca3af",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      "&:hover": { color: "#ffffff" },
                    }}
                  >
                    {item}
                  </Link>
                )
              )}
            </Stack>
          </Box>

          {/* Customer Service */}
          <Box sx={{ width: { xs: "46%", sm: "22%", md: "15%" } }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#ffffff", fontWeight: "bold", mb: 2 }}
            >
              Customer Care
            </Typography>
            <Stack spacing={1}>
              {[
                "Contact Us",
                "Order Tracking",
                "Returns & Exchanges",
                "Shipping Info",
                "FAQs",
              ].map((item) => (
                <Link
                  key={item}
                  underline="hover"
                  sx={{
                    color: "#9ca3af",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    "&:hover": { color: "#ffffff" },
                  }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Contact Details */}
          <Box sx={{ width: { xs: "100%", sm: "48%", md: "18%" } }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#ffffff", fontWeight: "bold", mb: 2 }}
            >
              Contact Us
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">123 Tech Park, India</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone fontSize="small" />
                <Typography variant="body2">+91 98765 43210</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email fontSize="small" />
                <Typography variant="body2">support@mystore.com</Typography>
              </Box>
            </Stack>
          </Box>

          {/* Newsletter Subscription */}
          <Box sx={{ width: { xs: "100%", sm: "48%", md: "20%" } }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#ffffff", fontWeight: "bold", mb: 2 }}
            >
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Get updates on exclusive offers and new arrivals!
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                variant="outlined"
                placeholder="Your Email"
                size="small"
                fullWidth
                sx={{
                  bgcolor: "#1f2937",
                  borderRadius: 1,
                  input: { color: "#ffffff" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#1976d2",
                  textTransform: "none",
                  px: 2,
                  "&:hover": { bgcolor: "#115293" },
                }}
              >
                Join
              </Button>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: "#374151" }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            © {new Date().getFullYear()} MyStore. All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2}>
            <Link
              underline="hover"
              sx={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { color: "#ffffff" },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              underline="hover"
              sx={{
                color: "#9ca3af",
                fontSize: "0.75rem",
                cursor: "pointer",
                "&:hover": { color: "#ffffff" },
              }}
            >
              Terms of Service
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;