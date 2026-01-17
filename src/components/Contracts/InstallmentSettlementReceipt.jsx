// components/contracts/InstallmentSettlementReceipt.jsx
import React from "react";

const InstallmentSettlementReceipt = () => {
return `
<style>
  .contract-wrapper {
    background: #f8f9fc;
    padding: 30px;
    font-family: "Cairo", "Tajawal", "Noto Sans Arabic", sans-serif;
    direction: rtl;
    text-align: right;
  }
  * {
    word-spacing: normal;
    letter-spacing: normal;
  }

  .contract-container {
    max-width: 900px;
    margin: auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 30px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .icon {
    font-size: 28px;
    color: #d4af37;
  }
  .title {
    font-size: 22px;
    font-weight: bold;
    color: #2E8B45;
  }
  .sub-text {
    color: #555;
    font-size: 10px;
    white-space: nowrap;
  }

  .grid-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 15px;
  }

  .details-box {
    background: rgba(46, 139, 69, 0.05);
    padding: 15px;
    border-radius: 8px;
  }
  .details-box h2 {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 18px;
    color: #2E8B45;
  }
  .row {
    display: grid;
    grid-template-columns: auto 1fr;
    border-top: 1px solid #ddd;
    padding: 5px 0;
    font-size: 14px;
    word-spacing: normal;
    letter-spacing: normal;
    gap: 25px;
  }
  .row span {
    font-weight: bold;
    color: #111;
    word-spacing: normal;
    letter-spacing: normal;
  }

  .content-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .amount-box {
    text-align: center;
    border: 1px solid rgba(46, 139, 69, 0.2);
    padding: 15px;
    border-radius: 8px;
    background: rgba(46, 139, 69, 0.02);
  }
  .amount-box h3 {
    font-size: 16px;
    font-weight: bold;
    color: #2E8B45;
    background: #e5e7eb;
    padding: 6px 10px;
    border-radius: 6px;
    margin-top: 0;
    margin-bottom: 10px;
  }
  .amount-box h1 {
    font-size: 30px;
    font-weight: 800;
    color: #2E8B45;
    margin: 6px 0;
  }
  .amount-box p {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 15px 0 10px;
    color: #2E8B45;
    background: rgba(46, 139, 69, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
  }

  .text-box {
    background: rgba(46, 139, 69, 0.03);
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.1);
  }
  .text-box p {
    font-size: 14px;
    color: #444;
    line-height: 1.6;
    word-spacing: normal;
    letter-spacing: normal;
    text-align: justify;
  }

  .strong {
    font-weight: bold;
    margin-top: 6px;
  }
  .highlight-text {
    font-weight: bold;
    color: #2E8B45;
  }

  .signatures {
    display: grid;
    grid-template-columns: 1fr;
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    gap: 20px;
  }
  .sign-line {
    width: 160px;
    height: 40px;
    margin: auto;
    border-bottom: 2px solid #666;
  }

  @media (max-width: 768px) {
    .grid-wrapper {
      grid-template-columns: 1fr;
    }
    .signatures {
      grid-template-columns: 1fr;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }

    .contract-wrapper {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .contract-container {
      margin: 0 !important;
      padding: 20px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-shadow: none !important;
      border: none !important;
      background: #fff !important;
    }

    .grid-wrapper {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
    }

    /* منع أي انقسام للصفحات داخل المحتوى */
    .details-box,
    .content-box,
    .text-box,
    .signatures {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* ضبط أقصى ارتفاع ليكون صفحة واحدة فقط */
    * {
      max-height: none !important;
      overflow: visible !important;
    }

    /* ضمان التمركز والعرض الصحيح */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
  }
</style>

<div class="contract-wrapper">
  <div class="contract-container">

    <div class="header">
      <div class="header-left">
        <span class="icon">✔</span>
        <p class="title">إشعار تسوية سلفة وخلو طرف</p>
      </div>
      <p class="sub-text">{{التاريخ_الميلادي}}</p>
    </div>

    <div class="grid-wrapper">

      <div class="details-box">
        <h2>معلومات العميل والسلفة</h2>
        <div class="row"><p>اسم العميل:</p> <span>{{اسم_العميل}}</span></div>
        <div class="row"><p>رقم الهوية الوطنية:</p> <span>{{رقم_هوية_العميل}}</span></div>
        <div class="row"><p>تاريخ الإشعار:</p> <span>{{التاريخ_الميلادي}}</span></div>
        <div class="row"><p>المكان:</p> <span>الرياض</span></div>
      </div>

      <div class="content-box">
        <div class="amount-box">
          <h3>المبلغ المسدد بالكامل</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>

    </div>

    <div class="text-box">
      <p>
        أُقر أنا الموقع أدناه، بأن السيد <span class="highlight-text">{{اسم_العميل}}</span> رقم الهوية الوطنية: <span class="highlight-text">{{رقم_هوية_العميل}}</span> قد قام بسداد كامل مبلغ السلفة الممنوحة له بموجب: • سند أمر رقم (<span class="highlight-text">{{رقم_السند}}</span>) • إقرار دين وتعهد بالسداد رقم (<span class="highlight-text">{{رقم_الإقرار}}</span>) وذلك بمبلغ وقدره (<span class="highlight-text">{{المبلغ_كتابة}}</span>) فقط لا غير. وبناءً على ذلك، فقد تم استلام المبلغ كاملًا وتُعتبر هذه السلفة مقفلة نهائيًا، ولا يترتب على السيد {{اسم_العميل}} أي التزامات مالية أخرى تخص السلفة أو السند المشار إليهما أعلاه. ويُعد هذا الإشعار خلو طرف نهائي صادر بناءً على السداد الكامل والمطابقة مع المستندات الرسمية.
      </p>
    </div>

    <div class="signatures">
      <div>
        <p class="strong">توقيع الدائن:</p>
        <div class="sign-line"></div>
        <p>{{توقيع_الدائن}}</p>
      </div>
    </div>

  </div>
</div>
`;
};

export default InstallmentSettlementReceipt;