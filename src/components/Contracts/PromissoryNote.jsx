// components/contracts/PromissoryNote.jsx
import React from 'react';

const PromissoryNote = () => {
  return `
    <div style="font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; line-height: 1.8; padding: 20px;">
      <h2 style="text-align:center; font-weight:bold; margin-bottom: 10px;">سند لأمر</h2>
      <p style="text-align:center; font-size: 16px; margin-bottom: 20px;">
        رقم السند: <span style="background:#e0e7ff; padding:3px 8px; border-radius:4px;">{{رقم_السند}}</span>
      </p>
      
      <div style="background:#f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="text-align:center; margin-bottom: 15px; color: #2d3748;">تفاصيل السند</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; width: 30%; font-weight: bold;">تاريخ الأنشاء</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{تاريخ_الانشاء}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">تاريخ الأستحقاق</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{تاريخ_الاستحقاق}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">مدينة الأصدار</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{مدينة_الاصدار}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">مدينة الوفاء</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{مدينة_الوفاء}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">سبب انشاء السند</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{سبب_انشاء_السند}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">قيمة السند رقماً</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{قيمة_السند_رقما}} ريال</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">قيمة السند كتابة</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{قيمة_السند_كتابة}}</td>
          </tr>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
        <div style="flex: 1; margin: 0 10px;">
          <h4 style="color: #2d3748; margin-bottom: 10px;">تفاصيل الدائن</h4>
          <div style="background: #e0e7ff; padding: 10px; border-radius: 4px;">
            <p><strong>الإسم:</strong> {{اسم_الدائن}}</p>
            <p><strong>رقم الهوية:</strong> {{هوية_الدائن}}</p>
          </div>
        </div>
        <div style="flex: 1; margin: 0 10px;">
          <h4 style="color: #2d3748; margin-bottom: 10px;">تفاصيل المدين</h4>
          <div style="background: #e0e7ff; padding: 10px; border-radius: 4px;">
            <p><strong>الإسم:</strong> {{اسم_المدين}}</p>
            <p><strong>رقم الهوية:</strong> {{هوية_المدين}}</p>
          </div>
        </div>
        <div style="flex: 1; margin: 0 10px;">
          <h4 style="color: #2d3748; margin-bottom: 10px;">تفاصيل الكفيل</h4>
          <div style="background: #e0e7ff; padding: 10px; border-radius: 4px;">
            <p><strong>الإسم:</strong> {{اسم_الكفيل}}</p>
            <p><strong>رقم الهوية:</strong> {{هوية_الكفيل}}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 25px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">
          أتعهد بأن أدفع لأمر {{اسم_الدائن}} دون قيد أو شرط مبلغاً وقدره {{قيمة_السند_رقما}} ريال سعودي وفق البيانات
          المذكورة أعلاه. ولحامل هذا السند حق الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
        </p>
        <p style="text-align: center; font-weight: bold; margin-top: 15px;">
          إســــــــــــم المديـــــــن : {{اسم_المدين}}
        </p>
      </div>

      <div style="display: flex; justify-content: space-around; margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 10px;">توقيع الدائن</p>
          <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 150px;"></div>
          <p>{{اسم_الدائن}}</p>
        </div>
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 10px;">توقيع المدين</p>
          <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 150px;"></div>
          <p>{{اسم_المدين}}</p>
        </div>
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 10px;">توقيع الكفيل</p>
          <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 150px;"></div>
          <p>{{اسم_الكفيل}}</p>
        </div>
      </div>
    </div>
  `;
};

export default PromissoryNote;