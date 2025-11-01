// components/contracts/PromissoryNote.jsx
import React from "react";

const PromissoryNote = () => {
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

  .info-box {
    background: #f9fafb;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
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

  .strong {
    font-weight: bold;
    margin-top: 6px;
  }

  .signatures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }
  .sign-line {
    width: 160px;
    height: 40px;
    margin: auto;
    border-bottom: 2px solid #666;
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
        <p class="title">سند لأمر</p>
      </div>
      <p class="sub-text">رقم السند: {{رقم_السند}}</p>
    </div>

    <div class="grid-wrapper">

      <div class="details-box">
        <h2>تفاصيل السند</h2>
        <div class="row"><p>تاريخ الإنشاء:</p> <span>{{التاريخ_الهجري}} هـ الموافق {{التاريخ_الميلادي}}</span></div>
        <div class="row"><p>تاريخ الاستحقاق:</p> <span>لدى الاطلاع</span></div>
        <div class="row"><p>مدينة الإصدار:</p> <span>شرورة - المملكة العربية السعودية</span></div>
        <div class="row"><p>مدينة الوفاء:</p> <span>الرياض - المملكة العربية السعودية</span></div>
        <div class="row"><p>سبب الإنشاء:</p> <span>سلفة</span></div>
      </div>

      <div class="content-box">
        <div class="amount-box">
          <h3>قيمة السند</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>

    </div>

    <div class="section-title">تفاصيل الدائن</div>
    <div class="info-box">
      <div class="row"><p>الاسم:</p> <span>{{اسم_الدائن}}</span></div>
      <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_الدائن}}</span></div>
    </div>

    <div class="section-title">تفاصيل المدين</div>
    <div class="info-box">
      <div class="row"><p>الاسم:</p> <span>{{اسم_المدين}}</span></div>
      <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_المدين}}</span></div>
    </div>

    <div class="section-title">تفاصيل الكفيل</div>
    <div class="info-box">
      <div class="row"><p>الاسم:</p> <span>{{اسم_الكفيل}}</span></div>
      <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_الكفيل}}</span></div>
    </div>

    <div class="text-box">
      <p>
        أتعهد بأن أدفع لأمر {{اسم_الدائن}} دون قيد أو شرط مبلغاً قدره {{المبلغ_رقما}} ريال سعودي وفق البيانات المذكورة أعلاه.  
        ولحامل هذا السند حق الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
      </p>
      <p class="strong">اسم المدين: {{اسم_المدين}}</p>
      <p class="strong">{{التاريخ_الهجري}} هـ الموافق {{التاريخ_الميلادي}}</p>
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
        <p>{{اسم_المدين}}</p>
      </div>
      <div>
        <p class="strong">توقيع الكفيل</p>
        <div class="sign-line"></div>
        <p>{{اسم_الكفيل}}</p>
      </div>
    </div>

  </div>
</div>
`;
};

export default PromissoryNote;
