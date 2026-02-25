import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Formik, Form } from 'formik';
import {
  Person,
  Group,
  CloudUpload,
  Close,
  AccountCircle,
  LocationOn,
  Work,
  VerifiedUser,
  Info,
  ContactPage,
  ArrowForward,
  Autorenew,
  CheckCircle,
} from '@mui/icons-material';
import * as Yup from 'yup';
import Api from '../../config/Api';
import { useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const countryCodes = [
  { code: '+20', country: 'مصر', flag: '🇪🇬' },
  { code: '+966', country: 'السعودية', flag: '🇸🇦' },
  { code: '+971', country: 'الإمارات', flag: '🇦🇪' },
  { code: '+974', country: 'قطر', flag: '🇶🇦' },
  { code: '+973', country: 'البحرين', flag: '🇧🇭' },
  { code: '+965', country: 'الكويت', flag: '🇰🇼' },
  { code: '+968', country: 'عمان', flag: '🇴🇲' },
  { code: '+962', country: 'الأردن', flag: '🇯🇴' },
  { code: '+961', country: 'لبنان', flag: '🇱🇧' },
  { code: '+963', country: 'سوريا', flag: '🇸🇾' },
  { code: '+964', country: 'العراق', flag: '🇮🇶' },
  { code: '+970', country: 'فلسطين', flag: '🇵🇸' },
  { code: '+1', country: 'الولايات المتحدة', flag: '🇺🇸' },
  { code: '+44', country: 'المملكة المتحدة', flag: '🇬🇧' },
];

const createClientValidationSchema = (hasKafeel, kafeelsLength) => {
  const kafeelSchema = Yup.object().shape({
    name: Yup.string().required('اسم الكفيل مطلوب'),
    nationalId: Yup.string().required('رقم هوية الكفيل مطلوب'),
    phoneCode: Yup.string().required('رمز الدولة مطلوب'),
    phone: Yup.string().required('رقم جوال الكفيل مطلوب'),
    email: Yup.string()
      .transform((value) => (value?.trim() === '' ? null : value))
      .nullable()
      .email('البريد الإلكتروني غير صالح'),
    employer: Yup.string().required('جهة عمل الكفيل مطلوبة'),
    salary: Yup.number().required('راتب الكفيل مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
    obligations: Yup.number().required('التزامات الكفيل مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
    birthDate: Yup.string(),
    city: Yup.string(),
    district: Yup.string(),
  });

  const baseSchema = {
    name: Yup.string().required('اسم العميل مطلوب'),
    phoneCode: Yup.string().required('رمز الدولة مطلوب'),
    phone: Yup.string().required('رقم الجوال مطلوب'),
    email: Yup.string()
      .transform((value) => (value?.trim() === '' ? null : value))
      .nullable()
      .email('البريد الإلكتروني غير صالح'),
    nationalId: Yup.string().required('رقم الهوية الوطنية مطلوب'),
    birthDate: Yup.date().required('تاريخ الميلاد مطلوب'),
    city: Yup.string().required('المدينة مطلوبة'),
    district: Yup.string().required('الحي مطلوب'),
    address: Yup.string().required('العنوان مطلوب'),
    employer: Yup.string().required('جهة العمل مطلوبة'),
    salary: Yup.number().required('الراتب مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
    obligations: Yup.number().required('الالتزامات مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
    creationReason: Yup.string().required('سبب الإنشاء مطلوب'),
    notes: Yup.string(),
    hasKafeel: Yup.boolean(),
    kafeels: hasKafeel && kafeelsLength > 0
      ? Yup.array().of(kafeelSchema).min(1, 'يجب إضافة كفيل واحد على الأقل')
      : Yup.array(),
  };

  return Yup.object().shape(baseSchema);
};

const AddClient = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [addAnotherKafeel, setAddAnotherKafeel] = useState(false);
  const queryClient = useQueryClient();
  const steps = [
    { label: 'بيانات العميل', icon: Person },
    { label: 'بيانات الكفيل', icon: Group },
    { label: 'المرفقات', icon: CloudUpload },
  ];

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const getInitialKafeelValues = () => ({
    name: '',
    nationalId: '',
    birthDate: '',
    city: '',
    district: '',
    employer: '',
    salary: '',
    obligations: '',
    phoneCode: '+966',
    phone: '',
    email: '',
  });

  const initialValues = {
    name: '',
    phoneCode: '+966',
    phone: '',
    email: '',
    nationalId: '',
    birthDate: '',
    city: '',
    district: '',
    address: '',
    employer: '',
    salary: '',
    obligations: '',
    creationReason: '',
    notes: '',
    hasKafeel: false,
    kafeels: [],
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleDrop = (acceptedFiles, fieldName) => {
    if (acceptedFiles.length > 0) {
      setUploadedFiles((prev) => ({
        ...prev,
        [fieldName]: acceptedFiles[0],
      }));
    }
  };

  const removeFile = (fieldName) => {
    setUploadedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });
  };

  const getFilePreview = (file) => {
    if (file?.type?.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const DocumentDropzone = ({ fieldName, label, acceptedTypes }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: acceptedTypes,
      onDrop: (files) => handleDrop(files, fieldName),
      multiple: false,
    });

    const file = uploadedFiles[fieldName];

    return (
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-primary/20 bg-primary/5 dark:bg-primary/10 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            {file.type?.startsWith('image/') ? (
              <>
                <img
                  src={getFilePreview(file)}
                  alt={file.name}
                  className="max-w-[200px] max-h-[120px] mb-2 rounded-lg object-cover"
                />
                <p className="text-sm text-slate-700 dark:text-slate-300">{file.name}</p>
              </>
            ) : (
              <>
                <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 0.5 }} />
                <p className="text-sm text-slate-700 dark:text-slate-300">{file.name}</p>
              </>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(fieldName);
              }}
              className="mt-2 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              إزالة
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 0.5 }} className="group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">اسحب وأفلت الملف هنا أو انقر للاختيار</p>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key === 'hasKafeel') {
          formData.append(key, values[key]);
        } else if (key === 'email' && (!values[key] || values[key].trim() === '')) {
          return;
        } else if (key === 'phone') {
          const fullPhone = values.phoneCode + values.phone;
          formData.append('phone', fullPhone);
        } else if (key === 'phoneCode') {
          return;
        } else if (key !== 'kafeels' && !key.startsWith('kafeel')) {
          if (values[key] !== '' && values[key] != null) formData.append(key, values[key]);
        }
      });

      if (values.hasKafeel && values.kafeels && values.kafeels.length > 0) {
        values.kafeels.forEach((kafeel, index) => {
          Object.keys(kafeel).forEach((key) => {
            if (key === 'email' && (!kafeel[key] || kafeel[key].trim() === '')) {
              return;
            } else if (key === 'phone') {
              const fullPhone = kafeel.phoneCode + kafeel.phone;
              formData.append(`kafeel[${index}][phone]`, fullPhone);
            } else if (key === 'phoneCode') {
              return;
            } else if (kafeel[key] !== '' && key !== 'kafeelIdImage' && key !== 'kafeelWorkCard') {
              formData.append(`kafeel[${index}][${key}]`, kafeel[key]);
            }
          });
        });
      }

      Object.keys(uploadedFiles).forEach((key) => {
        if (!key.startsWith('kafeels[') && !key.startsWith('kafeel[')) {
          formData.append(key, uploadedFiles[key]);
        }
      });

      if (values.hasKafeel && values.kafeels && values.kafeels.length > 0) {
        values.kafeels.forEach((kafeel, index) => {
          const kafeelIdImageKey = `kafeels[${index}][kafeelIdImage]`;
          const kafeelWorkCardKey = `kafeels[${index}][kafeelWorkCard]`;

          if (uploadedFiles[kafeelIdImageKey]) {
            formData.append('kafeelIdImage', uploadedFiles[kafeelIdImageKey]);
          }
          if (uploadedFiles[kafeelWorkCardKey]) {
            formData.append('kafeelWorkCard', uploadedFiles[kafeelWorkCardKey]);
          }
        });
      }

      await Api.post('/api/clients', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notifySuccess('تم إضافة العميل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onClose();
      setActiveStep(0);
      setUploadedFiles({});
      setAddAnotherKafeel(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة العميل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-slate-900 dark:text-slate-100';
  const labelBase = 'text-sm font-semibold text-slate-700 dark:text-slate-300';
  const fieldError = 'text-xs text-red-500 mt-0.5';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto h-screen right-56"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      dir="rtl"
    >
      <div className="w-full max-w-5xl max-h-[calc(100vh-5rem)] md:max-h-[calc(100vh-10rem)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col border border-primary/10 shrink-0">
        {/* Modal Header */}
        <div className="px-8 pt-8 pb-6 border-b border-primary/10 bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة عميل جديد</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                يرجى إكمال خطوات إضافة بيانات العميل الجديد في النظام المالي
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Close sx={{ fontSize: 20 }} />
            </button>
          </div>

          {/* Horizontal Stepper */}
          <div className="flex items-center justify-between max-w-3xl mx-auto relative">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      idx < activeStep
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : idx === activeStep
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <StepIcon sx={{ fontSize: 24 }} />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      idx <= activeStep ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 -mt-6 rounded ${
                      idx < activeStep ? 'bg-primary/40' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
              );
            })}
          </div>
        </div>

        <Formik
          initialValues={initialValues}
          validate={(values) => {
            const schema = createClientValidationSchema(values.hasKafeel || false, values.kafeels?.length || 0);
            try {
              schema.validateSync(values, { abortEarly: false });
              return {};
            } catch (err) {
              const errors = {};
              if (err.inner) {
                err.inner.forEach((error) => {
                  if (error.path) errors[error.path] = error.message;
                });
              }
              return errors;
            }
          }}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, submitForm }) => (
            <Form className="flex flex-col flex-1 min-h-0">
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900">
                {/* Step 0: Client Data */}
                {activeStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Personal Info */}
                    <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mb-2">
                      <AccountCircle sx={{ fontSize: 24, color: 'primary.main' }} />
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">المعلومات الشخصية</h2>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>الاسم الكامل</label>
                      <input
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="أدخل اسم العميل الثلاثي"
                        className={inputBase}
                      />
                      {touched.name && errors.name && <span className={fieldError}>{errors.name}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>رقم الهوية الوطنية</label>
                      <input
                        name="nationalId"
                        value={values.nationalId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="1XXXXXXXXX"
                        className={inputBase}
                      />
                      {touched.nationalId && errors.nationalId && <span className={fieldError}>{errors.nationalId}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>تاريخ الميلاد</label>
                      <input
                        name="birthDate"
                        type="date"
                        value={values.birthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={inputBase}
                      />
                      {touched.birthDate && errors.birthDate && (
                        <span className={fieldError}>{errors.birthDate}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>البريد الإلكتروني</label>
                      <input
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="example@mail.com"
                        className={inputBase}
                      />
                      {touched.email && errors.email && <span className={fieldError}>{errors.email}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>رقم الجوال</label>
                      <div className="flex gap-2">
                        <select
                          name="phoneCode"
                          value={values.phoneCode}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={`${inputBase} w-28 shrink-0`}
                        >
                          {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="05XXXXXXXX"
                          className={`${inputBase} text-left`}
                          dir="ltr"
                        />
                      </div>
                      {touched.phone && errors.phone && <span className={fieldError}>{errors.phone}</span>}
                    </div>
                    {/* بيانات العنوان */}
                    <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mt-6 mb-2">
                      <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">بيانات العنوان</h2>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>المدينة</label>
                      <input
                        name="city"
                        value={values.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="المدينة"
                        className={inputBase}
                      />
                      {touched.city && errors.city && <span className={fieldError}>{errors.city}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>الحي</label>
                      <input
                        name="district"
                        value={values.district}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="اسم الحي"
                        className={inputBase}
                      />
                      {touched.district && errors.district && <span className={fieldError}>{errors.district}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className={labelBase}>العنوان التفصيلي</label>
                      <input
                        name="address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="الشارع، رقم المبنى"
                        className={inputBase}
                      />
                      {touched.address && errors.address && <span className={fieldError}>{errors.address}</span>}
                    </div>
                    {/* بيانات العمل والدخل */}
                    <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mt-6 mb-2">
                      <Work sx={{ fontSize: 24, color: 'primary.main' }} />
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">بيانات العمل والدخل</h2>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>جهة العمل</label>
                      <input
                        name="employer"
                        value={values.employer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="اسم الشركة أو الوزارة"
                        className={inputBase}
                      />
                      {touched.employer && errors.employer && (
                        <span className={fieldError}>{errors.employer}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>الراتب الشهري</label>
                      <div className="relative">
                        <input
                          name="salary"
                          type="number"
                          value={values.salary}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="0.00"
                          className={`${inputBase} pl-12`}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ر.س</span>
                      </div>
                      {touched.salary && errors.salary && <span className={fieldError}>{errors.salary}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>الالتزامات الشهرية</label>
                      <div className="relative">
                        <input
                          name="obligations"
                          type="number"
                          value={values.obligations}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="0.00"
                          className={`${inputBase} pl-12`}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ر.س</span>
                      </div>
                      {touched.obligations && errors.obligations && (
                        <span className={fieldError}>{errors.obligations}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelBase}>سبب إنشاء الحساب</label>
                      <input
                        name="creationReason"
                        value={values.creationReason}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="تمويل، تجارة، إلخ"
                        className={inputBase}
                      />
                      {touched.creationReason && errors.creationReason && (
                        <span className={fieldError}>{errors.creationReason}</span>
                      )}
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className={labelBase}>ملاحظات إضافية</label>
                      <input
                        name="notes"
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="أي معلومات إضافية عن العميل"
                        className={inputBase}
                      />
                    </div>

                    {/* Has Kafeel Toggle */}
                    <div className="md:col-span-3 mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <VerifiedUser sx={{ fontSize: 24 }} color="primary" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">هل يوجد كفيل؟</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            تفعيل هذا الخيار سيضيف خطوة بيانات الكفيل
                          </p>
                        </div>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={values.hasKafeel}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFieldValue('hasKafeel', checked);
                            if (checked) {
                              if (!values.kafeels || values.kafeels.length === 0) {
                                setFieldValue('kafeels', [getInitialKafeelValues()]);
                              }
                            } else {
                              setFieldValue('kafeels', []);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all rtl:peer-checked:after:-translate-x-full peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 1: Kafeel Data */}
                {activeStep === 1 && values.hasKafeel && values.kafeels?.length > 0 && (
                  <div className="space-y-8">
                    {values.kafeels.map((kafeel, index) => (
                      <div key={index}>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                          <Group sx={{ color: 'primary.main' }} />
                          معلومات الكفيل {index + 1}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>اسم الكفيل</label>
                            <input
                              name={`kafeels[${index}][name]`}
                              value={kafeel.name || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                            {touched[`kafeels[${index}][name]`] && errors[`kafeels[${index}][name]`] && (
                              <span className={fieldError}>{errors[`kafeels[${index}][name]`]}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>رقم هوية الكفيل</label>
                            <input
                              name={`kafeels[${index}][nationalId]`}
                              value={kafeel.nationalId || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                            {touched[`kafeels[${index}][nationalId]`] && errors[`kafeels[${index}][nationalId]`] && (
                              <span className={fieldError}>{errors[`kafeels[${index}][nationalId]`]}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>تاريخ الميلاد</label>
                            <input
                              name={`kafeels[${index}][birthDate]`}
                              type="date"
                              value={kafeel.birthDate || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>رقم جوال الكفيل</label>
                            <div className="flex gap-2">
                              <select
                                name={`kafeels[${index}][phoneCode]`}
                                value={kafeel.phoneCode || '+966'}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${inputBase} w-28 shrink-0`}
                              >
                                {countryCodes.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <input
                                name={`kafeels[${index}][phone]`}
                                value={kafeel.phone || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`${inputBase} text-left`}
                                dir="ltr"
                              />
                            </div>
                            {touched[`kafeels[${index}][phone]`] && errors[`kafeels[${index}][phone]`] && (
                              <span className={fieldError}>{errors[`kafeels[${index}][phone]`]}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>البريد الإلكتروني (اختياري)</label>
                            <input
                              name={`kafeels[${index}][email]`}
                              type="email"
                              value={kafeel.email || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>المدينة</label>
                            <input
                              name={`kafeels[${index}][city]`}
                              value={kafeel.city || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>الحي</label>
                            <input
                              name={`kafeels[${index}][district]`}
                              value={kafeel.district || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>جهة عمل الكفيل</label>
                            <input
                              name={`kafeels[${index}][employer]`}
                              value={kafeel.employer || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                            {touched[`kafeels[${index}][employer]`] && errors[`kafeels[${index}][employer]`] && (
                              <span className={fieldError}>{errors[`kafeels[${index}][employer]`]}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>راتب الكفيل</label>
                            <input
                              name={`kafeels[${index}][salary]`}
                              type="number"
                              value={kafeel.salary || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                            {touched[`kafeels[${index}][salary]`] && errors[`kafeels[${index}][salary]`] && (
                              <span className={fieldError}>{errors[`kafeels[${index}][salary]`]}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className={labelBase}>التزامات الكفيل</label>
                            <input
                              name={`kafeels[${index}][obligations]`}
                              type="number"
                              value={kafeel.obligations || ''}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={inputBase}
                            />
                            {touched[`kafeels[${index}][obligations]`] && errors[`kafeels[${index}][obligations]`] && (
                              <span className={fieldError}>{errors[`kafeels[${index}][obligations]`]}</span>
                            )}
                          </div>
                        </div>
                        {index < values.kafeels.length - 1 && (
                          <div className="border-t border-slate-200 dark:border-slate-700 my-6" />
                        )}
                      </div>
                    ))}

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white">إضافة كفيل آخر</p>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addAnotherKafeel}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newKafeel = getInitialKafeelValues();
                              const updatedKafeels = [...(values.kafeels || []), newKafeel];
                              setFieldValue('kafeels', updatedKafeels);
                              setTimeout(() => setAddAnotherKafeel(false), 100);
                            } else {
                              setAddAnotherKafeel(false);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all rtl:peer-checked:after:-translate-x-full peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  </div>
                )}

                {activeStep === 1 && !values.hasKafeel && (
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 text-center">
                    <Info sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <p className="text-slate-700 dark:text-slate-300">تم تعطيل معلومات الكفيل. يمكنك المتابعة إلى الخطوة التالية.</p>
                  </div>
                )}

                {/* Step 2: Attachments */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <CloudUpload sx={{ color: 'primary.main' }} />
                      مستندات العميل
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <DocumentDropzone
                        fieldName="clientIdImage"
                        label="صورة هوية العميل"
                        acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                      />
                      <DocumentDropzone
                        fieldName="clientWorkCard"
                        label="بطاقة عمل العميل"
                        acceptedTypes={{
                          'application/pdf': ['.pdf'],
                          'image/*': ['.png', '.jpg', '.jpeg'],
                        }}
                      />
                      <DocumentDropzone
                        fieldName="salaryReport"
                        label="تقرير الراتب"
                        acceptedTypes={{
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc', '.docx'],
                        }}
                      />
                      <DocumentDropzone
                        fieldName="simaReport"
                        label="تقرير سمة"
                        acceptedTypes={{
                          'application/pdf': ['.pdf'],
                          'application/msword': ['.doc', '.docx'],
                        }}
                      />
                    </div>

                    {values.hasKafeel && values.kafeels?.length > 0 && (
                      <>
                        {values.kafeels.map((kafeel, index) => (
                          <div key={index}>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4 flex items-center gap-2">
                              <ContactPage sx={{ color: 'primary.main' }} />
                              مستندات الكفيل {index + 1}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <DocumentDropzone
                                fieldName={`kafeels[${index}][kafeelIdImage]`}
                                label={`صورة هوية الكفيل ${index + 1}`}
                                acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                              />
                              <DocumentDropzone
                                fieldName={`kafeels[${index}][kafeelWorkCard]`}
                                label={`بطاقة عمل الكفيل ${index + 1}`}
                                acceptedTypes={{
                                  'application/pdf': ['.pdf'],
                                  'image/*': ['.png', '.jpg', '.jpeg'],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-primary/10 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء العملية
                </button>
                <div className="flex gap-3">
                  {activeStep > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <ArrowForward sx={{ fontSize: 20 }} />
                      رجوع
                    </button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={
                        (activeStep === 1 &&
                          values.hasKafeel &&
                          values.kafeels?.some(
                            (k) =>
                              !k.name ||
                              !k.nationalId ||
                              !k.phoneCode ||
                              !k.phone ||
                              !k.employer ||
                              !k.salary ||
                              k.obligations === '' ||
                              k.obligations == null
                          )) ||
                        (activeStep === 0 &&
                          (!values.name ||
                            !values.phoneCode ||
                            !values.phone ||
                            !values.nationalId ||
                            !values.birthDate ||
                            !values.city ||
                            !values.district ||
                            !values.address ||
                            !values.employer ||
                            !values.salary ||
                            values.obligations === '' ||
                            values.obligations == null ||
                            !values.creationReason))
                      }
                      className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                    >
                      التالي
                      <span className="rotate-180 inline-block"><ArrowForward sx={{ fontSize: 20 }} /></span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitForm}
                      disabled={isSubmitting}
                      className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin inline-block"><Autorenew sx={{ fontSize: 20 }} /></span>
                          جاري الإضافة...
                        </>
                      ) : (
                        <>
                          إضافة العميل
                          <CheckCircle sx={{ fontSize: 20 }} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddClient;
