import {
  Box,
  Typography,
  // TextField,
  Dialog,
  DialogTitle,
  // DialogContent,
  DialogActions,
  Button,
  // MenuItem,
  IconButton,
  // Divider,
  // Alert,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDeleteProductMutation } from "../service/product.auth";

type DeleteProductProp = {
  productId: string;
  showTrigger?: boolean;
};

const DeleteProduct = ({
  productId,
  showTrigger = true,
}: DeleteProductProp) => {
  const [open, setOpen] = useState(false);

  const [deleteProduct, { isLoading: loading, error: isEreor }] =
    useDeleteProductMutation();

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    try {
      const response = await deleteProduct({ productId }).unwrap();
      console.log(response);
      setOpen(false);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
  return (
    <Box>
      {showTrigger && (
        <Button onClick={() => setOpen(true)}>
          <DeleteIcon />
        </Button>
      )}
      <Dialog
        open={open}
        fullWidth
        maxWidth="md"
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              bgcolor: "#ffffff",
              backgroundImage: "none",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.16)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: 3, pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 750,
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                }}
              >
                Delete Product
              </Typography>

              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.7 }}>
                Do you really want to delete your product
              </Typography>
            </Box>

            <IconButton
              onClick={handleClose}
              aria-label="Close popup"
              sx={{
                color: "#64748b",
                bgcolor: "#f1f5f9",
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 2.5,
            gap: 1,
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              color: "#475569",
              borderColor: "#cbd5e1",
              borderRadius: 2,
              px: 3,
              "&:hover": {
                borderColor: "#94a3b8",
                bgcolor: "#f8fafc",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563eb",
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#1d4ed8",
                boxShadow: "none",
              },
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeleteProduct;
