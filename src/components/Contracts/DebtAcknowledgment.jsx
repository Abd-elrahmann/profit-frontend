// components/contracts/DebtAcknowledgment.jsx
import React from "react";

const DebtAcknowledgment = () => {
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

  .text-box {
    background: #f3f4f6;
    padding: 15px;
    border-radius: 8px;
  }
  .text-box p {
    font-size: 14px;
    color: #444;
    line-height: 1.7;
  }
  .strong {
    font-weight: bold;
    margin-top: 6px;
  }

  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
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
        <div class="row"><p>أنني قد استلمت من السيد:</p> <span>{{اسم_الدائن}}</span></div>
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
      <h3 style="margin-bottom:10px; font-weight:bold;">نص الإقرار</h3>
     <p style="line-height: 2em;">
  وأقر أنني قد استلمت هذا المبلغ على شكل دين يتم سداده على فترة من الزمن، وأتحمل كافة المسؤوليات وجميع
  العواقب القانونية والجنائية، وفي حالة أنني لم أقم بسداد المبلغ فإني أقوم بإسقاط حقوقي في التزوير أو التكذيب أو التنكير،
  وأتعهد بحلف اليمين في حالة التشكيك في الوثيقة. وعلى هذا الاتفاق فإني أوافق وأوقع على الوثيقة.
</p>

      <p class="strong">اسم المدين: {{اسم_العميل}}</p>
      <p class="strong">التاريخ الهجري: {{التاريخ_الهجري}} — الميلادي: {{التاريخ_الميلادي}}</p>
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
