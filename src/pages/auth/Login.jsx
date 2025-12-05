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
import routes from "../../routes";

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

  
      const response = await Api.post("/api/auth/login", cleanedValues);
      const { accessToken, user } = response.data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Clear old cached permissions format (for backward compatibility)
      localStorage.removeItem('cached_permissions');
      localStorage.removeItem('cached_permissions_timestamp');

      // Clear cached permissions for other users (keep only current user's cache)
      const currentUserId = user.id;
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cached_permissions_') || key.startsWith('cached_permissions_timestamp_'))) {
          // Extract user ID from key
          const userIdMatch = key.match(/cached_permissions_(?:timestamp_)?(\d+)/);
          if (userIdMatch && userIdMatch[1] !== currentUserId.toString()) {
            keysToRemove.push(key);
          }
        }
      }

      // Remove cached permissions for other users
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

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      direction: 'rtl'
                    }}
                  >
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