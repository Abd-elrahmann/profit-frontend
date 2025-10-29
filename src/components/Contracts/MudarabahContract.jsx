// components/contracts/MudarabahContract.jsx
import React from 'react';

const MudarabahContract = () => {
  return `
    <div class="contract-container" dir="rtl">
      <header class="contract-header">
        <div class="header-logo-section">
          <img src="/assets/images/logo.webp" alt="شعار الشركة" class="contract-logo" />
          <h1 class="contract-title">عقد مضاربة</h1>
        </div>
        <div class="contract-dates">
          <p>حرر هذا العقد في مدينة <span class="placeholder">{{مدينة_العقد}}</span></p>
          <p>بتاريخ <span class="placeholder">{{التاريخ_الهجري}}</span>هـ الموافق <span class="placeholder">{{التاريخ_الميلادي}}</span>م</p>
        </div>
      </header>

      <main>
        <!-- أطراف العقد -->
        <section class="contract-section">
          <h2 class="section-title">أطراف العقد</h2>
          <div class="parties-grid">
            <!-- الطرف الأول -->
            <div class="party-card">
              <h3 class="party-title">الطرف الأول (رب المال)</h3>
              <div class="party-details">
                <div class="detail-row">
                  <span class="detail-label">الاسم:</span>
                  <span class="detail-value placeholder">{{اسم_رب_المال}}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">رقم الهوية الوطنية:</span>
                  <span class="detail-value placeholder">{{هوية_رب_المال}}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">العنوان:</span>
                  <span class="detail-value placeholder">{{عنوان_رب_المال}}</span>
                </div>
              </div>
              <p class="party-reference">ويشار إليه في هذا العقد ب "رب المال"</p>
            </div>

            <!-- الطرف الثاني -->
            <div class="party-card">
              <h3 class="party-title">الطرف الثاني (المضاربان)</h3>
              
              <div class="sub-party">
                <h4 class="sub-party-title">المضارب الأول:</h4>
                <div class="party-details">
                  <div class="detail-row">
                    <span class="detail-label">الاسم:</span>
                    <span class="detail-value placeholder">{{اسم_المضارب_1}}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">رقم الهوية الوطنية:</span>
                    <span class="detail-value placeholder">{{هوية_المضارب_1}}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">العنوان:</span>
                    <span class="detail-value placeholder">{{عنوان_المضارب_1}}</span>
                  </div>
                </div>
              </div>

              <div class="sub-party">
                <h4 class="sub-party-title">المضارب الثاني:</h4>
                <div class="party-details">
                  <div class="detail-row">
                    <span class="detail-label">الاسم:</span>
                    <span class="detail-value placeholder">{{اسم_المضارب_2}}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">رقم الهوية الوطنية:</span>
                    <span class="detail-value placeholder">{{هوية_المضارب_2}}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">العنوان:</span>
                    <span class="detail-value placeholder">{{عنوان_المضارب_2}}</span>
                  </div>
                </div>
              </div>
              
              <p class="party-reference">ويشار إليهما مجتمعين في هذا العقد ب "المضارب"</p>
            </div>
          </div>
        </section>

        <!-- التمهيد -->
        <section class="contract-section">
          <div class="preamble-box">
            <h3 class="preamble-title">تمهيد</h3>
            <p class="preamble-text">
              لما كان رب المال يمتلك مبلغاً نقدياً ويرغب في استثماره، وكان المضارب يمتلك الخبرة والدراية في مجال التسويق والبيع،
              فقد اتفق الأطراف بكامل أهليتهم المعتبرة شرعًا ونظامًا على إبرام عقد المضاربة هذا وفقًا للشروط والبنود التالية،
              المستندة إلى أحكام الأنظمة السعودية.
            </p>
          </div>
        </section>

        <!-- بنود العقد -->
        <section class="contract-section">
          <h2 class="section-title">بنود العقد</h2>
          
          <div class="clauses-container">
            <!-- البند الأول -->
            <div class="clause">
              <h4 class="clause-title">البند الأول: موضوع العقد</h4>
              <p class="clause-text">
                يقدم رب المال للمضارب مبلغاً من المال كمضاربة، ليقوم المضارب باستثماره في أنشطة التسويق الرقمي، والبيع،
                وشراء المستلزمات اللازمة للمشروع، على أن يكون الربح الناتج مشتركاً بين الطرفين وفقًا للنسب المتفق عليها في هذا
                العقد.
              </p>
            </div>

            <!-- البند الثاني -->
            <div class="clause">
              <h4 class="clause-title">البند الثاني: رأس المال</h4>
              <div class="clause-content">
                <p>1. رأس مال المضاربة هو مبلغ وقدره <span class="placeholder">{{رأس_المال}}</span> ريال سعودي (<span class="placeholder">{{رأس_المال_كتابة}}</span>) فقط لا غير.</p>
                <p>2. يُقر رب المال بأنه قد سلّم رأس المال كاملاً للمضارب عند توقيع هذا العقد، ويُقر المضارب باستلامه للمبلغ،
                ويعتبر توقيع الطرفين على هذا العقد بمثابة إيصال استلام.</p>
              </div>
            </div>

            <!-- البند الثالث -->
            <div class="clause">
              <h4 class="clause-title">البند الثالث: طبيعة العمل</h4>
              <div class="clause-content">
                <p>1. تُعتبر هذه المضاربة مضاربة مقيدة، حيث يقتصر عمل المضارب على الأنشطة المذكورة في البند الأول من هذا العقد.</p>
                <p>2. يلتزم المضارب ببذل عناية الشخص المعتاد في إدارة أموال المضاربة والمحافظة عليها.</p>
                <p>3. يُقر المضارب بأنه يعمل بشكل مشترك ومتضامن في إدارة هذه المضاربة، ويكونان مسؤولين بالتضامن تجاه رب المال عن أي التزامات تنشأ عن تعدٍ أو تقصير أو مخالفة لشروط العقد.</p>
              </div>
            </div>

            <!-- البند الرابع -->
            <div class="clause">
              <h4 class="clause-title">البند الرابع: مدة العقد</h4>
              <p class="clause-text">
                مدة هذا العقد سنتان ميلاديتان كاملتان، تبدأ من تاريخ توقيعه. لا يتم تجديد العقد تلقائياً، ويتطلب تجديده اتفاقاً كتابياً جديداً بين الأطراف.
              </p>
            </div>

            <!-- البند الخامس -->
            <div class="clause">
              <h4 class="clause-title">البند الخامس: قسمة الأرباح</h4>
              <div class="clause-content">
                <p>1. يتم توزيع صافي الأرباح الناتجة عن المضاربة (وهو ما زاد على رأس المال بعد خصم المصاريف التشغيلية) وفقاً للنسب التالية:</p>
                <ul class="clause-list">
                  <li><span class="percentage">75%</span> خمسة وسبعون بالمائة لرب المال.</li>
                  <li><span class="percentage">25%</span> خمسة وعشرون بالمائة للمضارب، وتُقسم هذه النسبة بين الشريكين المضاربين بالتساوي (12.5% لكل منهما).</li>
                </ul>
                <p>2. يتم تقييم أصول المشروع وتحديد الأرباح بشكل دوري (ربع سنوي/نصف سنوي/سنوي) بناءً على تقارير مالية يقدمها المضارب.</p>
              </div>
            </div>

            <!-- البند السادس -->
            <div class="clause">
              <h4 class="clause-title">البند السادس: الخسارة</h4>
              <div class="clause-content">
                <p>1. في حال حدوث خسارة مالية، يتحملها رب المال وحده وتُخصم من رأس مال المضاربة، ولا يتحمل المضارب منها شيئاً، وإنما يخسر جهده وعمله.</p>
                <p>2. استثناءً مما ورد أعلاه، يضمن المضارب رأس المال ويتحمل الخسارة إذا ثبت أنها نشأت بسبب تعديه (مثل مخالفة شروط العقد) أو تقصيره (مثل الإهمال الجسيم في إدارة العمل).</p>
              </div>
            </div>

            <!-- البند السابع -->
            <div class="clause">
              <h4 class="clause-title">البند السابع: نفقات المضاربة</h4>
              <p class="clause-text">
                للمضارب أن يخصم من رأس مال المضاربة النفقات التشغيلية المعتادة والضرورية لسير العمل، مثل تكاليف التسويق، وشراء البضائع، وأي مصاريف أخرى يتطلبها المشروع، على أن يتم توثيق جميع هذه النفقات بفواتير رسمية.
              </p>
            </div>

            <!-- البند الثامن -->
            <div class="clause">
              <h4 class="clause-title">البند الثامن: إنهاء العقد</h4>
              <div class="clause-content">
                <p>1. <strong>حق الإنهاء:</strong> بما أن عقد المضاربة من العقود الجائزة (غير اللازمة)، يحق لأي من الطرفين (رب المال أو المضارب) إنهاء هذا العقد بإرادته المنفردة.</p>
                <p>2. <strong>الإشعار المسبق:</strong> يلتزم الطرف الذي يرغب في الإنهاء بإخطار الطرف الآخر كتابياً قبل موعد الإنهاء بمدة لا تقل عن ثلاثة (3) أشهر، وذلك لمنع الضرر وإتاحة الوقت الكافي للتصفية.</p>
                <p>3. <strong>أسباب قد تستدعي الإنهاء:</strong> قد يلجأ أحد الأطراف لممارسة حقه في الإنهاء عند تحقق أسباب مثل:</p>
                <ul class="clause-list">
                  <li>تغيرات جوهرية في الظروف التشغيلية أو المالية تعيق استمرار المشروع.</li>
                  <li>عدم تحقيق العوائد المستهدفة وفق الخطة التشغيلية المتفق عليها.</li>
                  <li>صدور تدخلات من رب المال تؤثر سلباً على استقلالية إدارة المضارب للمشروع.</li>
                </ul>
                <p>4. <strong>تسوية المستحقات:</strong> عند الإنهاء، يتعهد الطرفان بتصفية وتسوية كافة الالتزامات المالية القائمة بينهما قبل إنهاء العلاقة التعاقدية بشكل كامل.</p>
                <p>5. <strong>عدم المطالبة بالتعويض:</strong> لا يحق لأي طرف مطالبة الطرف الآخر بأي تعويضات عن الإنهاء ذاته، شريطة الالتزام بفترة الإشعار المسبق وإتمام عملية التصفية وتسوية المستحقات وفقاً للعقد.</p>
              </div>
            </div>

            <!-- البند التاسع -->
            <div class="clause">
              <h4 class="clause-title">البند التاسع: القوة القاهرة</h4>
              <p class="clause-text">
                لا يُحمّل أي من الأطراف المسؤولية عن أي تأخير أو عدم تنفيذ لالتزاماته نتيجة لظروف قوة قاهرة. ويلتزم الأطراف بالتعاون لمواجهة آثار هذه الظروف بأفضل الطرق الممكنة.
              </p>
            </div>

            <!-- البند العاشر -->
            <div class="clause">
              <h4 class="clause-title">البند العاشر: شروط خاصة</h4>
              <div class="clause-content">
                <p>1. <strong>حظر السحب:</strong> يلتزم رب المال بعدم سحب أي جزء من رأس المال قبل انقضاء 15 شهراً (خمسة عشر شهراً) من تاريخ بدء تشغيل المشروع، وذلك لضمان استقرار السيولة النقدية وتحقيق أهداف الخطة التشغيلية.</p>
                <p>2. <strong>الزكاة:</strong> يفوض رب المال المضارب بإخراج الزكاة المستحقة على رأس المال وأرباحه، على أن يقدم المضارب لرب المال ما يثبت إخراجها ومقدارها بشكل دوري.</p>
                <p>3. للمضارب أن يخصم من رأس مال المضاربة النفقات التشغيلية المعتادة والضرورية لسير العمل، مع توثيقها بفواتير رسمية.</p>
                <p>4. بالاتفاق بين الطرفين، يجوز تخصيص نسبة من الأرباح المحققة لادخارها أو إعادة استثمارها بضمها إلى رأس المال، بهدف تعزيز استقرار المشروع المالي. يتم ذلك وفقاً لخطة مالية مدروسة يوافق عليها الطرفان، مع إمكانية مراجعتها وتعديلها بالاتفاق المشترك.</p>
              </div>
            </div>

            <!-- البند الحادي عشر -->
            <div class="clause">
              <h4 class="clause-title">البند الحادي عشر: حل النزاعات</h4>
              <p class="clause-text">
                في حال نشوء أي نزاع حول تفسير أو تنفيذ هذا العقد، يسعى الأطراف إلى حله ودياً. فإذا تعذر الحل الودي خلال ثلاثين يوماً، يكون الاختصاص القضائي للمحكمة المختصة في مدينة <span class="placeholder">{{مدينة_العقد}}</span> بالمملكة العربية السعودية.
              </p>
            </div>

            <!-- البند الثاني عشر -->
            <div class="clause">
              <h4 class="clause-title">البند الثاني عشر: القانون الحاكم</h4>
              <p class="clause-text">
                يخضع هذا العقد في تفسيره وتنفيذه وكافة جوانبه للأنظمة والقوانين المعمول بها في المملكة العربية السعودية.
              </p>
            </div>

            <!-- البند الثالث عشر -->
            <div class="clause">
              <h4 class="clause-title">البند الثالث عشر: أحكام عامة</h4>
              <div class="clause-content">
                <p>1. يعتبر التمهيد (الديباجة) جزءاً لا يتجزأ من هذا العقد.</p>
                <p>2. لا يعتد بأي تعديل أو إضافة على هذا العقد ما لم يكن مكتوباً وموقعاً عليه من جميع الأطراف.</p>
                <p>3. حُرر هذا العقد من ثلاث نسخ، بيد كل طرف نسخة للعمل بموجبها.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- التوقيعات -->
        <section class="signatures-section">
          <div class="signatures-header">
            <h3 class="signatures-title">وعلى ما ذكر أعلاه، تم التوقيع</h3>
          </div>
          
          <div class="signatures-grid">
            <!-- توقيع رب المال -->
            <div class="signature-box">
              <h4 class="signature-party">الطرف الأول (رب المال)</h4>
              <div class="signature-details">
                <p class="signature-name">الاسم: <span class="placeholder">{{اسم_رب_المال}}</span></p>
              </div>
              <div class="signature-line"></div>
              <div class="signature-fields">
                <p>التوقيع: ___________________</p>
                <p>التاريخ: ___________________</p>
              </div>
            </div>

            <!-- توقيع المضارب الأول -->
            <div class="signature-box">
              <h4 class="signature-party">الطرف الثاني (المضارب)</h4>
              <div class="signature-details">
                <p class="signature-name">الاسم (1): <span class="placeholder">{{اسم_المضارب_1}}</span></p>
              </div>
              <div class="signature-line"></div>
              <div class="signature-fields">
                <p>التوقيع: ___________________</p>
                <p>التاريخ: ___________________</p>
              </div>
            </div>

            <!-- توقيع المضارب الثاني -->
            <div class="signature-box">
              <h4 class="signature-party">الطرف الثاني (المضارب)</h4>
              <div class="signature-details">
                <p class="signature-name">الاسم (2): <span class="placeholder">{{اسم_المضارب_2}}</span></p>
              </div>
              <div class="signature-line"></div>
              <div class="signature-fields">
                <p>التوقيع: ___________________</p>
                <p>التاريخ: ___________________</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>
        .contract-container {
          max-width: 100%;
          font-family: 'Noto Sans Arabic', 'Cairo', 'Segoe UI', sans-serif;
          line-height: 1.8;
          color: #374151;
          background: #ffffff;
          padding: 2rem;
        }

        .contract-header {
          text-align: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
        }

        .header-logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .contract-logo {
          max-width: 120px;
          max-height: 120px;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .contract-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .contract-dates {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .contract-dates p {
          margin: 0.25rem 0;
        }

        .contract-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #1e40af;
          width: fit-content;
        }

        .parties-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .parties-grid {
            grid-template-columns: 1fr;
          }
        }

        .party-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .party-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #d1d5db;
        }

        .sub-party {
          margin-bottom: 1.5rem;
        }

        .sub-party:last-child {
          margin-bottom: 0;
        }

        .sub-party-title {
          font-size: 1rem;
          font-weight: 600;
          color: #4b5563;
          margin-bottom: 0.75rem;
        }

        .party-details {
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .detail-label {
          font-weight: 600;
          color: #4b5563;
          min-width: 120px;
        }

        .detail-value {
          flex: 1;
          text-align: left;
        }

        .party-reference {
          font-style: italic;
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 1rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .preamble-box {
          background: #f0f4ff;
          padding: 1.5rem;
          border-radius: 0.75rem;
          border-left: 4px solid #1e40af;
        }

        .preamble-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1rem;
        }

        .preamble-text {
          color: #4b5563;
          line-height: 1.8;
        }

        .clauses-container {
          space-y: 1.5rem;
        }

        .clause {
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .clause:last-child {
          margin-bottom: 0;
        }

        .clause-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .clause-text {
          color: #4b5563;
          line-height: 1.8;
        }

        .clause-content {
          color: #4b5563;
          line-height: 1.8;
        }

        .clause-content p {
          margin-bottom: 0.75rem;
        }

        .clause-content p:last-child {
          margin-bottom: 0;
        }

        .clause-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }

        .clause-list li {
          padding: 0.5rem 0;
          padding-right: 1.5rem;
          position: relative;
          border-bottom: 1px solid #f3f4f6;
        }

        .clause-list li:before {
          content: "•";
          color: #1e40af;
          font-weight: bold;
          position: absolute;
          right: 0;
        }

        .clause-list li:last-child {
          border-bottom: none;
        }

        .percentage {
          display: inline-block;
          background: #1e40af;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .signatures-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #e5e7eb;
        }

        .signatures-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .signatures-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        .signatures-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        @media (max-width: 768px) {
          .signatures-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .signature-box {
          text-align: center;
          padding: 1.5rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .signature-party {
          font-size: 1.125rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 1rem;
        }

        .signature-details {
          margin-bottom: 1.5rem;
        }

        .signature-name {
          color: #4b5563;
          font-size: 0.9rem;
        }

        .signature-line {
          height: 1px;
          background: #cbd5e0;
          margin: 1rem 0;
        }

        .signature-fields {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .signature-fields p {
          margin: 0.5rem 0;
        }

        .placeholder {
          color: #1e40af;
          font-weight: 500;
          background: rgba(30, 64, 175, 0.05);
          padding: 0.125rem 0.5rem;
          border-radius: 0.25rem;
          border: 1px dashed rgba(30, 64, 175, 0.3);
        }

        /* تحسينات للطباعة */
        @media print {
          .contract-container {
            padding: 0;
            box-shadow: none;
          }
          
          .party-card,
          .clause,
          .signature-box {
            box-shadow: none;
            border: 1px solid #000;
          }
          
          .placeholder {
            background: transparent;
            border: 1px dashed #000;
          }

          .contract-logo {
            max-width: 100px;
            max-height: 100px;
            box-shadow: none;
            border: 1px solid #ddd;
          }

          .header-logo-section {
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .contract-title {
            text-shadow: none;
          }
        }
      </style>
    </div>
  `;
};

export default MudarabahContract;