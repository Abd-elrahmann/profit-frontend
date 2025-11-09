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
  Alert,
} from "@mui/material";
import {
  MdAccountBalance as AccountBalance,
  MdArrowBack as ArrowBackIcon,
  MdVisibility as VisibilityIcon,
  MdVisibilityOff as VisibilityOffIcon,
} from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .trim()
    .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
    .required("كلمة المرور الجديدة مطلوبة"),
  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref('newPassword'), null], "كلمات المرور غير متطابقة")
    .required("تأكيد كلمة المرور مطلوب"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setIsTokenValid(false);
    }
  }, [searchParams]);

  const handleTogglePassword = () => setShowPassword(!showPassword);
  const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      const requestData = {
        token: token,
        newPassword: values.newPassword.trim(),
        confirmPassword: values.confirmPassword.trim(),
      };

      await Api.post("/api/auth/reset-password", requestData);
      
      notifySuccess("تم إعادة تعيين كلمة المرور بنجاح");
      resetForm();
      
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      notifyError("حدث خطأ أثناء إعادة تعيين كلمة المرور");
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
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
        <Card
          sx={{
            maxWidth: 450,
            width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              رابط إعادة التعيين غير صالح أو منتهي الصلاحية
            </Alert>
            <Button
              variant="contained"
              onClick={() => navigate("/forgot-password")}
            >
              طلب رابط جديد
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

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
        <title>إعادة تعيين كلمة المرور</title>
        <meta name="description" content="إعادة تعيين كلمة المرور لنظام إدارة السلف" />
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
          {/* Back to Login */}
          <Box sx={{ mb: 2 }}>
            <Link 
              to="/login" 
              style={{ 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                color: '#1976d2',
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            >
              <ArrowBackIcon style={{ marginLeft: 4 }} />
              العودة لتسجيل الدخول
            </Link>
          </Box>

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
              إعادة تعيين كلمة المرور
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 1,
              }}
            >
              أدخل كلمة المرور الجديدة لحسابك
            </Typography>
          </Box>

          <Formik
            initialValues={{
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
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
                  {/* كلمة المرور الجديدة */}
                  <TextField
                    fullWidth
                    label="كلمة المرور الجديدة"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                    variant="outlined"
                    autoComplete="new-password"
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

                  {/* تأكيد كلمة المرور */}
                  <TextField
                    fullWidth
                    label="تأكيد كلمة المرور"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                    variant="outlined"
                    autoComplete="new-password"
                    disabled={isLoading}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end" sx={{ shrink: true }}>
                          <IconButton onClick={handleToggleConfirmPassword}>
                            {showConfirmPassword ? (
                              <VisibilityOffIcon size={20} />
                            ) : (
                              <VisibilityIcon size={20} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

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
                      "إعادة تعيين كلمة المرور"
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

export default ResetPassword;