// components/contracts/MudarabahContract.jsx
import React from 'react';

const MudarabahContract = () => {
  return `
    <div style="font-family: 'Noto Sans Arabic', sans-serif; direction: rtl; line-height: 1.8; padding: 20px;">
      <h2 style="text-align:center; font-weight:bold; margin-bottom: 20px;">عقد مضاربة</h2>
      
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; width: 40%; font-weight: bold;">تاريخ العقد</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{تاريخ_العقد_هجري}} ه الموافق {{تاريخ_العقد_ميلادي}} م</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">مكان إبرام العقد</td>
            <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">مدينة {{مدينة_العقد}}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: #2d3748; margin-bottom: 15px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">أطراف العقد:</h3>
        
        <div style="margin-bottom: 20px;">
          <h4 style="color: #4a5568; margin-bottom: 10px;">الطرف الأول )رب المال( :</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 30%; font-weight: bold;">الاسم</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{اسم_رب_المال}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">رقم الهوية الوطنية</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{هوية_رب_المال}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">العنوان</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{عنوان_رب_المال}}</td>
            </tr>
          </table>
          <p style="font-style: italic; margin-top: 5px;">ويشار إليه في هذا العقد ب "رب المال"</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="color: #4a5568; margin-bottom: 10px;">الطرف الثاني )المضارب( :</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 30%; font-weight: bold;">الاسم</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{اسم_المضارب_1}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">رقم الهوية الوطنية</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{هوية_المضارب_1}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">العنوان</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{عنوان_المضارب_1}}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 30%; font-weight: bold;">الاسم</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{اسم_المضارب_2}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">رقم الهوية الوطنية</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{هوية_المضارب_2}}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">العنوان</td>
              <td style="padding: 8px; background: #e0e7ff; border-radius: 4px;">{{عنوان_المضارب_2}}</td>
            </tr>
          </table>
          <p style="font-style: italic; margin-top: 5px;">ويشار إليهما مجتمعين في هذا العقد ب "المضارب"</p>
        </div>
      </div>

      <div style="margin-bottom: 20px; padding: 15px; background: #f0f4ff; border-radius: 8px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">تمهيد:</h4>
        <p style="margin-bottom: 10px;">
          لما كان رب المال يمتلك مبلغ نقديًا ويرغب في استثماره، وكان المضارب يمتلك الخبرة والدراية في مجال التسويق والبيع،
          فقد اتفق الأطراف بكامل أهليتهم المعتبرة شرعًا ونظامًا على إبرام عقد المضاربة هذا وفقًا للشروط والبنود التالية،
          المستندة إلى أحكام الأنظمة السعودية.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الأول: موضوع العقد:</h4>
        <p>
          يقدم رب المال للمضارب مبلغ من المال كمضاربة، ليقوم المضارب باستثماره في أنشطة التسويق الرقمي، والبيع،
          وشراء المستلزمات اللازمة للمشروع، على أن يكون الربح الناتج مشتركًا بين الطرفين وفقًا للنسب المتفق عليها في هذا
          العقد.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الثاني: رأس المال:</h4>
        <p>1. رأس مال المضاربة هو مبلغ وقدره {{رأس_المال}} ريال سعودي ){{رأس_المال_كتابة}} ريال سعودي( فقط لا غير.</p>
        <p>2. يُقر رب المال بأنه قد سلّم رأس المال كاملاً للمضارب عند توقيع هذا العقد، ويُقر المضارب باستلامه للمبلغ،
        ويعتبر توقيع الطرفين على هذا العقد بمثابة إيصال استلام.</p>
      </div>

      <!-- Continue with other clauses as needed -->

      <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 30px;">وعلى ما ذكر أعلاه، تم التوقيع</p>
        
        <div style="display: flex; justify-content: space-around;">
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">الطرف الأول )رب المال(</p>
            <p style="margin-bottom: 5px;">الاسم : {{اسم_رب_المال}}</p>
            <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin: 10px 0; min-width: 200px;"></div>
            <p>التوقيع : ___________________</p>
            <p>التاريخ : ___________________</p>
          </div>
          
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">الطرف الثاني )المضارب(</p>
            <p style="margin-bottom: 5px;">الاسم (1): {{اسم_المضارب_1}}</p>
            <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin: 10px 0; min-width: 200px;"></div>
            <p>التوقيع : ___________________</p>
            <p>التاريخ : ___________________</p>
          </div>

          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">الطرف الثاني )المضارب(</p>
            <p style="margin-bottom: 5px;">الاسم (2): {{اسم_المضارب_2}}</p>
            <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin: 10px 0; min-width: 200px;"></div>
            <p>التوقيع : ___________________</p>
            <p>التاريخ : ___________________</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default MudarabahContract;