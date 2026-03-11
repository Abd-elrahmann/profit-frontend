import React from 'react';

const PartnerWithdrawVoucher = () => {
  return `
<style>
  .contract-wrapper {
    background: #f8f9fc;
    padding: 30px;
    font-family: "Cairo", "Tajawal", "Noto Sans Arabic", sans-serif;
    direction: rtl;
    text-align: right;
    width: 794px;
    min-width: 794px;
    box-sizing: border-box;
  }
  * {
    word-spacing: normal;
    letter-spacing: normal;
    box-sizing: border-box;
  }
  .contract-container {
    width: 100%;
    max-width: 734px;
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
    margin: 15px 0 10px 0;
    color: #2E8B45;
    background: rgba(46, 139, 69, 0.1);
    padding: 8px 12px;
    border-radius: 6px;
  }
  .info-box {
    padding: 12px 15px;
    border-radius: 8px;
    margin-bottom: 15px;
  }
  .description-box {
    background: #f8f9fc;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
    margin-bottom: 15px;
  }
  .description-text {
    font-size: 15px;
    line-height: 1.8;
    color: #333;
    text-align: justify;
  }
  .description-text strong {
    color: #2E8B45;
    font-weight: bold;
  }
  .signatures {
    display: flex;
    justify-content: center;
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    gap: 20px;
  }
  .sign-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .sign-title {
    font-weight: bold;
    margin-bottom: 12px;
    color: #333;
  }
  .sign-line {
    width: 180px;
    height: 40px;
    margin: 0 auto 12px auto;
    border-bottom: 2px solid #666;
  }
  .sign-name {
    font-size: 14px;
    font-weight: bold;
    color: #333;
  }
  @media (max-width: 768px) {
    .grid-wrapper {
      grid-template-columns: 1fr;
    }
  }
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    .contract-wrapper {
      width: 100% !important;
      min-width: auto !important;
      height: auto !important;
      min-height: auto !important;
      max-height: none !important;
      margin: 0 auto !important;
      padding: 20px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-shadow: none !important;
    }
    .contract-container {
      width: 100% !important;
      max-width: none !important;
      height: auto !important;
      min-height: auto !important;
      max-height: none !important;
      margin: 0 auto !important;
      padding: 20px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      box-shadow: none !important;
      border: none !important;
    }
    .grid-wrapper,
    .info-box,
    .signatures,
    .description-box {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    * {
      max-height: none !important;
      overflow: visible !important;
    }
  }
</style>
<div class="contract-wrapper">
  <div class="contract-container">
    <div class="header">
      <div class="header-left">
        <span class="icon">✔</span>
        <p class="title">سند صرف</p>
      </div>
      <p class="sub-text">رقم السند: {{رقم_السند}}</p>
    </div>
    <div class="grid-wrapper">
      <div class="details-box">
        <h2>بيانات السند</h2>
        <div class="row"><p>نوع السند:</p> <span>سند صرف - تصفية رأس مال</span></div>
        <div class="row"><p>الشهر:</p> <span>{{الشهر}}</span></div>
        <div class="row"><p>التاريخ الهجري:</p> <span>{{التاريخ_الهجري}}</span></div>
        <div class="row"><p>التاريخ الميلادي:</p> <span>{{التاريخ_الميلادي}}</span></div>
      </div>
      <div class="content-box">
        <div class="amount-box">
          <h3>المبلغ المصروف</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>
    </div>
    <div class="section-title">بيانات المستلم</div>
    <div class="info-box">
      <div class="row"><p>اسم المساهم:</p> <span>{{اسم_المساهم}}</span></div>
      <div class="row"><p>رقم الهوية:</p> <span>{{رقم_الهوية}}</span></div>
    </div>
    <div class="description-box">
      <p class="description-text">
        تم صرف مبلغ وقدره <strong>{{المبلغ_رقما}} ريال</strong> فقط <strong>{{المبلغ_كتابة}}</strong> لا غير{{تفاصيل_المبلغ}}<br/>
        إلى السيد: <strong>{{اسم_المساهم}}</strong><br/>
        وذلك كدفعة من تصفية رأس ماله البالغ <strong>{{رأس_المال_الكلي}} ريال</strong>.
      </p>
    </div>
    <div class="signatures">
      <div class="sign-block">
        <p class="sign-title">توقيع المسؤول عن الصرف</p>
        <div class="sign-line"></div>
        <p class="sign-name">{{اسم_المسؤول_عن_الصرف}}</p>
      </div>
    </div>
  </div>
</div>
  `;
};

export default PartnerWithdrawVoucher;
