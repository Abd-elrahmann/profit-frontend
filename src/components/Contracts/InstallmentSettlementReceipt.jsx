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
    color: #d4af37; /* نفس لون علامة الصح */
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
        <p class="title">سند تسوية قسط</p>
      </div>
      <p class="sub-text">رقم السند: {{رقم_السند}}</p>
    </div>

    <div class="grid-wrapper">

      <div class="details-box">
        <h2>معلومات العميل والقسط</h2>
        <div class="row"><p>اسم العميل:</p> <span>{{اسم_العميل}}</span></div>
        <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_العميل}}</span></div>
        <div class="row"><p>رقم القسط:</p> <span>{{رقم_القسط}}</span></div>
        <div class="row"><p>تاريخ التسوية:</p> <span>{{التاريخ_الهجري}} هـ الموافق {{التاريخ_الميلادي}}</span></div>
        {{معلومات_الخصم}}
      </div>

      <div class="content-box">
        <div class="amount-box">
          <h3>المبلغ المسدد بالكامل</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>

    </div>

    <div class="section-title">تفاصيل التسوية</div>
    <div class="text-box">
      <p>
        نقر نحن شركة التمويل بأنه تم استلام مبلغ وقدره {{المبلغ_رقما}} ريال سعودي 
        من العميل المذكور أعلاه مقابل سداد القسط رقم {{رقم_القسط}} بالكامل.
        {{نص_الخصم}}
        وبناءً عليه تم تسوية القسط وإقفاله في نظام الشركة ولا يترتب عليه أي مسؤوليات مالية أخرى.
      </p>
    </div>

    <div class="signatures">
      <div>
        <p class="strong">توقيع الموظف المختص</p>
        <div class="sign-line"></div>
        <p>{{اسم_الموظف}}</p>
      </div>
      <div>
        <p class="strong">توقيع العميل</p>
        <div class="sign-line"></div>
        <p>{{اسم_العميل}}</p>
      </div>
    </div>

  </div>
</div>
`;
};

export default InstallmentSettlementReceipt;
