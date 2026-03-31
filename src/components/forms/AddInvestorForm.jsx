import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form } from 'formik';
import { AccountCircle, Work, Autorenew, CheckCircle } from '@mui/icons-material';
import * as Yup from 'yup';
import Api, { handleApiError } from '../../config/Api';
import { useQueryClient } from '@tanstack/react-query';
import { notifyError } from '../../utilities/toastify';
import ContractGenerator from '../contractGenerators/ContractGenerator';
import { QUERY_KEYS } from '../../components/investors/investorsUtils';
const formatNumberWithCommas = (value) => {
  if (!value) return '';
  const numValue = value.toString().replace(/,/g, '');
  if (isNaN(numValue) || numValue === '') return value;
  const parts = numValue.split('.');
  parts[0] = Number(parts[0]).toLocaleString('en-US');
  return parts.join('.');
};
const validationSchema = Yup.object().shape({
  name: Yup.string().required('الاسم مطلوب'),
  nationalId: Yup.string().required('رقم الهوية مطلوب'),
  address: Yup.string().required('العنوان مطلوب'),
  phone: Yup.string(),
  email: Yup.string()
    .transform((v) => (v?.trim() === '' ? null : v))
    .nullable()
    .email('البريد الإلكتروني غير صالح'),
  orgProfitPercent: Yup.number()
    .required('نسبة أرباح الشركة مطلوبة')
    .min(0, 'النسبة يجب أن تكون بين 0 و 100')
    .max(100, 'النسبة يجب أن تكون بين 0 و 100'),
  capitalAmount: Yup.number()
    .required('رأس المال مطلوب')
    .min(1, 'رأس المال يجب أن يكون أكبر من صفر'),
});
const AddInvestorForm = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [savedInvestorData, setSavedInvestorData] = useState(null);
  const [mudarabahTemplate, setMudarabahTemplate] = useState('');
  const contractGeneratorRef = useRef(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    fetchMudarabahTemplate();
  }, []);
  const fetchMudarabahTemplate = async () => {
    try {
      const response = await Api.get('/api/templates/mudarabah');
      setMudarabahTemplate(response.data.content || '');
    } catch {
      console.warn('Could not fetch Mudarabah template');
    }
  };
  const initialValues = {
    name: '',
    nationalId: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    orgProfitPercent: '',
    capitalAmount: '',
    createdAt: '',
    isNewPartner: true,
  };
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const nationalId = String(values.nationalId || '').trim();
      if (nationalId) {
        const { data } = await Api.get(`/api/partners/check-national-id/${encodeURIComponent(nationalId)}`);
        if (data?.exists) {
          notifyError('المساهم برقم الهوية هذا موجود مسبقًا');
          setLoading(false);
          return;
        }
      }
      const capitalClean = String(values.capitalAmount || '').replace(/,/g, '').replace(/[^0-9.]/g, '');
      const capitalAmount = parseFloat(capitalClean) || 0;
      const orgProfitPercent = parseInt(values.orgProfitPercent) || 0;
      const formDataForCreate = {
        name: values.name,
        nationalId: values.nationalId,
        address: values.address,
        city: values.city?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        email: values.email?.trim() || undefined,
        orgProfitPercent,
        capitalAmount,
        createdAt: values.createdAt || undefined,
        isNewPartner: values.isNewPartner,
      };
      const investorDataForContract = {
        name: values.name,
        nationalId: values.nationalId,
        address: values.address,
        city: values.city || 'الرياض',
        phone: values.phone,
        email: values.email?.trim() || '',
        capitalAmount,
        orgProfitPercent,
        partnerProfitPercent: 100 - orgProfitPercent,
        investorProfitPercent: 100 - orgProfitPercent,
      };
      setSavedInvestorData({
        investorData: investorDataForContract,
        formDataForCreate,
        isPendingCreate: true,
      });
      if (mudarabahTemplate) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            contractGeneratorRef.current?.generateContract();
          }, 300);
        });
      } else {
        notifyError('قالب عقد المضاربة غير متوفر حالياً');
      }
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };
  const handleContractGenerated = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTORS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVESTOR_DETAILS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OPENING_JOURNALS_CHECK] });
    queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
    onSuccess?.();
  };
  const inputBase =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-slate-900 dark:text-slate-100';
  const labelBase = 'text-sm font-semibold text-slate-700 dark:text-slate-300';
  if (savedInvestorData && mudarabahTemplate) {
    return (
      <ContractGenerator
        ref={contractGeneratorRef}
        investorData={savedInvestorData.investorData}
        formDataForCreate={savedInvestorData.formDataForCreate}
        isPendingCreate={savedInvestorData.isPendingCreate}
        templateContent={mudarabahTemplate}
        onContractGenerated={handleContractGenerated}
        onPreviewClose={onSuccess}
        contractType="MUDARABAH"
      />
    );
  }
  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">إضافة مستثمر جديد</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">يرجى إكمال بيانات المستثمر</p>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <div className="space-y-8">
              {}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-primary/10 mb-6">
                  <AccountCircle sx={{ fontSize: 24, color: 'primary.main' }} />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">المعلومات الشخصية</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>الاسم الكامل</label>
                    <input
                      name="name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                    {touched.name && errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>رقم الهوية الوطنية</label>
                    <input
                      name="nationalId"
                      value={values.nationalId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                      maxLength={12}
                    />
                    {touched.nationalId && errors.nationalId && <span className="text-xs text-red-500">{errors.nationalId}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>رقم الجوال (اختياري)</label>
                    <input
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="05XXXXXXXX"
                      className={`${inputBase} text-left`}
                      dir="ltr"
                      maxLength={10}
                    />
                    {touched.phone && errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>البريد الإلكتروني (اختياري)</label>
                    <input
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                    {touched.email && errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>تاريخ الانضمام (اختياري)</label>
                    <input
                      name="createdAt"
                      type="date"
                      value={values.createdAt}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>المدينة (اختياري)</label>
                    <input
                      name="city"
                      value={values.city}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                    <label className={labelBase}>العنوان</label>
                    <textarea
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      rows={2}
                      className={inputBase}
                    />
                    {touched.address && errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 flex flex-col gap-2">
                    <label className="text-base font-bold text-slate-700 dark:text-slate-300">هل المستثمر جديد؟</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isNewPartner"
                          checked={values.isNewPartner === true}
                          onChange={() => setFieldValue('isNewPartner', true)}
                          className="rounded-full border-slate-300 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">نعم</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isNewPartner"
                          checked={values.isNewPartner === false}
                          onChange={() => setFieldValue('isNewPartner', false)}
                          className="rounded-full border-slate-300 text-primary focus:ring-primary w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">لا</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              {}
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-primary/10 mb-6">
                  <Work sx={{ fontSize: 24, color: 'primary.main' }} />
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">المعلومات المالية</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>رأس المال (ريال)</label>
                    <input
                      name="capitalAmount"
                      type="text"
                      value={formatNumberWithCommas(values.capitalAmount)}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/,/g, '').replace(/[^0-9.]/g, '');
                        setFieldValue('capitalAmount', clean);
                      }}
                      onBlur={handleBlur}
                      placeholder="مثال: 100,000"
                      className={inputBase}
                    />
                    {touched.capitalAmount && errors.capitalAmount && <span className="text-xs text-red-500">{errors.capitalAmount}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelBase}>نسبة أرباح الشركة (%)</label>
                    <input
                      name="orgProfitPercent"
                      type="number"
                      min={0}
                      max={100}
                      value={values.orgProfitPercent}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputBase}
                    />
                    {touched.orgProfitPercent && errors.orgProfitPercent && <span className="text-xs text-red-500">{errors.orgProfitPercent}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-0 py-6 mt-8 border-t border-primary/10 flex justify-between items-center">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                إلغاء العملية
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block"><Autorenew sx={{ fontSize: 20 }} /></span>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <CheckCircle sx={{ fontSize: 20 }} />
                    إضافة المستثمر
                  </>
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
export default AddInvestorForm;
