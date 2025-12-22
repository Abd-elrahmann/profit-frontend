import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Chip,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  MdAccountBalance as AccountBalance,
  MdArrowBack as ArrowBackIcon,
  MdAlternateEmail as AlternateEmailIcon,
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Logo from "/assets/images/logo.webp";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .required("البريد الإلكتروني مطلوب"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    try {
      const cleanedValues = {
        ...values,
        email: values.email.trim(),
      };

      await Api.post("/api/auth/request-reset-password", cleanedValues);
      
      notifySuccess("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
      setIsSubmitted(true);
      resetForm();
    } catch (error) {
      notifyError("حدث خطأ أثناء إرسال رابط إعادة التعيين");
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
        background:
          "radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.12), transparent 28%), #f5f7fb",
        padding: { xs: 2, md: 4 },
      }}
    >
      <Helmet>
        <title>نسيت كلمة المرور</title>
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
            <Box
            sx={{
              position: "relative",
              p: { xs: 3, md: 5 },
              background:
                "linear-gradient(135deg, #1e5a2e 0%, #2E8B45 50%, #3da35a 100%)",
              color: "#fff",
              overflow: "hidden",
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              gap: 4,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                opacity: 0.12,
                backgroundImage:
                  "radial-gradient(circle at 30% 20%, #fff, transparent 28%), radial-gradient(circle at 70% 80%, #fff, transparent 22%)",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <img src={Logo} alt="Logo" style={{ width: 34, height: 34 }} />
                <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: "#fff" }}>
                  نظام إدارة السلف
                </Typography>
              </Stack>
              <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: 14, mt: 1.5 }}>
                منصة مالية موثوقة لإدارة السلف والاستحقاقات بسهولة وأمان.
              </Typography>
            </Box>

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography sx={{ fontSize: 28, fontWeight: 800, mb: 1, color: "#fff" }}>
                استعادة الحساب
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.88)", mb: 3 }}>
                نسيت كلمة المرور؟ لا تقلق، سنساعدك في استعادة الوصول إلى حسابك بأمان تام.
              </Typography>

              <Stack spacing={1.5}>
                {[
                  { icon: <SecurityIcon size={18} color="#ef4444" />, text: "إجراءات أمان متقدمة لحماية حسابك." },
                  { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "إرسال رابط آمن لإعادة تعيين كلمة المرور." },
                  { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "دعم فني متوفر على مدار الساعة." },
                ].map((item, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.12)",
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                      {item.text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>

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
                  نسيت كلمة المرور
                </Typography>
              </Stack>

              {isSubmitted ? (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "success.main",
                      mb: 2,
                    }}
                  >
                    تم إرسال الرسالة بنجاح
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mb: 3,
                    }}
                  >
                    تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
                    يرجى التحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/login")}
                    sx={{
                      mt: 2,
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
                    العودة لتسجيل الدخول
                  </Button>
                </Box>
              ) : (
                <Formik
                  initialValues={{
                    email: "",
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
                          label="البريد الإلكتروني"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          variant="outlined"
                          InputLabelProps={{ shrink: true }}
                          autoComplete="email"
                          disabled={isLoading}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{
                                  height: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  m: 0,
                                  mr: 1,
                                  pointerEvents: "none",
                                }}
                              >
                                <Box sx={{ display: "flex", alignItems: "center", width: 22, justifyContent: "center" }}>
                                  <AlternateEmailIcon size={18} color="#64748b" />
                                </Box>
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
                            "إرسال رابط إعادة التعيين"
                          )}
                        </Button>
                      </Stack>
                    </Form>
                  )}
                </Formik>
              )}
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};

export default ForgotPassword;