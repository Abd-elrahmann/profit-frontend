// components/contracts/PaymentVoucher.jsx
import React from 'react';

const PaymentVoucher = () => {
  return `
    <div style="font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; line-height: 1.8; padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2 style="text-align:center; font-weight:bold; margin-bottom: 10px;">سند الصرف</h2>
      <p style="text-align:center; font-size: 16px; margin-bottom: 20px;">
        رقم السند: <span style="background:#e0e7ff; padding:3px 8px; border-radius:4px;">{{رقم_السند}}</span>
      </p>
      
      <div style="border: 2px solid #2d3748; border-radius: 10px; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <p style="font-size: 18px; font-weight: bold;">أقر أنا الموقع أدناه بأنني قد سلمت مبلغاً نقدياً إلى</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
          <tr>
            <td style="padding: 10px; width: 40%; font-weight: bold; border: 1px solid #cbd5e0;">اسم المستلم</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{اسم_المستلم}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">رقم الهوية</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{هوية_المستلم}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">المبلغ رقماً</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{المبلغ_رقما}} ريال سعودي</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">المبلغ كتابة</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{المبلغ_كتابة}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">سبب الصرف</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{سبب_الصرف}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">طريقة الصرف</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{طريقة_الصرف}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">التاريخ الهجري</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{التاريخ_الهجري}}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border: 1px solid #cbd5e0;">التاريخ الميلادي</td>
            <td style="padding: 10px; border: 1px solid #cbd5e0; background: #f7fafc;">{{التاريخ_الميلادي}}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <p style="font-weight: bold; font-size: 16px;">وذلك مقابل البضاعة/الخدمة المذكورة أعلاه</p>
        </div>

        <div style="display: flex; justify-content: space-around; margin-top: 40px;">
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">توقيع المسلم</p>
            <div style="height: 80px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 200px;"></div>
            <p>الاسم: {{اسم_المسلم}}</p>
            <p>التاريخ: ___________________</p>
          </div>
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">توقيع المستلم</p>
            <div style="height: 80px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 200px;"></div>
            <p>الاسم: {{اسم_المستلم}}</p>
            <p>التاريخ: ___________________</p>
          </div>
        </div>

        <div style="margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
          <p style="font-weight: bold; margin-bottom: 5px;">ملاحظات:</p>
          <p>{{ملاحظات}}</p>
        </div>
      </div>
    </div>
  `;
};

export default PaymentVoucher;