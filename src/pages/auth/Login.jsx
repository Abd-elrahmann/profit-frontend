import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  MdAccountBalance as AccountBalance,
  MdVisibility as VisibilityIcon,
  MdVisibilityOff as VisibilityOffIcon,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {usePermissions} from "../../components/Contexts/PermissionsContext";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .required("البريد الإلكتروني مطلوب"),
  password: Yup.string().trim().required("كلمة المرور مطلوبة"),
});

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const {fetchPermissions} = usePermissions();
  const handleTogglePassword = () => setShowPassword(!showPassword);

  // Load saved email on mount
  useEffect(() => {
    const savedEmailFromStorage = localStorage.getItem('rememberedEmail');
    if (savedEmailFromStorage) {
      setSavedEmail(savedEmailFromStorage);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    try {
      const cleanedValues = {
        ...values,
        email: values.email.trim(),
      };

      // 1️⃣ تسجيل الدخول
      const response = await Api.post("/api/auth/login", cleanedValues);
      const { accessToken, user } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", cleanedValues.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // 3️⃣ استدعاء دالة جلب الصلاحيات من الكونتيكست
      try {
        if (fetchPermissions && typeof fetchPermissions === 'function') {
          await fetchPermissions();
        } else {
          console.warn('fetchPermissions function not available, reloading page');
          window.location.reload();
        }
      } catch (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
        // لا نوقف عملية تسجيل الدخول إذا فشل جلب الصلاحيات
        notifyError('تم تسجيل الدخول ولكن حدث خطأ في جلب الصلاحيات');
      }

      notifySuccess("تم تسجيل الدخول بنجاح");

      // 4️⃣ التوجيه للوحة التحكم
      navigate("/dashboard", { replace: true });
    } catch (error) {
      notifyError("خطأ في تسجيل الدخول");
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)",
        padding: 2,
      }}
    >
      <Helmet>
        <title>تسجيل الدخول</title>
        <meta name="description" content="تسجيل الدخول لنظام إدارة السلف" />
      </Helmet>

      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <AccountBalance
              style={{
                fontSize: 40,
                color: "#1976d2",
                marginBottom: 10,
              }}
            />
            <Typography
              gutterBottom
              sx={{
                fontSize: 24,
                fontWeight: 600,
                color: "#1976d2",
              }}
            >
              نظام إدارة السلف
            </Typography>
          </Box>

          <Formik
            initialValues={{
              email: savedEmail,
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {/* البريد الإلكتروني */}
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    autoComplete="username"
                    disabled={isLoading}
                  />

                  {/* كلمة المرور */}
                  <TextField
                    fullWidth
                    label="كلمة المرور"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    variant="outlined"
                    autoComplete="current-password"
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ shrink: true }}>
                          <IconButton onClick={handleTogglePassword}>
                            {showPassword ? (
                              <VisibilityOffIcon size={20} />
                            ) : (
                              <VisibilityIcon size={20} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Remember Me and Forgot Password Row */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      direction: 'rtl'
                    }}
                  >
                    {/* Remember Me Checkbox */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={isLoading}
                          sx={{
                            '&.Mui-checked': {
                              color: 'primary.main',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: '0.95rem', color: 'text.secondary' }}>
                          تذكرني
                        </Typography>
                      }
                      sx={{
                        mr: 0,
                        '& .MuiFormControlLabel-label': {
                          mr: 1,
                        },
                      }}
                    />

                    {/* Forgot Password Link */}
                    <Link 
                      to="/forgot-password" 
                      style={{ 
                        textDecoration: 'none',
                        fontSize: '0.95rem',
                        color: '#1976d2',
                        fontWeight: 500
                      }}
                    >
                      نسيت كلمة المرور؟
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      fontWeight: 500,
                      fontSize: "1rem",
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;