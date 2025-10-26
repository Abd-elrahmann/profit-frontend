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
          <h4 style="color: #4a5568; margin-bottom: 10px;">الطرف الأول (رب المال):</h4>
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
          <h4 style="color: #4a5568; margin-bottom: 10px;">الطرف الثاني (المضاربان):</h4>
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
          لما كان رب المال يمتلك مبلغاً نقدياً ويرغب في استثماره، وكان المضارب يمتلك الخبرة والدراية في مجال التسويق والبيع،
          فقد اتفق الأطراف بكامل أهليتهم المعتبرة شرعًا ونظامًا على إبرام عقد المضاربة هذا وفقًا للشروط والبنود التالية،
          المستندة إلى أحكام الأنظمة السعودية.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الأول: موضوع العقد:</h4>
        <p>
          يقدم رب المال للمضارب مبلغاً من المال كمضاربة، ليقوم المضارب باستثماره في أنشطة التسويق الرقمي، والبيع،
          وشراء المستلزمات اللازمة للمشروع، على أن يكون الربح الناتج مشتركاً بين الطرفين وفقًا للنسب المتفق عليها في هذا
          العقد.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الثاني: رأس المال:</h4>
        <p>1. رأس مال المضاربة هو مبلغ وقدره 10,000 ريال سعودي (عشرة آلاف ريال سعودي) فقط لا غير.</p>
        <p>2. يُقر رب المال بأنه قد سلّم رأس المال كاملاً للمضارب عند توقيع هذا العقد، ويُقر المضارب باستلامه للمبلغ،
        ويعتبر توقيع الطرفين على هذا العقد بمثابة إيصال استلام.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الثالث: طبيعة العمل</h4>
        <p>1. تُعتبر هذه المضاربة مضاربة مقيدة، حيث يقتصر عمل المضارب على الأنشطة المذكورة في البند الأول من هذا العقد.</p>
        <p>2. يلتزم المضارب ببذل عناية الشخص المعتاد في إدارة أموال المضاربة والمحافظة عليها.</p>
        <p>3. يُقر المضارب بأنه يعمل بشكل مشترك ومتضامن في إدارة هذه المضاربة، ويكونان مسؤولين بالتضامن تجاه رب المال عن أي التزامات تنشأ عن تعدٍ أو تقصير أو مخالفة لشروط العقد.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الرابع: مدة العقد</h4>
        <p>مدة هذا العقد سنتان ميلاديتان كاملتان، تبدأ من تاريخ توقيعه. لا يتم تجديد العقد تلقائياً، ويتطلب تجديده اتفاقاً كتابياً جديداً بين الأطراف.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الخامس: قسمة الأرباح</h4>
        <p>1. يتم توزيع صافي الأرباح الناتجة عن المضاربة (وهو ما زاد على رأس المال بعد خصم المصاريف التشغيلية) وفقاً للنسب التالية:</p>
        <ul style="list-style-type: none; padding-left: 20px;">
          <li>• (75%) خمسة وسبعون بالمائة لرب المال.</li>
          <li>• (25%) خمسة وعشرون بالمائة للمضارب، وتُقسم هذه النسبة بين الشريكين المضاربين بالتساوي (12.5% لكل منهما).</li>
        </ul>
        <p>2. يتم تقييم أصول المشروع وتحديد الأرباح بشكل دوري (ربع سنوي/نصف سنوي/سنوي) بناءً على تقارير مالية يقدمها المضارب.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند السادس: الخسارة</h4>
        <p>1. في حال حدوث خسارة مالية، يتحملها رب المال وحده وتُخصم من رأس مال المضاربة، ولا يتحمل المضارب منها شيئاً، وإنما يخسر جهده وعمله.</p>
        <p>2. استثناءً مما ورد أعلاه، يضمن المضارب رأس المال ويتحمل الخسارة إذا ثبت أنها نشأت بسبب تعديه (مثل مخالفة شروط العقد) أو تقصيره (مثل الإهمال الجسيم في إدارة العمل).</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند السابع: نفقات المضاربة</h4>
        <p>للمضارب أن يخصم من رأس مال المضاربة النفقات التشغيلية المعتادة والضرورية لسير العمل، مثل تكاليف التسويق، وشراء البضائع، وأي مصاريف أخرى يتطلبها المشروع، على أن يتم توثيق جميع هذه النفقات بفواتير رسمية.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الثامن: إنهاء العقد</h4>
        <p>1. حق الإنهاء: بما أن عقد المضاربة من العقود الجائزة (غير اللازمة)، يحق لأي من الطرفين (رب المال أو المضارب) إنهاء هذا العقد بإرادته المنفردة.</p>
        <p>2. الإشعار المسبق: يلتزم الطرف الذي يرغب في الإنهاء بإخطار الطرف الآخر كتابياً قبل موعد الإنهاء بمدة لا تقل عن ثلاثة (3) أشهر، وذلك لمنع الضرر وإتاحة الوقت الكافي للتصفية.</p>
        <p>3. أسباب قد تستدعي الإنهاء: قد يلجأ أحد الأطراف لممارسة حقه في الإنهاء عند تحقق أسباب مثل:</p>
        <ul style="list-style-type: none; padding-left: 20px;">
          <li>• تغيرات جوهرية في الظروف التشغيلية أو المالية تعيق استمرار المشروع.</li>
          <li>• عدم تحقيق العوائد المستهدفة وفق الخطة التشغيلية المتفق عليها.</li>
          <li>• صدور تدخلات من رب المال تؤثر سلباً على استقلالية إدارة المضارب للمشروع.</li>
        </ul>
        <p>4. تسوية المستحقات: عند الإنهاء، يتعهد الطرفان بتصفية وتسوية كافة الالتزامات المالية القائمة بينهما قبل إنهاء العلاقة التعاقدية بشكل كامل.</p>
        <p>5. عدم المطالبة بالتعويض: لا يحق لأي طرف مطالبة الطرف الآخر بأي تعويضات عن الإنهاء ذاته، شريطة الالتزام بفترة الإشعار المسبق وإتمام عملية التصفية وتسوية المستحقات وفقاً للعقد.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند التاسع: القوة القاهرة</h4>
        <p>لا يُحمّل أي من الأطراف المسؤولية عن أي تأخير أو عدم تنفيذ لالتزاماته نتيجة لظروف قوة قاهرة. ويلتزم الأطراف بالتعاون لمواجهة آثار هذه الظروف بأفضل الطرق الممكنة.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند العاشر: شروط خاصة</h4>
        <p>1. حظر السحب: يلتزم رب المال بعدم سحب أي جزء من رأس المال قبل انقضاء 15 شهراً (خمسة عشر شهراً) من تاريخ بدء تشغيل المشروع، وذلك لضمان استقرار السيولة النقدية وتحقيق أهداف الخطة التشغيلية.</p>
        <p>2. الزكاة: يفوض رب المال المضارب بإخراج الزكاة المستحقة على رأس المال وأرباحه، على أن يقدم المضارب لرب المال ما يثبت إخراجها ومقدارها بشكل دوري.</p>
        <p>3. للمضارب أن يخصم من رأس مال المضاربة النفقات التشغيلية المعتادة والضرورية لسير العمل، مع توثيقها بفواتير رسمية.</p>
        <p>4. بالاتفاق بين الطرفين، يجوز تخصيص نسبة من الأرباح المحققة لادخارها أو إعادة استثمارها بضمها إلى رأس المال، بهدف تعزيز استقرار المشروع المالي. يتم ذلك وفقاً لخطة مالية مدروسة يوافق عليها الطرفان، مع إمكانية مراجعتها وتعديلها بالاتفاق المشترك.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الحادي عشر: حل النزاعات</h4>
        <p>في حال نشوء أي نزاع حول تفسير أو تنفيذ هذا العقد، يسعى الأطراف إلى حله ودياً. فإذا تعذر الحل الودي خلال ثلاثين يوماً، يكون الاختصاص القضائي للمحكمة المختصة في مدينة {{مدينة_العقد}} بالمملكة العربية السعودية.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الثاني عشر: القانون الحاكم</h4>
        <p>يخضع هذا العقد في تفسيره وتنفيذه وكافة جوانبه للأنظمة والقوانين المعمول بها في المملكة العربية السعودية.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #2d3748; margin-bottom: 10px;">البند الثالث عشر: أحكام عامة</h4>
        <p>1. يعتبر التمهيد (الديباجة) جزءاً لا يتجزأ من هذا العقد.</p>
        <p>2. لا يعتد بأي تعديل أو إضافة على هذا العقد ما لم يكن مكتوباً وموقعاً عليه من جميع الأطراف.</p>
        <p>3. حُرر هذا العقد من ثلاث نسخ، بيد كل طرف نسخة للعمل بموجبها.</p>
      </div>

      <div style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px;">
        <p style="text-align: center; font-weight: bold; margin-bottom: 30px;">وعلى ما ذكر أعلاه، تم التوقيع</p>
        
        <div style="display: flex; justify-content: space-around;">
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">الطرف الأول (رب المال)</p>
            <p style="margin-bottom: 5px;">الاسم: {{اسم_رب_المال}}</p>
            <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin: 10px 0; min-width: 200px;"></div>
            <p>التوقيع: ___________________</p>
            <p>التاريخ: ___________________</p>
          </div>
          
          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">الطرف الثاني (المضارب)</p>
            <p style="margin-bottom: 5px;">الاسم (1): {{اسم_المضارب_1}}</p>
            <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin: 10px 0; min-width: 200px;"></div>
            <p>التوقيع: ___________________</p>
            <p>التاريخ: ___________________</p>
          </div>

          <div style="text-align: center;">
            <p style="font-weight: bold; margin-bottom: 10px;">الطرف الثاني (المضارب)</p>
            <p style="margin-bottom: 5px;">الاسم (2): {{اسم_المضارب_2}}</p>
            <div style="height: 60px; border-bottom: 1px solid #cbd5e0; margin: 10px 0; min-width: 200px;"></div>
            <p>التوقيع: ___________________</p>
            <p>التاريخ: ___________________</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default MudarabahContract;