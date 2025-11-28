// components/contracts/PaymentVoucher.jsx
import React from 'react';

const PaymentVoucher = () => {
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
    min-width: 260px;
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
    gap: 20px;
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
    margin: 20px 0 15px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #2d3748;
  }

  .info-box {
    background: #f9fafb;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    gap: 20px;
  }
  .sign-line {
    width: 180px;
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
        <p class="title">سند صرف – زكاة مقدَّمة</p>
      </div>
      <p class="sub-text">رقم السند: {{رقم_السند}}</p>
    </div>

    <div class="grid-wrapper">

      <div class="details-box">
        <h2>بيانات السند</h2>
        <div class="row"><p>نوع السند:</p> <span>سند صرف</span></div>
        <div class="row"><p>البند:</p> <span>زكاة مقدَّمة</span></div>
        <div class="row"><p>التاريخ الهجري:</p> <span>{{التاريخ_الهجري}}</span></div>
        <div class="row"><p>التاريخ الميلادي:</p> <span>{{التاريخ_الميلادي}}</span></div>
        <div class="row"><p>سبب الصرف:</p> <span>{{سبب_الصرف}}</span></div>
      </div>

      <div class="content-box">
        <div class="amount-box">
          <h3>المبلغ المصروف</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>

    </div>

    <div class="section-title">بيانات المساهم</div>
    <div class="info-box">
      <div class="row"><p>اسم المساهم:</p> <span>{{اسم_المساهم}}</span></div>
      <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_المساهم}}</span></div>
    </div>

    <div class="section-title">بيانات المستلم</div>
    <div class="info-box">
      <div class="row"><p>اسم المستلم:</p> <span>{{اسم_المستلم}}</span></div>
      <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_المستلم}}</span></div>
    </div>

    <div class="signatures">
      <div>
        <p class="strong">توقيع المساهم</p>
        <div class="sign-line"></div>
        <p>{{اسم_المساهم}}</p>
      </div>
      <div>
        <p class="strong">توقيع المستلم</p>
        <div class="sign-line"></div>
        <p>{{اسم_المستلم}}</p>
      </div>
    </div>

  </div>
</div>
  `;
};

export default PaymentVoucher;