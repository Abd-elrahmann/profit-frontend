// components/contracts/InstallmentSettlementReceipt.jsx
import React from "react";

const InstallmentSettlementReceipt = () => {
return `
<style>
  .contract-wrapper {
    background: #f8f9fc;
    padding: 30px;
    font-family: "Manrope","Noto Sans Arabic",sans-serif;
    direction: rtl;
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
    border-bottom: 2px solid #eee;
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
    color: #111;
  }
  .sub-text {
    color: #555;
    font-size: 13px;
  }

  .grid-wrapper {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 25px;
  }

  .details-box {
    flex: 1;
    min-width: 300px;
    background: #f9fafb;
    padding: 15px;
    border-radius: 8px;
  }
  .details-box h2 {
    font-weight: bold;
    margin-bottom: 10px;
    font-size: 18px;
  }
  .row {
    display: grid;
    grid-template-columns: auto 1fr;
    border-top: 1px solid #ddd;
    padding: 8px 0;
    font-size: 14px;
  }
  .row span {
    font-weight: bold;
    color: #111;
  }

  .content-box {
    flex: 2;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .amount-box {
    text-align: center;
    border: 1px solid #eee;
    padding: 20px;
    border-radius: 8px;
  }
  .amount-box h3 {
    font-size: 18px;
    font-weight: bold;
  }
  .amount-box h1 {
    font-size: 34px;
    font-weight: 800;
    color: #1e40af;
  }
  .amount-box p {
    font-size: 15px;
    font-weight: bold;
    text-align: center;
  }

  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 25px 0 10px;
    color: #222;
  }

  .text-box {
    background: #f3f4f6;
    padding: 15px;
    border-radius: 8px;
  }
  .text-box p {
    font-size: 14px;
    color: #444;
    line-height: 2;
  }

  .separator {
    text-align: center;
    margin: 15px 0;
    font-size: 16px;
    color: #666;
    letter-spacing: 3px;
  }

  .strong {
    font-weight: bold;
    margin-top: 6px;
  }

  .signatures {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    gap: 20px;
  }
  .sign-line {
    width: 160px;
    height: 40px;
    margin: auto;
    border-bottom: 2px solid #666;
  }

  .footer-note {
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #eee;
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  @media print {
    .contract-wrapper {
      background: #fff;
      padding: 0;
    }
    .contract-container {
      border: none;
      box-shadow: none;
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
      <p class="sub-text">رقم الإشعار: {{رقم_الإشعار}}</p>
    </div>

    <div class="grid-wrapper">

      <div class="details-box">
        <h2>معلومات العميل والسلفة</h2>
        <div class="row"><p>اسم العميل:</p> <span>{{اسم_العميل}}</span></div>
        <div class="row"><p>رقم الهوية الوطنية:</p> <span>{{رقم_هوية_العميل}}</span></div>
        <div class="row"><p>سند أمر رقم:</p> <span>{{سند_أمر_رقم}}</span></div>
        <div class="row"><p>إقرار دين وتعهد بالسداد رقم:</p> <span>{{إقرار_دين_رقم}}</span></div>
        <div class="row"><p>تاريخ الإشعار:</p> <span>{{التاريخ_الميلادي}}</span></div>
        <div class="row"><p>المكان:</p> <span>{{المكان}}</span></div>
      </div>

      <div class="content-box">
        <div class="amount-box">
          <h3>المبلغ المسدد بالكامل</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>

    </div>

    <div class="section-title">نص الإشعار</div>
    <div class="text-box">
      <p>
        أُقر أنا الموقع أدناه، بأن السيد <strong>{{اسم_العميل}}</strong><br>
        رقم الهوية الوطنية: <strong>{{رقم_هوية_العميل}}</strong><br><br>
        
        قد قام بسداد كامل مبلغ السلفة الممنوحة له بموجب:<br>
        • سند أمر رقم (<strong>{{سند_أمر_رقم}}</strong>)<br>
        • إقرار دين وتعهد بالسداد رقم (<strong>{{إقرار_دين_رقم}}</strong>)<br><br>
        
        وذلك بمبلغ وقدره (<strong>{{المبلغ_كتابة}}</strong>) فقط لا غير.<br><br>
        
        وبناءً على ذلك، فقد تم استلام المبلغ كاملًا وتُعتبر هذه السلفة مقفلة نهائيًا،<br>
        ولا يترتب على السيد {{اسم_العميل}} أي التزامات مالية أخرى تخص السلفة أو السند المشار إليهما أعلاه.<br><br>
        
        ويُعد هذا الإشعار خلو طرف نهائي صادر بناءً على السداد الكامل والمطابقة مع المستندات الرسمية.
      </p>
    </div>

    <div class="separator">───────────────────────────────</div>

    <div class="signatures">
      <div>
        <p class="strong">الاسم والتوقيع:</p>
        <div class="sign-line"></div>
        <p>{{اسم_الموظف}}</p>
      </div>
      <div>
        <p class="strong">ختم المؤسسة</p>
        <div class="sign-line"></div>
        <p>{{اسم_الشركة}}</p>
      </div>
    </div>

    <div class="footer-note">
      * هذا النموذج رسمي ويُستخدم لإثبات السداد الكامل وخلو الطرف من أي التزامات مالية.
    </div>

  </div>
</div>
`;
};

export default InstallmentSettlementReceipt;