// components/Contracts/MudarabahContract.jsx
import React from 'react';

const MudarabahContract = () => {
  return `
<style>
  * {
    word-spacing: normal;
    letter-spacing: normal;
  }

  .contract-wrapper {
    background: #f8f9fc;
    padding: 15px;
    font-family: "Cairo", "Tajawal", "Noto Sans Arabic", sans-serif;
    direction: rtl;
    text-align: right;
  }

  .contract-container {
    max-width: 900px;
    margin: auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .contract-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
    padding-bottom: 8px;
    margin-bottom: 15px;
    page-break-inside: avoid;
  }

  .header-left {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .contract-logo {
    max-width: 40px;
    max-height: 40px;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
  }

  .contract-title {
    font-size: 24px;
    font-weight: bold;
    color: #2e7d32;
  }

  .contract-dates {
    font-size: 14px;
    color: #555;
    text-align: left;
  }

  .contract-dates p {
    margin: 5px 0;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin: 20px 0 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
  }

  /* إجبار بدء صفحة جديدة عند بنود العقد */
  .clauses-section {
    page-break-before: always !important;
    page-break-inside: avoid !important;
  }

  .clauses-container {
    page-break-inside: avoid;
  }

  .parties-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
    page-break-inside: avoid;
  }

  .party-card {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
    page-break-inside: avoid;
  }

  .party-title {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
  }

  .sub-party {
    margin-bottom: 20px;
    page-break-inside: avoid;
  }

  .sub-party:last-child {
    margin-bottom: 0;
  }

  .sub-party-title {
    font-size: 16px;
    font-weight: bold;
    color: #4a4a4a;
    margin-bottom: 10px;
    padding-right: 10px;
  }

  .party-details {
    margin-bottom: 15px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(46, 139, 69, 0.1);
    page-break-inside: avoid;
  }

  .detail-label {
    color: #666;
    font-weight: 500;
    font-size: 14px;
    min-width: 120px;
  }

  .detail-value {
    color: #111;
    font-weight: bold;
    font-size: 14px;
    text-align: left;
    flex: 1;
  }

  .party-reference {
    color: #777;
    font-size: 13px;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid rgba(46, 139, 69, 0.2);
  }

  .preamble-box {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
    margin-bottom: 30px;
    page-break-inside: avoid;
    page-break-after: avoid !important;
  }

  .preamble-title {
    font-size: 18px;
    font-weight: bold;
    color: #000;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
  }

  .preamble-text {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
    text-align: justify;
  }

  .clause {
    background: #ffffff;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
    margin-bottom: 20px;
    page-break-inside: avoid;
  }

  .clause:last-child {
    margin-bottom: 10px; /* تقليل المسافة لتكون التوقيعات قريبة */
  }

  .clause-title {
    font-size: 16px;
    font-weight: bold;
    color: #2e7d32;
    margin-bottom: 15px;
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    border-bottom: 1px solid rgba(46, 139, 69, 0.2);
  }

  .clause-content {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
  }

  .clause-content p {
    margin-bottom: 10px;
    page-break-inside: avoid;
  }

  .clause-content p:last-child {
    margin-bottom: 0;
  }

  .clause-text {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
  }

  .clause-list {
    list-style: none;
    padding: 0;
    margin: 15px 0;
    page-break-inside: avoid;
  }

  .clause-list li {
    padding: 8px 0;
    padding-right: 25px;
    position: relative;
    border-bottom: 1px solid rgba(46, 139, 69, 0.1);
    page-break-inside: avoid;
  }

  .clause-list li:before {
    content: "•";
    color: #2E8B45;
    font-weight: bold;
    font-size: 20px;
    position: absolute;
    right: 0;
    top: 5px;
  }

  .clause-list li:last-child {
    border-bottom: none;
  }

  .percentage {
    display: inline-block;
    background: #2E8B45;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    margin-left: 5px;
  }

  .placeholder {
    color: #2E8B45;
    font-weight: 600;
    background: rgba(46, 139, 69, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(46, 139, 69, 0.3);
  }

  .clause-content strong {
    color: #2E8B45 !important;
  }

  /* تحسينات قسم التوقيعات - بدون صفحة جديدة */
  .signatures-section {
    margin-top: 30px; /* تقليل المسافة */
    padding-top: 20px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    page-break-inside: avoid;
    /* تم إزالة page-break-before: always */
  }

  .signatures-header {
    text-align: center;
    margin-bottom: 20px; /* تقليل المسافة */
    page-break-inside: avoid;
  }

  .signatures-title {
    font-size: 18px;
    font-weight: bold;
    color: #2e7d32;
  }

  .signatures-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 25px; /* تقليل المسافة */
    margin-bottom: 15px; /* تقليل المسافة */
    page-break-inside: avoid;
  }

  /* إزالة البوكس والحدود من التوقيعات */
  .signature-box {
    text-align: center;
    padding: 0;
    background: transparent;
    border: none;
    page-break-inside: avoid;
  }

  .signature-party {
    font-size: 16px;
    font-weight: bold;
    color: #000;
    margin-bottom: 15px; /* تقليل المسافة */
  }

  .signature-details {
    margin-bottom: 15px; /* تقليل المسافة */
    page-break-inside: avoid;
  }

  .signature-name {
    color: #555;
    font-size: 15px;
    margin-top: 15px; /* تقليل المسافة */
    margin-bottom: 20px; /* تقليل المسافة */
    font-weight: 600;
  }

  .signature-line {
    width: 80%;
    height: 1px;
    background: #222;
    margin: 20px auto; /* تقليل المسافة */
  }

  .signature-fields {
    color: #666;
    font-size: 14px;
    margin-top: 20px; /* تقليل المسافة */
  }

  .signature-fields p {
    margin: 8px 0; /* تقليل المسافة */
  }

  .english-number {
    font-family: 'Arial', sans-serif;
    direction: ltr;
    unicode-bidi: embed;
  }

  @media (max-width: 768px) {
    .parties-grid,
    .signatures-grid {
      grid-template-columns: 1fr;
    }
    
    .contract-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }
    
    .contract-dates {
      text-align: right;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }

    .contract-wrapper {
      background: #fff !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    .contract-container {
      margin: 0 auto !important;
      padding: 15mm !important;
      box-shadow: none !important;
      border: none !important;
      width: 100% !important;
      max-width: 180mm !important;
      background: #fff !important;
    }
    
    * {
      word-wrap: break-word !important;
      overflow-wrap: break-word !important;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    /* إجبار بدء صفحة جديدة عند بنود العقد في الطباعة */
    .clauses-section {
      page-break-before: always !important;
      break-before: page !important;
    }
    
    /* منع انقسام التمهيد عن البنود */
    .preamble-box {
      page-break-after: avoid !important;
    }
    
    /* إزالة بدء صفحة جديدة للتوقيعات في الطباعة */
    .signatures-section {
      /* تم إزالة page-break-before: always */
      page-break-inside: avoid !important;
    }
    
    /* منع انقسام العناصر بين الصفحات */
    .contract-header,
    .section-title,
    .party-card,
    .preamble-box,
    .clause,
    .signature-box {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    /* تقليل المسافات في الطباعة */
    .parties-grid {
      margin-bottom: 10px;
    }
    
    .party-card {
      padding: 15px;
    }
    
    .clause {
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .clause:last-child {
      margin-bottom: 10px !important;
    }
    
    .preamble-box {
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .signatures-grid {
      gap: 15px;
      margin-bottom: 10px;
    }
    
    .signatures-section {
      margin-top: 15px !important;
      padding-top: 15px !important;
    }
    
    /* منع انقسام الفقرات */
    .clause-content p,
    .preamble-text,
    .clause-text,
    .party-reference {
      orphans: 3;
      widows: 3;
      page-break-inside: avoid;
    }
    
    /* تحسين عرض القوائم */
    .clause-list li {
      page-break-inside: avoid;
    }
    
    /* إصلاح مشكلة الحدود في الطباعة */
    .detail-row,
    .clause-list li,
    .signature-line {
      border-color: #000 !important;
    }
    
    /* إزالة البوكس والحدود من التوقيعات في الطباعة */
    .signature-box {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }
    
    .percentage {
      background: #2E8B45 !important;
      color: white !important;
    }
    
    .placeholder {
      background: transparent !important;
      border: 1px dashed #000 !important;
      color: #000 !important;
    }
    
    /* الألوان في الطباعة */
    .section-title,
    .party-title,
    .preamble-title,
    .signature-party {
      color: #000 !important;
    }

    .clause-title {
      color: #2e7d32 !important;
    }

    .contract-title {
      color: #2e7d32 !important;
    }

    .signatures-title {
      color: #2e7d32 !important;
    }
    
    .clause-content strong {
      color: #2E8B45 !important;
    }
    
    /* تحسين التوقيعات في الطباعة */
    .signature-name {
      color: #000 !important;
      font-weight: 700 !important;
    }
    
    .signature-line {
      width: 80% !important;
      background: #000 !important;
      height: 1px !important;
    }
    
    /* منع انقسام آخر بند عن التوقيعات */
    .clause:last-child {
      page-break-after: avoid !important;
    }
    
    .signatures-section {
      page-break-before: avoid !important;
    }
  }
</style>

<div class="contract-wrapper">
  <div class="contract-container">
    
    <!-- Header -->
    <div class="contract-header">
      <div class="header-left">
        <img src="/assets/images/logo.webp" alt="شعار الشركة" class="contract-logo" />
        <h1 class="contract-title">عقد مضاربة</h1>
      </div>
      <div class="contract-dates">
        <p>حرر هذا العقد في مدينة <span class="placeholder">{{مدينة_العقد_الثابتة}}</span></p>
        <p>بتاريخ <span class="placeholder">{{التاريخ_الهجري}}</span> الموافق <span class="placeholder">{{التاريخ_الميلادي}}</span></p>
      </div>
    </div>

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
          <h3 class="party-title">الطرف الثاني (المضاربون)</h3>
          
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

    <!-- بنود العقد - إجبار بدء صفحة جديدة -->
    <section class="contract-section clauses-section">
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
            <p>1. رأس مال المضاربة هو مبلغ وقدره <span class="placeholder english-number">{{رأس_المال}}</span> ريال سعودي (<span class="placeholder">{{رأس_المال_كتابة}}</span>) فقط لا غير.</p>
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
              <li><span class="percentage">{{نسبة_أرباح_المستثمر}}%</span> لـ {{اسم_رب_المال_النسبة}}.</li>
              <li><span class="percentage">{{نسبة_أرباح_المنشأة}}%</span> للمضارب، وتُقسم هذه النسبة بين الشريكين المضاربين بالتساوي ({{نسبة_أرباح_المنشأة_مقسمة}}% لكل منهما).</li>
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

    <!-- التوقيعات - مباشرة تحت آخر بند -->
    <section class="signatures-section">
      <div class="signatures-header">
        <h3 class="signatures-title">وعلى ما ذكر أعلاه، تم التوقيع</h3>
      </div>
      
      <div class="signatures-grid">
        <!-- توقيع رب المال -->
        <div class="signature-box">
          <h4 class="signature-party">الطرف الأول (رب المال)</h4>
          <div class="signature-details">
            <p class="signature-name">{{اسم_رب_المال}}</p>
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
            <p class="signature-name">{{اسم_المضارب_1}}</p>
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
            <p class="signature-name">{{اسم_المضارب_2}}</p>
          </div>
          <div class="signature-line"></div>
          <div class="signature-fields">
            <p>التوقيع: ___________________</p>
            <p>التاريخ: ___________________</p>
          </div>
        </div>
      </div>
    </section>
    
  </div>
</div>
`;
};

export default MudarabahContract;