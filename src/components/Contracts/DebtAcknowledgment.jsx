// components/contracts/DebtAcknowledgment.jsx
import React from 'react';

const DebtAcknowledgment = () => {
  return `
    <div style="font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; line-height: 1.8; padding: 20px;">
      <h2 style="text-align:center; font-weight:bold; margin-bottom: 10px;">إقرار دين وتعهد بالسداد</h2>
      <p style="text-align:center; font-size: 16px; margin-bottom: 20px;">
        رقم الإقرار: <span style="background:#e0e7ff; padding:3px 8px; border-radius:4px;">{{رقم_الإقرار}}</span>
      </p>
      
      <div style="background:#f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="text-align:center; margin-bottom: 15px; color: #2d3748;">تفاصيل الإقرار</h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; width: 30%; font-weight: bold;">اقر أنا السيد</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{اسم_العميل}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">حامل هوية رقم</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{رقم_هوية_العميل}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">مكان إقامتي</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{عنوان_العميل}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">أنني قد استلمت من السيد</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{اسم_الدائن}}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">مبلغ و قدرة</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{المبلغ_رقما}} ريال</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">المبلغ كتابة</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{المبلغ_كتابة}}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #2d3748; margin-bottom: 10px;">نص الإقرار</h3>
        <p style="margin-bottom: 10px;">
          وأقر أنني قد استلمت هذا المبلغ على شكل دين يتم سداده على فترة من الزمن، وأتحمل كافة المسؤوليات و جميع
          العواقب القانونية والجنائية، في حالة اني لم اقم بسداد المبلغ فأنني أقوم بإسقاط حقوقي في التزوير أو التكذيب أو التنكير.
        </p>
        <p style="font-weight: bold; margin: 15px 0;">
          إسم المدين : {{اسم_العميل}}
        </p>
        <p style="margin-bottom: 10px;">
          و أتعهد بحلف اليمين في حالة أن تم التشكيك في الوثيقة. وعلى هذا الإتفاق فإني أوافق و أوقع على الوثيقة.
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 5px;">التاريخ الهجري</p>
          <div style="background: #e0e7ff; padding: 8px; border-radius: 4px; min-width: 150px;">
            {{التاريخ_الهجري}}
          </div>
        </div>
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 5px;">التاريخ الميلادي</p>
          <div style="background: #e0e7ff; padding: 8px; border-radius: 4px; min-width: 150px;">
            {{التاريخ_الميلادي}}
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-around; margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 10px;">توقيع الدائن</p>
          <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 200px;"></div>
          <p>{{اسم_الدائن}}</p>
        </div>
        <div style="text-align: center;">
          <p style="font-weight: bold; margin-bottom: 10px;">توقيع المدين</p>
          <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin-bottom: 5px; min-width: 200px;"></div>
          <p>{{اسم_العميل}}</p>
        </div>
      </div>
    </div>
  `;
};

export default DebtAcknowledgment;