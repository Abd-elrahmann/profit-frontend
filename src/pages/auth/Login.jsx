import React, { useState, useEffect } from "react";
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
  IconButton,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  MdAccountBalance as AccountBalance,
  MdVisibility as VisibilityIcon,
  MdVisibilityOff as VisibilityOffIcon,
  MdAlternateEmail as AlternateEmailIcon,
  MdLock as LockIcon,
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import Api, { handleApiError } from "../../config/Api";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import routes from "../../routes";
import Logo from "/assets/images/logo.webp";
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
  const { fetchPermissions } = usePermissions();
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
      const { accessToken, user } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      
    
      window.dispatchEvent(new Event("tokenChanged"));

      localStorage.removeItem("cached_permissions");
      localStorage.removeItem("cached_permissions_timestamp");

      const currentUserId = user.id;
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cached_permissions_') || key.startsWith('cached_permissions_timestamp_'))) {
          const userIdMatch = key.match(/cached_permissions_(?:timestamp_)?(\d+)/);
          if (userIdMatch && userIdMatch[1] !== currentUserId.toString()) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", cleanedValues.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      let userPermissions = [];
      try {
        const modulesRes = await Api.get("/api/auth/modules");
          const allPermissions = [];

        for (const module of modulesRes.data) {
          const res = await Api.get(`/api/auth/permissions/${module}`);
          res.data.forEach((perm) => {
            const cleanName = perm.replace("can", "");
            
            let moduleKey = module;
            switch (module) {
              case "messages-templates":
                moduleKey = "messagesTemplates";
                break;
              case "journal-entries":
                moduleKey = "journalEntries";
                break;
              case "contract-templates":
                moduleKey = "contractTemplates";
                break;
              default:
                moduleKey = module;
            }
            
            allPermissions.push(`${moduleKey}_${cleanName}`);
          });
        }
        
        userPermissions = allPermissions;
        
        if (fetchPermissions && typeof fetchPermissions === 'function') {
          await fetchPermissions();
        }
      } catch (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
        notifyError('تم تسجيل الدخول ولكن حدث خطأ في جلب الصلاحيات');
      }


      const convertModuleToPermission = (module) => {
        switch (module) {
          case "messages-templates":
            return "messagesTemplates";
          case "journal-entries":
            return "journalEntries";
          case "contract-templates":
            return "contractTemplates";
          default:
            return module;
        }
      };

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
      notifySuccess("تم تسجيل الدخول بنجاح");  
      navigate(firstPage, { replace: true });
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
        background: {
          xs: "transparent",
          md: "radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.12), transparent 28%), #f5f7fb"
        },
        padding: { xs: 2, md: 4 },
      }}
    >
      <Helmet>
        <title>تسجيل الدخول</title>
        <meta name="description" content="تسجيل الدخول لنظام إدارة السلف" />
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
                أهلاً بعودتك
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.88)", mb: 3 }}>
                سجّل دخولك لمتابعة مؤشرات الأداء والدفعات اليومية بدقة عالية.
              </Typography>

              <Stack spacing={1.5}>
                {[
                  { icon: <SecurityIcon size={18} color="#ef4444" />, text: "حماية متقدمة مع صلاحيات دقيقة حسب الدور." },
                  { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "لوحات معلومات فورية لتتبع التدفقات النقدية." },
                  { icon: <CheckCircleIcon size={18} color="#22c55e" />, text: "تنبيهات ذكية لضمان الالتزام ومراقبة المخاطر." },
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
                <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#0f172a",textAlign: "center" }}>
                  تسجيل الدخول
                </Typography>
              </Stack>

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
                        autoComplete="username"
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
                              sx={{
                                  color: "#2E8B45",
                              }}
                            />
                          }
                          label={
                            <Typography sx={{ fontSize: "0.95rem", color: "#2E8B45" }}>
                              تذكرني
                            </Typography>
                          }
                          sx={{
                            mr: 0,
                            "& .MuiFormControlLabel-label": {
                              mr: 1,
                            },
                          }}
                        />

                        <Link
                          to="/forgot-password"
                          style={{
                            textDecoration: "none",
                            fontSize: "0.95rem",
                            color: "#2E8B45",
                            fontWeight: "bold",
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
                          "تسجيل الدخول "
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
  );
};

export default Login;