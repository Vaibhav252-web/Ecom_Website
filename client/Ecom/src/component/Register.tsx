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
  // InputAdornment,
} from "@mui/material";
import {
  useRegisterMutation,
  useVerifyOtpMutation,
} from "../service/user.auth";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type RegisterFormState = {
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  countryCode: string;
  dob: string;
  role: string;
};

interface DecodedToken {
  id: string;
  role: string;
}

const Register = () => {
  const navigate = useNavigate();

  const convertToYYYYMMDD = (ddmmyyyy: any) => {
    if (!ddmmyyyy) return "";
    const [day, month, year] = ddmmyyyy.split("-");
    return `${year}-${month}-${day}`;
  };

  const convertToDDMMYYYY = (yyyymmdd: any) => {
    if (!yyyymmdd) return "";
    const [year, month, day] = yyyymmdd.split("-");
    return `${day}-${month}-${year}`;
  };

  const [formData, setFormData] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    countryCode: "+91",
    dob: "",
    role: "",
  });

  const [step, setStep] = useState<"register" | "otp">("register");
  const [userId, setUserID] = useState("");
  const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);

  const [register, { isLoading: isRegistering, error: registerError }] =
    useRegisterMutation();

  const [verifyOtp, { isLoading: isVerifying, error: otpError }] =
    useVerifyOtpMutation();

  const handleChange = (field: keyof RegisterFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await register(formData).unwrap();

      if (response?.data?.userId) {
        setUserID(response.data.userId);
        setStep("otp");
      }
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await verifyOtp({ userId, otp }).unwrap();

      if (response?.data) {
        localStorage.setItem("token", response.data.token);

        const decoded = jwtDecode<DecodedToken>(response.data.token);

        const userId = decoded.id;

        localStorage.setItem("userId", userId);
        const role = decoded.role;
        localStorage.setItem("userRole", role);
        console.log(role)

        if(role === "user"){
          navigate("/user-dashbord", { replace: true });
        } else if(role === "seller"){
          navigate("/seller-dashbord", { replace: true })
        }
      }

      // Adding the navigation after successful verification here when route setup
      navigate("/user-dashbord");
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
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
        borderWidth: "1.5px",
      },
      "& input::placeholder": {
        color: "#94a3b8",
        opacity: 1,
      },
    },
    "& .MuiFormHelperText-root": {
      marginLeft: 0,
    },
  };

  const fieldProps = {
    fullWidth: true,
    size: "small" as const,
    sx: inputStyle,
  };

  const errorMessage = (error: unknown, fallback: string) => {
    if (
      error &&
      typeof error === "object" &&
      "data" in error &&
      error.data &&
      typeof error.data === "object" &&
      "message" in error.data &&
      typeof error.data.message === "string"
    ) {
      return error.data.message;
    }

    return fallback;
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
          maxWidth: step === "register" ? 760 : 440,
          backgroundColor: "#ffffff",
          color: "#0f172a",
          borderRadius: { xs: 3, sm: 4 },
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
          transition: "max-width 0.25s ease",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 5 },
            "&:last-child": { pb: { xs: 3, sm: 5 } },
          }}
        >
          {step === "register" ? (
            <>
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
                  Create your account
                </Typography>

                <Typography sx={{ mt: 1, color: "#64748b", fontSize: 14 }}>
                  Enter your details to get started.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleRegisterSubmit}>
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
                  Personal information
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    {...fieldProps}
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    required
                    autoComplete="name"
                  />

                  <TextField
                    {...fieldProps}
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    autoComplete="email"
                  />

                  <TextField
                    {...fieldProps}
                    label="Role"
                    placeholder="e.g. Admin, User"
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    required
                  />
                  {/* 
                  <TextField
                    {...fieldProps}
                    label="Date of Birth"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange("dob", e.target.value)}
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: {
                        max: new Date().toISOString().split("T")[0],
                      },
                    }}
                    required
                    // slotProps={{
                    //   inputLabel: { shrink: true },
                    //   htmlInput: {
                    //     max: new Date().toISOString().split("T")[0],
                    //   },
                    // }}
                  /> */}

                  <TextField
                    {...fieldProps}
                    label="Date of Birth"
                    type="date"
                    // Converts "31-12-1995" -> "1995-12-31" for the visual picker
                    value={convertToYYYYMMDD(formData.dob)}
                    // Converts picked date "1995-12-31" -> "31-12-1995" before saving to state
                    onChange={(e) =>
                      handleChange("dob", convertToDDMMYYYY(e.target.value))
                    }
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: {
                        // Prevents picking future dates in the browser, matching your Joi 'date.max' rule
                        max: new Date().toISOString().split("T")[0],
                      },
                    }}
                    required
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "105px minmax(0, 1fr)",
                      gap: 1,
                    }}
                  >
                    <TextField
                      {...fieldProps}
                      label="Code"
                      placeholder="+91"
                      value={formData.countryCode}
                      onChange={(e) =>
                        handleChange("countryCode", e.target.value)
                      }
                      required
                      slotProps={{
                        htmlInput: {
                          maxLength: 5,
                          "aria-label": "Country calling code",
                        },
                      }}
                    />

                    <TextField
                      {...fieldProps}
                      label="Phone Number"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                      autoComplete="tel-national"
                    />
                  </Box>

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
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    {...fieldProps}
                    label="Address"
                    placeholder="Enter your street address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    required
                    multiline
                    minRows={2}
                    sx={{
                      ...inputStyle,
                      gridColumn: { xs: "auto", sm: "1 / -1" },
                    }}
                  />
                </Box>

                {registerError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage(registerError, "Registration failed")}
                  </Alert>
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isRegistering}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    backgroundColor: "#2563eb",
                    boxShadow: "0 6px 16px rgba(37, 99, 235, 0.2)",
                    "&:hover": {
                      backgroundColor: "#1d4ed8",
                      boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
                    },
                    "&:disabled": {
                      backgroundColor: "#94a3b8",
                      color: "#ffffff",
                    },
                  }}
                >
                  {isRegistering ? "Creating account..." : "Create Account"}
                </Button>

                <Typography
                  sx={{
                    mt: 3,
                    textAlign: "center",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  By registering, you agree to our terms and privacy policy.
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    style={{
                      color: "#60a5fa",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                    Login here
                  </Link>
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    mx: "auto",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 3,
                    backgroundColor: "#dbeafe",
                    color: "#2563eb",
                    fontSize: 25,
                    fontWeight: 800,
                  }}
                >
                  ✓
                </Box>

                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
                  Verify your email
                </Typography>

                <Typography sx={{ mt: 1, color: "#64748b", fontSize: 14 }}>
                  Enter the OTP sent to
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: "#2563eb",
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {formData.email}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleOtpSubmit}>
                <TextField
                  {...fieldProps}
                  label="One-Time Password"
                  placeholder="Enter your OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  autoComplete="one-time-code"
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      maxLength: 8,
                    },
                  }}
                />

                {otpError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage(otpError, "OTP verification failed")}
                  </Alert>
                )}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isVerifying}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    backgroundColor: "#2563eb",
                    "&:hover": { backgroundColor: "#1d4ed8" },
                  }}
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={() => setStep("register")}
                  sx={{
                    mt: 1,
                    color: "#64748b",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "#f1f5f9",
                      color: "#0f172a",
                    },
                  }}
                >
                  Back to Registration
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
