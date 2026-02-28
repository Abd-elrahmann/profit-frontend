import React, { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import AuthThemeProvider from "./AuthThemeProvider";
import {
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  AuthLayout,
  AuthFormTitle,
  AuthEmailField,
  AuthPrimaryButton,
  AuthBackLink,
} from "../../components/auth";
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
    <AuthThemeProvider>
      <Helmet>
        <title>نسيت كلمة المرور</title>
        <meta name="description" content="إعادة تعيين كلمة المرور لنظام إدارة السلف" />
      </Helmet>
      <AuthLayout
        sidebarTitle="استعادة الحساب"
        sidebarSubtitle="نسيت كلمة المرور؟ لا تقلق، سنساعدك في استعادة الوصول إلى حسابك بأمان تام."
        sidebarFeatures={[
          {
            icon: <SecurityIcon size={18} color="#ef4444" />,
            text: "إجراءات أمان متقدمة لحماية حسابك.",
          },
          {
            icon: <CheckCircleIcon size={18} color="#22c55e" />,
            text: "إرسال رابط آمن لإعادة تعيين كلمة المرور.",
          },
          {
            icon: <CheckCircleIcon size={18} color="#22c55e" />,
            text: "دعم فني متوفر على مدار الساعة.",
          },
        ]}
      >
        <AuthFormTitle>نسيت كلمة المرور</AuthFormTitle>
        {isSubmitted ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h6" sx={{ color: "success.main", mb: 2 }}>
              تم إرسال الرسالة بنجاح
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى
              التحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.
            </Typography>
            <AuthPrimaryButton
              type="button"
              onClick={() => navigate("/login")}
            >
              العودة لتسجيل الدخول
            </AuthPrimaryButton>
          </Box>
        ) : (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <AuthEmailField
                    autoComplete="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    disabled={isLoading}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      direction: "rtl",
                    }}
                  >
                    <AuthBackLink to="/login">العودة لتسجيل الدخول</AuthBackLink>
                  </Box>
                  <AuthPrimaryButton isLoading={isLoading}>
                    إرسال رابط إعادة التعيين
                  </AuthPrimaryButton>
                </Stack>
              </Form>
            )}
          </Formik>
        )}
      </AuthLayout>
    </AuthThemeProvider>
  );
};
export default ForgotPassword;