import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import AuthThemeProvider from "./AuthThemeProvider";
import {
  MdArrowBack as ArrowBackIcon,
  MdVisibility as VisibilityIcon,
  MdVisibilityOff as VisibilityOffIcon,
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
  MdLock as LockIcon,
} from "react-icons/md";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import AuthSidebar from "../../components/auth/AuthSidebar";

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
      <AuthThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: {
            xs: "transparent",
            md: "radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.12), transparent 28%), #f5f7fb"
          },
          padding: { xs: 2, md: 4 },
        }}
      >
        <Card
          sx={{
            maxWidth: { xs: 450, md: 1100 },
            width: "100%",
            boxShadow: { xs: "0 8px 32px rgba(0,0,0,0.1)", md: "0 25px 80px rgba(15, 23, 42, 0.12)" },
            borderRadius: { xs: 3, md: 4 },
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1fr" },
              minHeight: { md: 540 },
            }}
          >
              <AuthSidebar
                title="رابط غير صالح"
                subtitle="يبدو أن رابط إعادة تعيين كلمة المرور الذي استخدمته غير صالح أو منتهي الصلاحية."
                features={[
                  { icon: <SecurityIcon size={18} color="#ef4444" />, text: "الروابط تكون صالحة لفترة محدودة فقط." },
                  { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "يمكنك طلب رابط جديد بسهولة." },
                  { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "تحقق من بريدك الإلكتروني للحصول على رابط جديد." },
                ]}
              />

            <CardContent
              sx={{
                p: { xs: 3, md: 2 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 430, mx: "auto" }}>
                <Stack spacing={1} sx={{ textAlign: "center", mb: 3 }}>
                  <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#0f172a", textAlign: "center" }}>
                    رابط غير صالح
                  </Typography>
                </Stack>

                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    رابط إعادة التعيين غير صالح أو منتهي الصلاحية
                  </Alert>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/forgot-password")}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: "1rem",
                      textTransform: "none",
                      backgroundImage: "linear-gradient(135deg, #1e5a2e, #2E8B45)",
                      boxShadow: "0 10px 25px rgba(46, 139, 69, 0.35)",
                      color: "#fff",
                      "&:hover": {
                        backgroundImage: "linear-gradient(135deg, #266a39, #3da35a)",
                      },
                    }}
                  >
                    طلب رابط جديد
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Box>
        </Card>
      </Box>
      </AuthThemeProvider>
    );
  }

  return (
    <AuthThemeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: {
            xs: "transparent",
            md: "radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.12), transparent 28%), #f5f7fb"
          },
          padding: { xs: 2, md: 4 },
        }}
      >
      <Helmet>
        <title>إعادة تعيين كلمة المرور</title>
        <meta name="description" content="إعادة تعيين كلمة المرور لنظام إدارة السلف" />
      </Helmet>

      <Card
        sx={{
          maxWidth: { xs: 450, md: 1100 },
          width: "100%",
          boxShadow: { xs: "0 8px 32px rgba(0,0,0,0.1)", md: "0 25px 80px rgba(15, 23, 42, 0.12)" },
          borderRadius: { xs: 3, md: 4 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1fr" },
            minHeight: { md: 540 },
          }}
        >
            <AuthSidebar
              title="إعادة تعيين كلمة المرور"
              subtitle="أدخل كلمة مرور جديدة قوية لحماية حسابك. تأكد من أنها آمنة وسهلة التذكر."
              features={[
                { icon: <SecurityIcon size={18} color="#ef4444" />, text: "استخدم كلمة مرور قوية تحتوي على أحرف وأرقام." },
                { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "تأكد من مطابقة كلمتي المرور في الحقلين." },
                { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "لا تشارك كلمة المرور مع أي شخص آخر." },
              ]}
            />

          <CardContent
            sx={{
              p: { xs: 3, md: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 430, mx: "auto" }}>
              <Stack spacing={1} sx={{ textAlign: "center", mb: 3 }}>
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#0f172a", textAlign: "center" }}>
                  إعادة تعيين كلمة المرور
                </Typography>
              </Stack>

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
                    <Stack spacing={2.5}>
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
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                m: 0,
                                mr: -0.5,
                                pointerEvents: "none",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", width: 22, justifyContent: "center" }}>
                                <LockIcon size={18} color="#64748b" />
                              </Box>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end" sx={{ shrink: true }}>
                              <IconButton
                                onClick={handleTogglePassword}
                                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                              >
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
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                m: 0,
                                mr: -0.5,
                                pointerEvents: "none",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", width: 22, justifyContent: "center" }}>
                                <LockIcon size={18} color="#64748b" />
                              </Box>
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end" sx={{ shrink: true }}>
                              <IconButton
                                onClick={handleToggleConfirmPassword}
                                aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                              >
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

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          direction: "rtl",
                        }}
                      >
                        <Link
                          to="/login"
                          style={{
                            textDecoration: "none",
                            fontSize: "0.95rem",
                            color: "#2E8B45",
                            fontWeight: "bold",
                          }}
                        >
                          <ArrowBackIcon style={{ marginLeft: 4 }} />
                          العودة لتسجيل الدخول
                        </Link>
                      </Box>

                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          fontSize: "1rem",
                          textTransform: "none",
                          backgroundImage: "linear-gradient(135deg, #1e5a2e, #2E8B45)",
                          boxShadow: "0 10px 25px rgba(46, 139, 69, 0.35)",
                          color: "#fff",
                          "&:hover": {
                            backgroundImage: "linear-gradient(135deg, #266a39, #3da35a)",
                          },
                        }}
                      >
                        {isLoading ? (
                          <CircularProgress size={22} sx={{ color: "#fff" }} />
                        ) : (
                          "إعادة تعيين كلمة المرور"
                        )}
                      </Button>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
    </AuthThemeProvider>
  );
};

export default ResetPassword;