import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  MdAccountBalance as AccountBalance,
  MdArrowBack as ArrowBackIcon,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";

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
        background: "linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)",
        padding: 2,
      }}
    >
      <Helmet>
        <title>نسيت كلمة المرور</title>
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
              نسيت كلمة المرور
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 1,
              }}
            >
              أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
            </Typography>
          </Box>

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
                  color: "text.secondary",
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
                      autoComplete="email"
                      disabled={isLoading}
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
                        "إرسال رابط إعادة التعيين"
                      )}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;