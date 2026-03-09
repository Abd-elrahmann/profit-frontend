import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, setIn } from 'formik';
import {
  Person,
  Group,
  CloudUpload,
  AccountCircle,
  LocationOn,
  Work,
  VerifiedUser,
  Close,
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
    salary: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('راتب الكفيل مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
    obligations: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('التزامات الكفيل مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
    birthDate: Yup.string(),
    city: Yup.string().required('المدينة مطلوبة'),
    district: Yup.string().required('الحي مطلوب'),
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
    birthDate: Yup.date().transform((v, o) => (o === '' || o == null ? null : v)).nullable(),
    city: Yup.string().required('المدينة مطلوبة'),
    district: Yup.string().required('الحي مطلوب'),
    address: Yup.string().required('العنوان مطلوب'),
    employer: Yup.string().required('جهة العمل مطلوبة'),
    salary: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('الراتب مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
    obligations: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('الالتزامات مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
    creationReason: Yup.string().required('سبب الإنشاء مطلوب'),
    notes: Yup.string(),
    hasKafeel: Yup.boolean(),
    kafeels: hasKafeel && kafeelsLength > 0
      ? Yup.array().of(kafeelSchema).min(1, 'يجب إضافة كفيل واحد على الأقل')
      : Yup.array(),
  };
  return Yup.object().shape(baseSchema);
};
const createStep0Schema = () =>
  Yup.object().shape({
    name: Yup.string().required('اسم العميل مطلوب'),
    phoneCode: Yup.string().required('رمز الدولة مطلوب'),
    phone: Yup.string().required('رقم الجوال مطلوب'),
    email: Yup.string().transform((v) => (v?.trim() === '' ? null : v)).nullable().email('البريد الإلكتروني غير صالح'),
    nationalId: Yup.string().required('رقم الهوية الوطنية مطلوب'),
    birthDate: Yup.date().transform((v, o) => (o === '' || o == null ? null : v)).nullable(),
    city: Yup.string().required('المدينة مطلوبة'),
    district: Yup.string().required('الحي مطلوب'),
    address: Yup.string().required('العنوان مطلوب'),
    employer: Yup.string().required('جهة العمل مطلوبة'),
    salary: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('الراتب مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
    obligations: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('الالتزامات مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
    creationReason: Yup.string().required('سبب الإنشاء مطلوب'),
    notes: Yup.string(),
    hasKafeel: Yup.boolean(),
    kafeels: Yup.array(),
  });
const AddClientForm = ({ onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [addAnotherKafeel, setAddAnotherKafeel] = useState(false);
  const [hasKafeel, setHasKafeel] = useState(false);
  const queryClient = useQueryClient();
  const steps = hasKafeel
    ? [
        { label: 'بيانات العميل', icon: Person },
        { label: 'بيانات الكفيل', icon: Group },
        { label: 'المرفقات', icon: CloudUpload },
      ]
    : [
        { label: 'بيانات العميل', icon: Person },
        { label: 'المرفقات', icon: CloudUpload },
      ];
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
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleDrop = (acceptedFiles, fieldName) => {
    if (acceptedFiles.length > 0) {
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: acceptedFiles[0] }));
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
    if (file?.type?.startsWith('image/')) return URL.createObjectURL(file);
    return null;
  };
  const handleSubmit = async (values) => {
    if (!uploadedFiles.clientIdImage) {
      notifyError('صورة هوية العميل مطلوبة');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === 'hasKafeel') formData.append(key, values[key]);
        else if (key === 'email' && (!values[key] || values[key].trim() === '')) return;
        else if (key === 'phone') formData.append('phone', values.phoneCode + values.phone);
        else if (key === 'phoneCode') return;
        else if (key !== 'kafeels' && !key.startsWith('kafeel') && values[key] !== '' && values[key] != null) {
          formData.append(key, values[key]);
        }
      });
      if (values.hasKafeel && values.kafeels?.length > 0) {
        values.kafeels.forEach((kafeel, index) => {
          Object.keys(kafeel).forEach((key) => {
            if (key === 'email' && (!kafeel[key] || kafeel[key].trim() === '')) return;
            if (key === 'phone') formData.append(`kafeel[${index}][phone]`, kafeel.phoneCode + kafeel.phone);
            else if (key === 'phoneCode') return;
            else if (kafeel[key] !== '' && key !== 'kafeelIdImage' && key !== 'kafeelWorkCard') {
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
      if (values.hasKafeel && values.kafeels?.length > 0) {
        values.kafeels.forEach((kafeel, index) => {
          const kafeelIdImageKey = `kafeels[${index}][kafeelIdImage]`;
          const kafeelWorkCardKey = `kafeels[${index}][kafeelWorkCard]`;
          if (uploadedFiles[kafeelIdImageKey]) formData.append('kafeelIdImage', uploadedFiles[kafeelIdImageKey]);
          if (uploadedFiles[kafeelWorkCardKey]) formData.append('kafeelWorkCard', uploadedFiles[kafeelWorkCardKey]);
        });
      }
      await Api.post('/api/clients', formData);
      notifySuccess('تم إضافة العميل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onSuccess?.();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة العميل');
    } finally {
      setIsSubmitting(false);
    }
  };
  const inputBase =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-slate-900 dark:text-slate-100';
  const inputError = '!border-red-500 dark:!border-red-500 focus:!ring-red-500/50';
  const labelBase = 'text-sm font-semibold text-slate-700 dark:text-slate-300';
  const labelRequired = 'text-red-500 me-0.5';
  const fieldError = 'text-xs text-red-500 mt-0.5';
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
          isDragActive ? 'border-primary bg-primary/5' : 'border-primary/20 bg-primary/5 dark:bg-primary/10 hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            {file.type?.startsWith('image/') ? (
              <>
                <img src={getFilePreview(file)} alt={file.name} className="max-w-[200px] max-h-[120px] mb-2 rounded-lg object-cover" />
                <p className="text-sm text-slate-700 dark:text-slate-300">{file.name}</p>
              </>
            ) : (
              <>
                <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 0.5 }} />
                <p className="text-sm text-slate-700 dark:text-slate-300">{file.name}</p>
              </>
            )}
            <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(fieldName); }} className="mt-2 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
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
  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة عميل جديد</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">يرجى إكمال خطوات إضافة بيانات العميل الجديد في النظام المالي</p>
      </div>
      <div className="flex items-center justify-between max-w-3xl mb-8">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  idx <= activeStep ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                }`}
              >
                <StepIcon sx={{ fontSize: 24 }} />
              </div>
              <span className={`text-sm font-medium ${idx <= activeStep ? 'text-primary font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && <div className={`flex-1 h-1 mx-4 -mt-6 rounded ${idx < activeStep ? 'bg-primary/40' : 'bg-slate-100 dark:bg-slate-800'}`} />}
          </React.Fragment>
          );
        })}
      </div>
      <Formik
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={false}
        validate={(values) => {
          const schema = createClientValidationSchema(values.hasKafeel || false, values.kafeels?.length || 0);
          try {
            schema.validateSync(values, { abortEarly: false });
            return {};
          } catch (err) {
            const errors = {};
            err.inner?.forEach((error) => { if (error.path) errors[error.path] = error.message; });
            return errors;
          }
        }}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, submitForm, setTouched, setErrors }) => {
          const handleNextWithValidation = async () => {
            let errs = {};
            if (activeStep === 0) {
              try {
                createStep0Schema().validateSync(values, { abortEarly: false });
              } catch (validationErr) {
                validationErr.inner?.forEach((e) => { if (e.path) errs[e.path] = e.message; });
              }
            } else if (activeStep === 1 && values.hasKafeel && values.kafeels?.length > 0) {
              const kafeelSchema = Yup.object().shape({
                name: Yup.string().required('اسم الكفيل مطلوب'),
                nationalId: Yup.string().required('رقم هوية الكفيل مطلوب'),
                phoneCode: Yup.string().required('رمز الدولة مطلوب'),
                phone: Yup.string().required('رقم جوال الكفيل مطلوب'),
                email: Yup.string().transform((v) => (v?.trim() === '' ? null : v)).nullable().email('البريد الإلكتروني غير صالح'),
                employer: Yup.string().required('جهة عمل الكفيل مطلوبة'),
                salary: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('راتب الكفيل مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
                obligations: Yup.number().transform((v, o) => (o === '' || o == null ? undefined : v)).required('التزامات الكفيل مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
                city: Yup.string().required('المدينة مطلوبة'),
                district: Yup.string().required('الحي مطلوب'),
              });
              values.kafeels.forEach((k, i) => {
                try {
                  kafeelSchema.validateSync(k, { abortEarly: false });
                } catch (validationErr) {
                  validationErr.inner?.forEach((e) => { if (e.path) errs[`kafeels.${i}.${e.path}`] = e.message; });
                }
              });
            }
            if (Object.keys(errs).length > 0) {
              let newTouched = { ...touched };
              Object.keys(errs).forEach((path) => { newTouched = setIn(newTouched, path, true); });
              setTouched(newTouched);
              setErrors(errs);
              return;
            }
            setErrors({});
            handleNext();
          };
          return (
          <Form>
            <div className="overflow-y-auto">
              {activeStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mb-2">
                    <AccountCircle sx={{ fontSize: 24, color: 'primary.main' }} />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">المعلومات الشخصية</h2>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>الاسم الكامل <span className={labelRequired}>*</span></label>
                    <input name="name" value={values.name} onChange={handleChange} onBlur={handleBlur} placeholder="أدخل اسم العميل الثلاثي" className={`${inputBase} ${errors.name ? inputError : ''}`} />
                    {errors.name && <span className={fieldError}>{errors.name}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>رقم الهوية الوطنية <span className={labelRequired}>*</span></label>
                    <input name="nationalId" value={values.nationalId} onChange={handleChange} onBlur={handleBlur} placeholder="1XXXXXXXXX" className={`${inputBase} ${errors.nationalId ? inputError : ''}`} />
                    {errors.nationalId && <span className={fieldError}>{errors.nationalId}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>تاريخ الميلاد (اختياري)</label>
                    <input name="birthDate" type="date" value={values.birthDate} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} ${errors.birthDate ? inputError : ''}`} />
                    {errors.birthDate && <span className={fieldError}>{errors.birthDate}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>البريد الإلكتروني (اختياري)</label>
                    <input name="email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur} placeholder="example@mail.com" className={`${inputBase} ${errors.email ? inputError : ''}`} />
                    {errors.email && <span className={fieldError}>{errors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>رقم الجوال <span className={labelRequired}>*</span></label>
                    <div className="flex gap-3">
                      <select name="phoneCode" value={values.phoneCode} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} ${errors.phoneCode || errors.phone ? inputError : ''}`} style={{ width: '110px', minWidth: '110px', flexShrink: 0 }}>
                        {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                      </select>
                      <input name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} placeholder="05XXXXXXXX" className={`${inputBase} ${errors.phone ? inputError : ''} flex-1 min-w-[140px]`} style={{ textAlign: 'left' }} dir="ltr" />
                    </div>
                    {(errors.phone || errors.phoneCode) && <span className={fieldError}>{errors.phone || errors.phoneCode}</span>}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mt-6 mb-2">
                    <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">بيانات العنوان</h2>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>المدينة <span className={labelRequired}>*</span></label>
                    <input name="city" value={values.city} onChange={handleChange} onBlur={handleBlur} placeholder="المدينة" className={`${inputBase} ${errors.city ? inputError : ''}`} />
                    {errors.city && <span className={fieldError}>{errors.city}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>الحي <span className={labelRequired}>*</span></label>
                    <input name="district" value={values.district} onChange={handleChange} onBlur={handleBlur} placeholder="اسم الحي" className={`${inputBase} ${errors.district ? inputError : ''}`} />
                    {errors.district && <span className={fieldError}>{errors.district}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className={labelBase}>العنوان التفصيلي <span className={labelRequired}>*</span></label>
                    <input name="address" value={values.address} onChange={handleChange} onBlur={handleBlur} placeholder="الشارع، رقم المبنى" className={`${inputBase} ${errors.address ? inputError : ''}`} />
                    {errors.address && <span className={fieldError}>{errors.address}</span>}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mt-6 mb-2">
                    <Work sx={{ fontSize: 24, color: 'primary.main' }} />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">بيانات العمل والدخل</h2>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>جهة العمل <span className={labelRequired}>*</span></label>
                    <input name="employer" value={values.employer} onChange={handleChange} onBlur={handleBlur} placeholder="اسم الشركة أو الوزارة" className={`${inputBase} ${errors.employer ? inputError : ''}`} />
                    {errors.employer && <span className={fieldError}>{errors.employer}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>الراتب الشهري <span className={labelRequired}>*</span></label>
                    <div className="relative">
                      <input name="salary" type="number" value={values.salary} onChange={handleChange} onBlur={handleBlur} placeholder="0.00" className={`${inputBase} pl-12 ${errors.salary ? inputError : ''}`} />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ر.س</span>
                    </div>
                    {errors.salary && <span className={fieldError}>{errors.salary}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>الالتزامات الشهرية <span className={labelRequired}>*</span></label>
                    <div className="relative">
                      <input name="obligations" type="number" value={values.obligations} onChange={handleChange} onBlur={handleBlur} placeholder="0.00" className={`${inputBase} pl-12 ${errors.obligations ? inputError : ''}`} />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">ر.س</span>
                    </div>
                    {errors.obligations && <span className={fieldError}>{errors.obligations}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>سبب إنشاء الحساب <span className={labelRequired}>*</span></label>
                    <input name="creationReason" value={values.creationReason} onChange={handleChange} onBlur={handleBlur} placeholder="تمويل، تجارة، إلخ" className={`${inputBase} ${errors.creationReason ? inputError : ''}`} />
                    {errors.creationReason && <span className={fieldError}>{errors.creationReason}</span>}
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className={labelBase}>ملاحظات إضافية (اختياري)</label>
                    <input name="notes" value={values.notes} onChange={handleChange} onBlur={handleBlur} placeholder="أي معلومات إضافية عن العميل" className={inputBase} />
                  </div>
                  <div className="md:col-span-3 mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center"><VerifiedUser sx={{ fontSize: 24 }} color="primary" /></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">هل يوجد كفيل؟</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">تفعيل هذا الخيار سيضيف خطوة بيانات الكفيل</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newValue = !values.hasKafeel;
                        setFieldValue('hasKafeel', newValue, false);
                        setHasKafeel(newValue);
                        if (newValue && (!values.kafeels || values.kafeels.length === 0)) {
                          setFieldValue('kafeels', [getInitialKafeelValues()], false);
                        } else if (!newValue) {
                          setFieldValue('kafeels', [], false);
                          if (activeStep > 1) setActiveStep(1);
                        }
                      }}
                      className="relative w-14 h-7 rounded-full transition-colors focus:outline-none"
                      style={{ backgroundColor: values.hasKafeel ? 'var(--color-primary)' : '' }}
                    >
                      <div className={`relative w-14 h-7 ${values.hasKafeel ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'} rounded-full transition-colors`}>
                        <div className={`absolute top-0.5 h-6 w-6 bg-white rounded-full transition-all ${values.hasKafeel ? 'start-[calc(100%-28px)]' : 'start-[4px]'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              )}
              {activeStep === 1 && hasKafeel && values.kafeels?.length > 0 && (
                <div className="space-y-8">
                  {values.kafeels.map((kafeel, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Group sx={{ color: 'primary.main' }} />معلومات الكفيل {index + 1}</h2>
                        <button
                          type="button"
                          onClick={() => {
                            const newKafeels = values.kafeels.filter((_, i) => i !== index);
                            setFieldValue('kafeels', newKafeels);
                            if (newKafeels.length === 0) {
                              setFieldValue('hasKafeel', false);
                              setHasKafeel(false);
                              if (activeStep > 1) setActiveStep(1);
                              setUploadedFiles((prev) => {
                                const next = { ...prev };
                                Object.keys(next).forEach((k) => { if (k.startsWith('kafeels[')) delete next[k]; });
                                return next;
                              });
                            } else {
                              const newFiles = { ...uploadedFiles };
                              Object.keys(newFiles).forEach((key) => {
                                if (key.startsWith('kafeels[')) delete newFiles[key];
                              });
                              newKafeels.forEach((_, i) => {
                                const oldIdx = i >= index ? i + 1 : i;
                                ['kafeelIdImage', 'kafeelWorkCard'].forEach((f) => {
                                  const oldKey = `kafeels[${oldIdx}][${f}]`;
                                  if (uploadedFiles[oldKey]) newFiles[`kafeels[${i}][${f}]`] = uploadedFiles[oldKey];
                                });
                              });
                              setUploadedFiles(newFiles);
                            }
                          }}
                          className="px-4 py-2 rounded-lg text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          <Close sx={{ fontSize: 20 }} />
                          إلغاء
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {['name', 'nationalId', 'birthDate'].map((field) => {
                          const path = `kafeels.${index}.${field}`;
                          const err = errors[path];
                          return (
                            <div key={field} className="flex flex-col gap-1.5">
                              <label className={labelBase}>{field === 'name' ? <>اسم الكفيل <span className={labelRequired}>*</span></> : field === 'nationalId' ? <>رقم هوية الكفيل <span className={labelRequired}>*</span></> : 'تاريخ الميلاد (اختياري)'}</label>
                              <input name={`kafeels[${index}][${field}]`} type={field === 'birthDate' ? 'date' : 'text'} value={kafeel[field] || ''} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} ${err ? inputError : ''}`} />
                              {err && <span className={fieldError}>{err}</span>}
                            </div>
                          );
                        })}
                        <div className="flex flex-col gap-1.5">
                          <label className={labelBase}>رقم جوال الكفيل <span className={labelRequired}>*</span></label>
                          <div className="flex gap-3">
                            <select name={`kafeels[${index}][phoneCode]`} value={kafeel.phoneCode || '+966'} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} ${errors[`kafeels.${index}.phoneCode`] || errors[`kafeels.${index}.phone`] ? inputError : ''}`} style={{ width: '110px', minWidth: '110px', flexShrink: 0 }}>
                              {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                            </select>
                            <input name={`kafeels[${index}][phone]`} value={kafeel.phone || ''} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} ${errors[`kafeels.${index}.phone`] ? inputError : ''} flex-1 min-w-[140px]`} style={{ textAlign: 'left' }} dir="ltr" />
                          </div>
                          {(errors[`kafeels.${index}.phone`] || errors[`kafeels.${index}.phoneCode`]) && <span className={fieldError}>{errors[`kafeels.${index}.phone`] || errors[`kafeels.${index}.phoneCode`]}</span>}
                        </div>
                        {['email', 'city', 'district', 'employer', 'salary', 'obligations'].map((field) => {
                          const path = `kafeels.${index}.${field}`;
                          const err = errors[path];
                          return (
                            <div key={field} className="flex flex-col gap-1.5">
                              <label className={labelBase}>{field === 'email' ? 'البريد الإلكتروني (اختياري)' : field === 'city' ? <>المدينة <span className={labelRequired}>*</span></> : field === 'district' ? <>الحي <span className={labelRequired}>*</span></> : field === 'employer' ? <>جهة عمل الكفيل <span className={labelRequired}>*</span></> : field === 'salary' ? <>راتب الكفيل <span className={labelRequired}>*</span></> : <>التزامات الكفيل <span className={labelRequired}>*</span></>}</label>
                              <input name={`kafeels[${index}][${field}]`} type={field === 'email' ? 'email' : field === 'salary' || field === 'obligations' ? 'number' : 'text'} value={kafeel[field] || ''} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} ${err ? inputError : ''}`} />
                              {err && <span className={fieldError}>{err}</span>}
                            </div>
                          );
                        })}
                      </div>
                      {index < values.kafeels.length - 1 && <div className="border-t border-slate-200 dark:border-slate-700 my-6" />}
                    </div>
                  ))}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white">إضافة كفيل آخر</p>
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={addAnotherKafeel} onChange={(e) => { if (e.target.checked) { setFieldValue('kafeels', [...(values.kafeels || []), getInitialKafeelValues()]); setTimeout(() => setAddAnotherKafeel(false), 100); } else setAddAnotherKafeel(false); }} className="sr-only peer" />
                      <div className="relative w-14 h-7 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all rtl:peer-checked:after:-translate-x-full peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              )}
              {(activeStep === 2 && hasKafeel) || (activeStep === 1 && !hasKafeel) ? (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><CloudUpload sx={{ color: 'primary.main' }} />مستندات العميل</h2>
                  {!uploadedFiles.clientIdImage && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">صورة هوية العميل مطلوبة</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DocumentDropzone fieldName="clientIdImage" label="صورة هوية العميل" acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] }} />
                    <DocumentDropzone fieldName="clientWorkCard" label="بطاقة عمل العميل" acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] }} />
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button type="button" onClick={handleBack} className="px-6 py-2.5 rounded-lg font-bold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                رجوع
              </button>
              {activeStep < (hasKafeel ? 2 : 1) ? (
                <button type="button" onClick={handleNextWithValidation} className="px-6 py-2.5 rounded-lg font-bold bg-primary text-white">
                  التالي
                </button>
              ) : (
                <button type="button" onClick={() => submitForm()} className="px-6 py-2.5 rounded-lg font-bold bg-primary text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'جاري الإضافة...' : 'إضافة العميل'}
                </button>
              )}
            </div>
          </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default AddClientForm;