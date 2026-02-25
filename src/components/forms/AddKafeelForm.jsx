import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Formik, Form } from 'formik';
import {
  Group,
  CloudUpload,
  AccountCircle,
  LocationOn,
  Work,
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

const kafeelValidationSchema = Yup.object().shape({
  name: Yup.string().required('اسم الكفيل مطلوب'),
  nationalId: Yup.string().required('رقم هوية الكفيل مطلوب'),
  phoneCode: Yup.string().required('رمز الدولة مطلوب'),
  phone: Yup.string().required('رقم جوال الكفيل مطلوب'),
  email: Yup.string()
    .transform((v) => (v?.trim() === '' ? null : v))
    .nullable()
    .email('البريد الإلكتروني غير صالح'),
  employer: Yup.string().required('جهة عمل الكفيل مطلوبة'),
  salary: Yup.number().required('الراتب مطلوب').min(1, 'الراتب يجب أن يكون أكبر من صفر'),
  obligations: Yup.number().required('التزامات الكفيل مطلوبة').min(0, 'الالتزامات يجب أن تكون صفر أو أكثر'),
  birthDate: Yup.string(),
  city: Yup.string().required('المدينة مطلوبة'),
  district: Yup.string().required('الحي مطلوب'),
});

const AddKafeelForm = ({ clientId, onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const queryClient = useQueryClient();

  const steps = [
    { label: 'بيانات الكفيل', icon: Group },
    { label: 'مرفقات الكفيل', icon: CloudUpload },
  ];

  const initialValues = {
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
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const getFilePreview = (file) => {
    if (file?.type?.startsWith('image/')) return URL.createObjectURL(file);
    return null;
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', String(values.name || ''));
      formData.append('nationalId', String(values.nationalId || ''));
      formData.append('phone', values.phoneCode + values.phone);
      formData.append('employer', String(values.employer || ''));
      formData.append('city', String(values.city || ''));
      formData.append('district', String(values.district || ''));
      if (values.birthDate) formData.append('birthDate', values.birthDate);
      formData.append('salary', String(values.salary || ''));
      formData.append('obligations', String(values.obligations || ''));
      if (values.email?.trim()) formData.append('email', String(values.email));

      Object.keys(uploadedFiles).forEach((key) => {
        formData.append(key, uploadedFiles[key]);
      });

      await Api.post(`/api/clients/${clientId}/kafeels`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notifySuccess('تم إضافة الكفيل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['client-details', clientId] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      onSuccess?.();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة الكفيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBase =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-slate-900 dark:text-slate-100';
  const labelBase = 'text-sm font-semibold text-slate-700 dark:text-slate-300';
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة كفيل جديد</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">يرجى إكمال خطوات إضافة بيانات الكفيل ومرفقاته</p>
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
        validationSchema={kafeelValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, setTouched, validateForm, submitForm }) => {
          const step1Fields = ['name', 'nationalId', 'phone', 'employer', 'salary', 'obligations', 'city', 'district'];
          const handleNextClick = async () => {
            const validationErrors = await validateForm();
            if (Object.keys(validationErrors).length > 0) {
              setTouched(Object.fromEntries(step1Fields.map((f) => [f, true])));
              return;
            }
            handleNext();
          };
          const handleSubmitClick = () => submitForm();
          return (
          <Form>
            <div className="overflow-y-auto">
              {activeStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3 flex items-center gap-2 pb-2 border-b border-primary/10 mb-2">
                    <AccountCircle sx={{ fontSize: 24, color: 'primary.main' }} />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">المعلومات الشخصية</h2>
                  </div>
                  {['name', 'nationalId', 'birthDate'].map((field) => (
                    <div key={field} className="flex flex-col gap-1.5">
                      <label className={labelBase}>{field === 'name' ? 'اسم الكفيل' : field === 'nationalId' ? 'رقم هوية الكفيل' : 'تاريخ الميلاد (اختياري)'}</label>
                      <input name={field} type={field === 'birthDate' ? 'date' : 'text'} value={values[field] || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                      {touched[field] && errors[field] && <span className={fieldError}>{errors[field]}</span>}
                    </div>
                  ))}
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>رقم جوال الكفيل</label>
                    <div className="flex gap-2">
                      <select name="phoneCode" value={values.phoneCode} onChange={handleChange} onBlur={handleBlur} className={`${inputBase} w-28 shrink-0`}>
                        {countryCodes.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                      </select>
                      <input name="phone" value={values.phone} onChange={handleChange} onBlur={handleBlur} placeholder="05XXXXXXXX" className={`${inputBase} text-left`} dir="ltr" />
                    </div>
                    {touched.phone && errors.phone && <span className={fieldError}>{errors.phone}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>البريد الإلكتروني (اختياري)</label>
                    <input name="email" type="email" value={values.email || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                    {touched.email && errors.email && <span className={fieldError}>{errors.email}</span>}
                  </div>
                  <div className="md:col-span-3 flex items-center gap-6 pb-2 border-b border-primary/10 mt-6 mb-2">
                    <div className="flex items-center gap-2">
                      <LocationOn sx={{ fontSize: 24, color: 'primary.main' }} />
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">بيانات العنوان</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Work sx={{ fontSize: 24, color: 'primary.main' }} />
                      <h2 className="text-lg font-bold text-slate-800 dark:text-white">بيانات العمل والدخل</h2>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>المدينة</label>
                    <input name="city" value={values.city || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                    {touched.city && errors.city && <span className={fieldError}>{errors.city}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>جهة عمل الكفيل</label>
                    <input name="employer" value={values.employer || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                    {touched.employer && errors.employer && <span className={fieldError}>{errors.employer}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>الحي</label>
                    <input name="district" value={values.district || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                    {touched.district && errors.district && <span className={fieldError}>{errors.district}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>راتب الكفيل</label>
                    <input name="salary" type="number" value={values.salary || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                    {touched.salary && errors.salary && <span className={fieldError}>{errors.salary}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>التزامات الكفيل</label>
                    <input name="obligations" type="number" value={values.obligations || ''} onChange={handleChange} onBlur={handleBlur} className={inputBase} />
                    {touched.obligations && errors.obligations && <span className={fieldError}>{errors.obligations}</span>}
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><ContactPage sx={{ color: 'primary.main' }} />مستندات الكفيل</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">صورة هوية الكفيل وبطاقة العمل اختيارية</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DocumentDropzone fieldName="kafeelIdImage" label="صورة هوية الكفيل (اختياري)" acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }} />
                    <DocumentDropzone fieldName="kafeelWorkCard" label="بطاقة عمل الكفيل (اختياري)" acceptedTypes={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }} />
                  </div>
                </div>
              )}
            </div>

            <div className="px-0 py-6 mt-8 border-t border-primary/10 flex justify-between items-center">
              <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                إلغاء العملية
              </button>
              <div className="flex gap-3">
                {activeStep > 0 && (
                  <button type="button" onClick={handleBack} disabled={isSubmitting} className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                    <ArrowForward sx={{ fontSize: 20 }} />رجوع
                  </button>
                )}
                {activeStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextClick}
                    className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                  >
                    التالي<span className="rotate-180 inline-block"><ArrowForward sx={{ fontSize: 20 }} /></span>
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmitClick} disabled={isSubmitting} className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70">
                    {isSubmitting ? <><span className="animate-spin inline-block"><Autorenew sx={{ fontSize: 20 }} /></span>جاري الإضافة...</> : <><CheckCircle sx={{ fontSize: 20 }} />إضافة الكفيل</>}
                  </button>
                )}
              </div>
            </div>
          </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default AddKafeelForm;
