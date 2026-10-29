import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useVerifyOtpMutation } from "../service/user.auth";
import { jwtDecode } from "jwt-decode";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface DecodedToken {
  id: string;
  role: string;
}

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [message, setMessage] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading: isLoggingIn, error: loginError }] =
    useLoginMutation();

  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === "object" && "data" in err) {
      const data = err.data;

      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }

    return "Something went wrong. Please try again.";
  };

  // LOGIN
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLocalError("");
    setMessage("");

    try {
      const response = await login(formData).unwrap();

      // console.log("Login response:", response);

      if (!response.success) {
        setLocalError(response.message || "Login failed.");
        return;
      }

      // Case 1: User is already verified.
      // Backend returns: data: { token: "..." }
      if (
        response.data &&
        "token" in response.data &&
        typeof response.data.token === "string" &&
        response.data.token
      ) {
        localStorage.setItem("token", response.data.token);

        const decoded = jwtDecode<DecodedToken>(response.data.token);
        // console.log(decoded)
        const userId = decoded.id;
        // console.log(userId)
        localStorage.setItem("userId", userId);

        const role = decoded.role;
        localStorage.setItem("userRole", role);
        console.log(role)

        if(role === "user"){
          navigate("/user-dashbord", { replace: true });
        } else if(role === "seller"){
          navigate("/seller-dashbord", { replace: true })
        }
        return;
      }

      // Case 2: User is not verified.
      // Backend returns: data: { userId: "..." }
      if (response.data && "userId" in response.data && response.data.userId) {
        setUserId(String(response.data.userId));
        setOtpMode(true);
        setOtp("");
        setMessage(
          response.message ||
            "Please verify your account using the OTP sent to your email.",
        );
        return;
      }

      setLocalError("Unexpected response received from the server.");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err));
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLocalError("");
    setMessage("");

    if (!userId) {
      setLocalError("User information is missing. Please log in again.");
      setOtpMode(false);
      return;
    }

    if (!otp.trim()) {
      setLocalError("Please enter the OTP.");
      return;
    }

    try {
      const response = await verifyOtp({
        userId,
        otp: otp.trim(),
      }).unwrap();

      console.log("OTP verification response:", response);

      // Backend returns: data: { token: "..." }
      if (
        response.success &&
        response.data &&
        "token" in response.data &&
        typeof response.data.token === "string" &&
        response.data.token
      ) {
        localStorage.setItem("token", response.data.token);

        navigate("/user-dashbord", { replace: true });
        return;
      }

      setLocalError(response.message || "OTP verification failed.");
    } catch (err: unknown) {
      setLocalError(getErrorMessage(err));
    }
  };

  const handleBackToLogin = () => {
    setOtpMode(false);
    setOtp("");
    setUserId("");
    setMessage("");
    setLocalError("");
  };

  const inputStyle = {
    "& .MuiInputLabel-root": {
      color: "#64748b",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#2563eb",
    },
    "& .MuiOutlinedInput-root": {
      color: "#0f172a",
      backgroundColor: "#ffffff",
      borderRadius: "10px",
      "& fieldset": {
        borderColor: "#cbd5e1",
      },
      "&:hover fieldset": {
        borderColor: "#94a3b8",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563eb",
      },
    },
  };

  const fieldProps = {
    fullWidth: true,
    size: "small" as const,
    sx: inputStyle,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #eff6ff 0%, #f8fafc 50%, #eef2ff 100%)",
        px: 2,
        py: 5,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          backgroundColor: "#ffffff",
          borderRadius: { xs: 3, sm: 4 },
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 27, sm: 32 },
                letterSpacing: "-0.8px",
                color: "#0f172a",
              }}
            >
              {otpMode ? "Verify Your Account" : "Welcome Back"}
            </Typography>

            <Typography sx={{ mt: 1, color: "#64748b", fontSize: 14 }}>
              {otpMode
                ? `Enter the OTP sent to ${formData.email}.`
                : "Sign in to continue to your account."}
            </Typography>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          {!otpMode ? (
            <Box component="form" onSubmit={handleLoginSubmit}>
              <Typography
                sx={{
                  mb: 2,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#2563eb",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Account Information
              </Typography>

              <Box sx={{ display: "grid", gap: 2 }}>
                <TextField
                  {...fieldProps}
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                />

                <TextField
                  {...fieldProps}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {loginError && !localError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {getErrorMessage(loginError)}
                </Alert>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isLoggingIn}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#2563eb",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                }}
              >
                {isLoggingIn ? "Signing in..." : "Sign In"}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyOtp}>
              <TextField
                {...fieldProps}
                label="Verification OTP"
                placeholder="Enter your OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                slotProps={{
                  htmlInput: {
                    inputMode: "numeric",
                    maxLength: 6,
                  },
                }}
                required
                autoComplete="one-time-code"
                autoFocus
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                disabled={isVerifying || !otp.trim()}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: "#2563eb",
                  "&:hover": {
                    backgroundColor: "#1d4ed8",
                  },
                }}
              >
                {isVerifying ? "Verifying..." : "Verify Account"}
              </Button>

              <Button
                fullWidth
                type="button"
                onClick={handleBackToLogin}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Back to Login
              </Button>
            </Box>
          )}

          <Typography
            sx={{
              mt: 3,
              textAlign: "center",
              color: "#94a3b8",
              fontSize: 12,
            }}
          >
            Securely access your account.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
