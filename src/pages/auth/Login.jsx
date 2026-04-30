import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AuthThemeProvider from "./AuthThemeProvider";
import {
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useAuth } from "../../components/Contexts/AuthContext";
import routes from "../../routes";
import { convertModuleToPermission } from "../../utilities/moduleConverter";
import {
  AuthLayout,
  AuthFormTitle,
  AuthEmailField,
  AuthPasswordField,
  AuthPrimaryButton,
  AuthLink,
} from "../../components/auth";
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .required("البريد الإلكتروني مطلوب"),
  password: Yup.string().trim().required("كلمة المرور مطلوبة"),
});

const getLoginErrorMessage = (error) => {
  const status = error?.response?.status;
  const responseData = error?.response?.data;
  const message = String(responseData?.message || responseData?.error || "").toLowerCase();

  if (message.includes('ليس لديك أي صلاحيات أو أدوار للدخول على النظام')) {
    return responseData?.message;
  }

  if (status === 401 || status === 400) {
    if (message.includes('email') && (message.includes('not found') || message.includes('invalid'))) {
      return 'البريد الإلكتروني غير صحيح';
    }
    if (message.includes('password') && (message.includes('wrong') || message.includes('invalid') || message.includes('incorrect'))) {
      return 'كلمة المرور غير صحيحة';
    }
    if (message.includes('user not found') || message.includes('account not found') || message.includes('البريد') || message.includes('الايميل')) {
      return 'البريد الإلكتروني غير صحيح';
    }
    if (message.includes('incorrect password') || message.includes('wrong password') || message.includes('كلمة المرور')) {
      return 'كلمة المرور غير صحيحة';
    }
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  }

  if (status === 403) {
    return 'تم رفض تسجيل الدخول لهذا الحساب';
  }

  if (status === 429) {
    return 'محاولات كثيرة، حاول مرة أخرى بعد قليل';
  }

  if (!error?.response) {
    return 'خطأ في الاتصال، يرجى التحقق من شبكة الإنترنت';
  }

  return 'حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى';
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const { fetchPermissions } = usePermissions();
  const { login } = useAuth();
  const handleTogglePassword = () => setShowPassword(!showPassword);
  useEffect(() => {
    const savedEmailFromStorage = localStorage.getItem("rememberedEmail");
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
      const response = await Api.post("/api/auth/login", cleanedValues);
      const { user } = response.data;
      await login(user);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", cleanedValues.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      let userPermissions = [];
      try {
        if (fetchPermissions && typeof fetchPermissions === 'function') {
          const fetchedPermissions = await fetchPermissions();
          userPermissions = fetchedPermissions || [];
        }
      } catch (permError) {
        console.warn('Permissions fetch failed, navigating to dashboard:', permError);
      }
      notifySuccess("تم تسجيل الدخول بنجاح");
      let firstPage = '/dashboard';
      for (const route of routes) {
        if (route.protected && route.requiresPermissions && route.module) {
          const moduleKey = convertModuleToPermission(route.module);
          const hasPermission = userPermissions.includes(`${moduleKey}_View`);
          if (hasPermission) {
            firstPage = route.path;
            break;
          }
        }
      }
      navigate(firstPage, { replace: true });
    } catch (error) {
      notifyError(getLoginErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <AuthThemeProvider>
      <Helmet>
        <title>تسجيل الدخول</title>
        <meta name="description" content="تسجيل الدخول لنظام إدارة السلف" />
      </Helmet>
      <AuthLayout
        sidebarTitle="أهلاً بعودتك"
        sidebarSubtitle="سجّل دخولك لمتابعة مؤشرات الأداء والدفعات اليومية بدقة عالية."
        sidebarFeatures={[
          {
            icon: <SecurityIcon size={18} color="#ef4444" />,
            text: "حماية متقدمة مع صلاحيات دقيقة حسب الدور.",
          },
          {
            icon: <CheckCircleIcon size={18} color="#22c55e" />,
            text: "لوحات معلومات فورية لتتبع التدفقات النقدية.",
          },
          {
            icon: <CheckCircleIcon size={18} color="#22c55e" />,
            text: "تنبيهات ذكية لضمان الالتزام ومراقبة المخاطر.",
          },
        ]}
      >
        <AuthFormTitle>تسجيل الدخول</AuthFormTitle>
        <Formik
          initialValues={{ email: savedEmail, password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <AuthEmailField
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  disabled={isLoading}
                />
                <AuthPasswordField
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  disabled={isLoading}
                  showPassword={showPassword}
                  onTogglePassword={handleTogglePassword}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    direction: "rtl",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={isLoading}
                        sx={{ color: "#2E8B45" }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: "0.95rem", color: "#2E8B45" }}>
                        تذكرني
                      </Typography>
                    }
                    sx={{
                      mr: 0,
                      "& .MuiFormControlLabel-label": { mr: 1 },
                    }}
                  />
                  <AuthLink to="/forgot-password">نسيت كلمة المرور؟</AuthLink>
                </Box>
                <AuthPrimaryButton isLoading={isLoading}>
                  تسجيل الدخول
                </AuthPrimaryButton>
              </Stack>
            </Form>
          )}
        </Formik>
      </AuthLayout>
    </AuthThemeProvider>
  );
};
export default Login;