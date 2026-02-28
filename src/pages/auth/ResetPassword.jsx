import React, { useState, useEffect } from "react";
import { Box, Stack, Alert } from "@mui/material";
import AuthThemeProvider from "./AuthThemeProvider";
import {
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  AuthLayout,
  AuthFormTitle,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthBackLink,
  AUTH_BACKGROUND,
} from "../../components/auth";
const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .trim()
    .min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف")
    .required("كلمة المرور الجديدة مطلوبة"),
  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref("newPassword"), null], "كلمات المرور غير متطابقة")
    .required("تأكيد كلمة المرور مطلوب"),
});
const resetPasswordBackground = {
  xs: "transparent",
  md: AUTH_BACKGROUND,
};
const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(true);
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
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
        token,
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
        <AuthLayout
          sidebarTitle="رابط غير صالح"
          sidebarSubtitle="يبدو أن رابط إعادة تعيين كلمة المرور الذي استخدمته غير صالح أو منتهي الصلاحية."
          sidebarFeatures={[
            {
              icon: <SecurityIcon size={18} color="#ef4444" />,
              text: "الروابط تكون صالحة لفترة محدودة فقط.",
            },
            {
              icon: <CheckCircleIcon size={18} color="#22c55e" />,
              text: "يمكنك طلب رابط جديد بسهولة.",
            },
            {
              icon: <CheckCircleIcon size={18} color="#22c55e" />,
              text: "تحقق من بريدك الإلكتروني للحصول على رابط جديد.",
            },
          ]}
          background={resetPasswordBackground}
        >
          <AuthFormTitle>رابط غير صالح</AuthFormTitle>
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              رابط إعادة التعيين غير صالح أو منتهي الصلاحية
            </Alert>
            <AuthPrimaryButton
              type="button"
              onClick={() => navigate("/forgot-password")}
            >
              طلب رابط جديد
            </AuthPrimaryButton>
          </Box>
        </AuthLayout>
      </AuthThemeProvider>
    );
  }
  return (
    <AuthThemeProvider>
      <Helmet>
        <title>إعادة تعيين كلمة المرور</title>
        <meta name="description" content="إعادة تعيين كلمة المرور لنظام إدارة السلف" />
      </Helmet>
      <AuthLayout
        sidebarTitle="إعادة تعيين كلمة المرور"
        sidebarSubtitle="أدخل كلمة مرور جديدة قوية لحماية حسابك. تأكد من أنها آمنة وسهلة التذكر."
        sidebarFeatures={[
          {
            icon: <SecurityIcon size={18} color="#ef4444" />,
            text: "استخدم كلمة مرور قوية تحتوي على أحرف وأرقام.",
          },
          {
            icon: <CheckCircleIcon size={18} color="#22c55e" />,
            text: "تأكد من مطابقة كلمتي المرور في الحقلين.",
          },
          {
            icon: <CheckCircleIcon size={18} color="#22c55e" />,
            text: "لا تشارك كلمة المرور مع أي شخص آخر.",
          },
        ]}
        background={resetPasswordBackground}
      >
        <AuthFormTitle>إعادة تعيين كلمة المرور</AuthFormTitle>
        <Formik
          initialValues={{ newPassword: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <AuthPasswordField
                  label="كلمة المرور الجديدة"
                  name="newPassword"
                  autoComplete="new-password"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  disabled={isLoading}
                  showPassword={showPassword}
                  onTogglePassword={handleTogglePassword}
                />
                <AuthPasswordField
                  label="تأكيد كلمة المرور"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  disabled={isLoading}
                  showPassword={showConfirmPassword}
                  onTogglePassword={handleToggleConfirmPassword}
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
                  إعادة تعيين كلمة المرور
                </AuthPrimaryButton>
              </Stack>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </AuthThemeProvider>
  );
};
export default ResetPassword;