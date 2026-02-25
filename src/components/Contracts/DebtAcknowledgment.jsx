
import React from "react";

const DebtAcknowledgment = () => {
return `
<style>
  * {
    box-sizing: border-box;
    word-spacing: normal;
    letter-spacing: normal;
  }

  .contract-wrapper {
    background: #f8f9fc;
    padding: 15px;
    font-family: "Cairo", "Tajawal", "Noto Sans Arabic", sans-serif;
    direction: rtl;
    text-align: right;
    width: 100%;
  }

  .contract-container {
    max-width: 100%;
    margin: 0 auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 25px;
    width: 100%;
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
    margin-bottom: 20px;
    align-items: start;
  }

  .details-box {
    background: rgba(46, 139, 69, 0.05);
    padding: 20px;
    border-radius: 8px;
    height: fit-content;
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
    gap: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    word-spacing: normal;
    letter-spacing: normal;
  }

  .row-vertical {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #ddd;
    padding: 5px 0;
    font-size: 14px;
    word-spacing: normal;
    letter-spacing: normal;
  }
  .row-vertical p {
    margin: 0 0 10px 0;
    font-weight: normal;
    color: #666;
  }
  .row-vertical span {
    font-weight: bold;
    color: #111;
    margin-left: 0;
  }

  .content-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-start;
  }

  .amount-box {
    text-align: center;
    border: 1px solid rgba(46, 139, 69, 0.2);
    padding: 20px;
    border-radius: 8px;
    background: rgba(46, 139, 69, 0.02);
    margin: 0;
    height: fit-content;
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
    font-size: 32px;
    font-weight: 800;
    color: #2E8B45;
    margin: 10px 0;
    line-height: 1.3;
  }
  .amount-box p {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }

  .text-box {
    background: rgba(46, 139, 69, 0.03);
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.1);
    margin-top: 15px;
  }
  .text-box h3 {
    color: #2E8B45;
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
    gap: 12px;
  }
  .strong {
    font-weight: bold;
    margin-top: 6px;
    gap: 12px;
  }
  .spacer {
    display: inline-block;
    width: 15px;
  }

  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    justify-content: center;
  }
  .sign-line {
    width: 180px;
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
      gap: 15px;
    }
  }

  @media print {
    @page {
      size: A4;
      margin: 15mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .contract-wrapper {
      background: white;
      padding: 0;
      margin: 0;
    }

    .contract-container {
      border: 1px solid #ddd;
      border-radius: 12px;
      box-shadow: none;
      padding: 25px;
      margin: 0;
      page-break-inside: avoid;
    }

    .grid-wrapper {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 20px !important;
      align-items: start !important;
      page-break-inside: avoid;
    }

    .details-box, .amount-box {
      page-break-inside: avoid;
    }

    * {
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }
  }
</style>

<div class="contract-wrapper">
  <div class="contract-container">

    <div class="header">
      <div class="header-left">
        <span class="icon">✔</span>
        <p class="title">إقرار دين وتعهد بالسداد</p>
      </div>
      <p class="sub-text">رقم الإقرار: {{رقم_الإقرار}}</p>
    </div>

    <div class="grid-wrapper">

      <div class="details-box">
        <h2>تفاصيل الإقرار</h2>
        <div class="row"><p>أقر أنا السيد:</p> <span>{{اسم_العميل}}</span></div>
        <div class="row"><p>حامل هوية رقم:</p> <span>{{رقم_هوية_العميل}}</span></div>
        <div class="row"><p>مكان إقامتي:</p> <span>{{عنوان_العميل}}</span></div>
        <div class="row-vertical"><p>أنني قد استلمت من السيد:</p> <span>{{اسم_الدائن}}</span></div>
      </div>

      <div class="content-box">
        <div class="amount-box">
          <h3>مبلغ وقدره</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>

    </div> <!-- نهاية grid-wrapper -->

    <div class="text-box" style="margin-top: 25px;">
      <h3 style="margin-bottom:10px; font-weight:bold; color: #2E8B45;">نص الإقرار</h3>
     <p style="line-height: 1.6; word-spacing: normal; letter-spacing: normal; text-align: justify;">
  وأقر أنني قد استلمت هذا المبلغ على شكل دين يتم سداده على فترة من الزمن، وأتحمل كافة المسؤوليات وجميع
  العواقب القانونية والجنائية، وفي حالة أنني لم أقم بسداد المبلغ فإني أقوم بإسقاط حقوقي في التزوير أو التكذيب أو التنكير،
  وأتعهد بحلف اليمين في حالة التشكيك في الوثيقة. وعلى هذا الاتفاق فإني أوافق وأوقع على الوثيقة.
</p>

      <p class="strong">اسم المدين:<span class="spacer"></span>{{اسم_العميل}}</p>
      <p class="strong">التاريخ الهجري:<span class="spacer"></span>{{التاريخ_الهجري}} — الميلادي:<span class="spacer"></span>{{التاريخ_الميلادي}}</p>
    </div>

    <div class="signatures">
      <div>
        <p class="strong">توقيع الدائن</p>
        <div class="sign-line"></div>
        <p>{{اسم_الدائن}}</p>
      </div>
      <div>
        <p class="strong">توقيع المدين</p>
        <div class="sign-line"></div>
        <p>{{اسم_العميل}}</p>
      </div>
    </div>

  </div>
</div>
`;
};

export default DebtAcknowledgment;