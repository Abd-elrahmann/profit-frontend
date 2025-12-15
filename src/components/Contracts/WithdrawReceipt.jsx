import React from "react";

const WithdrawReceipt = () => {
  return `
<style>
  .receipt-wrapper {
    background: #f8f9fc;
    padding: 15px;
    font-family: "Cairo", "Tajawal", "Noto Sans Arabic", sans-serif;
    direction: rtl;
    text-align: right;
  }
  * {
    word-spacing: normal;
    letter-spacing: normal;
  }

  .receipt-container {
    max-width: 900px;
    margin: auto;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
    padding-bottom: 8px;
    margin-bottom: 15px;
  }
  .header-left {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .icon {
    font-size: 24px;
    color: #d4af37;
  }
  .title {
    font-size: 20px;
    font-weight: bold;
    color: #2E8B45;
  }
  .subtitle {
    font-size: 16px;
    color: #555;
    margin-bottom: 10px;
  }
  .reference {
    font-size: 10px;
    color: #555;
    white-space: nowrap;
  }

  .parties-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  .party-box {
    background: rgba(46, 139, 69, 0.05);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
  }
  .party-title {
    font-size: 16px;
    font-weight: bold;
    color: #2E8B45;
    margin-bottom: 10px;
    border-bottom: 2px solid rgba(46, 139, 69, 0.2);
    padding-bottom: 5px;
  }
  .party-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
  }
  .party-label {
    color: #666;
    font-weight: 500;
  }
  .party-value {
    color: #111;
    font-weight: bold;
  }

  .details-section {
    margin-bottom: 30px;
  }
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 12px 0 8px;
    color: #4a4a4a;
    background: #f0f0f0;
    padding: 8px 12px;
    border-radius: 4px;
  }

  .financial-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .financial-table th {
    background: rgba(46, 139, 69, 0.1);
    color: #2E8B45;
    font-weight: bold;
    padding: 12px 15px;
    text-align: right;
    font-size: 14px;
  }
  .financial-table td {
    padding: 12px 15px;
    text-align: right;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    background: white;
  }
  .financial-table tr:hover {
    background: white;
  }
  .financial-table .total-row {
    font-weight: bold;
  }
  .financial-table .total-row td {
    color: #2E8B45;
    font-size: 15px;
  }

  .terms-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
    margin-bottom: 30px;
    page-break-inside: avoid;
  }

  .exit-impact-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(46, 139, 69, 0.2);
    margin-bottom: 30px;
    page-break-inside: avoid;
  }

  .impact-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .impact-table th {
    background: rgba(46, 139, 69, 0.1);
    color: #2E8B45;
    font-weight: bold;
    padding: 12px 15px;
    text-align: right;
    font-size: 14px;
  }
  .impact-table td {
    padding: 12px 15px;
    text-align: right;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    line-height: 1.5;
    background: white;
  }
  .impact-table tr:hover {
    background: white;
  }
  .terms-title {
    font-size: 16px;
    font-weight: bold;
    color: #4a4a4a;
    margin-bottom: 15px;
    background: #f0f0f0;
    padding: 8px 12px;
    border-radius: 4px;
  }
  .terms-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  .term-item {
    display: flex;
    flex-direction: column;
  }
  .term-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
    margin-bottom: 5px;
  }
  .term-value {
    font-size: 14px;
    color: #111;
    font-weight: bold;
  }

  .declaration-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    margin-bottom: 30px;
    page-break-inside: avoid;
  }
  .declaration-title {
    font-size: 16px;
    font-weight: bold;
    color: #4a4a4a;
    margin-bottom: 10px;
    background: #f0f0f0;
    padding: 8px 12px;
    border-radius: 4px;
  }
  .declaration-text {
    font-size: 14px;
    color: #495057;
    line-height: 1.6;
    text-align: justify;
  }

  .signatures-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 30px;
    padding: 20px 0;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    page-break-inside: avoid;
    max-width: 100%;
    overflow: hidden;
  }
  .signatures-row {
    display: flex;
    justify-content: space-around;
    gap: 30px;
    margin-bottom: 20px;
    padding: 0 20px;
    max-width: 100%;
  }
  .signature-title-main {
    font-size: 18px;
    font-weight: bold;
    color: #2E8B45;
    text-align: center;
    margin-bottom: 15px;
  }
  .signature-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 16px;
    color: #2E8B45;
    font-weight: bold;
    flex: 1;
    max-width: 45%;
    min-width: 0;
  }
  .signature-title {
    text-align: center;
    margin-bottom: 35px;
  }
  .signature-line {
    width: 100%;
    max-width: 300px;
    height: 2px;
    background: #222;
    margin: 5px 0;
  }
  .signature-name {
    text-align: center;
    color: #111;
    font-weight: normal;
    word-wrap: break-word;
    max-width: 100%;
  }
  .signature-label {
    min-width: 80px;
  }
  .signature-value {
    color: #111;
    font-weight: normal;
  }
  .date-box {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    color: #2E8B45;
    font-weight: bold;
    margin-top: 10px;
  }
  .date-box .signature-label {
    color: #2E8B45;
  }
  .date-box .signature-value {
    color: #111;
  }

  .footer {
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
    font-size: 12px;
    color: #777;
    page-break-inside: avoid;
  }
  
  .signatures-footer-wrapper {
    page-break-inside: avoid;
  }

  @media (max-width: 768px) {
    .parties-section {
      grid-template-columns: 1fr;
    }
    .terms-grid {
      grid-template-columns: 1fr;
    }
    .signatures-section {
      gap: 15px;
    }
    .signatures-row {
      flex-direction: column;
      gap: 20px;
    }
    .signature-box {
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .signature-label {
      min-width: auto;
    }
    .financial-table th,
    .financial-table td,
    .impact-table th,
    .impact-table td {
      padding: 8px 10px;
      font-size: 12px;
    }
  }

  @media print {
    @page {
      margin: 10mm;
    }
    
    .receipt-wrapper {
      background: #fff;
      padding: 0;
    }
    .receipt-container {
      border: none;
      box-shadow: none;
      padding: 10mm;
      max-width: 100%;
    }
    
    /* تقليل المسافات بين الأقسام */
    .parties-section {
      margin-bottom: 15px;
    }
    .details-section {
      margin-bottom: 15px;
    }
    .terms-section {
      margin-bottom: 15px;
      padding: 15px;
    }
    .exit-impact-section {
      margin-bottom: 15px;
      padding: 15px;
    }
    .declaration-section {
      margin-bottom: 15px;
      padding: 15px;
    }
    
    /* تقليل مسافات الجداول */
    .financial-table,
    .impact-table {
      margin-bottom: 10px;
    }
    .financial-table th,
    .financial-table td,
    .impact-table th,
    .impact-table td {
      padding: 8px 12px;
      font-size: 13px;
    }
    
    /* تقليل مسافات العناوين */
    .section-title,
    .terms-title,
    .declaration-title {
      margin: 8px 0 6px;
      padding: 6px 10px;
      font-size: 15px;
    }
    
    /* التوقيعات والفوتر */
    .signatures-section {
      padding: 15px 10px 10px;
      margin-top: 15px;
    }
    .signatures-row {
      gap: 20px;
      padding: 0 10px;
      margin-bottom: 15px;
    }
    .signature-box {
      max-width: 45%;
    }
    .signature-title {
      margin-bottom: 25px;
    }
    .signature-line {
      max-width: 250px;
      width: 100%;
    }
    .date-box {
      margin-top: 5px;
    }
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      font-size: 11px;
    }
  }
</style>

<div class="receipt-wrapper">
  <div class="receipt-container">
    
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <span class="icon">✔</span>
        <p class="title">مخالصة مالية نهائية</p>
      </div>
      <p class="reference">رقم المرجع: {{رقم_المرجع}}</p>
    </div>

    <!-- Parties Information -->
    <div class="parties-section">
      <div class="party-box">
        <div class="party-title">الطرف الأول: المضارب</div>
        <div class="party-info">
          <span class="party-label">الاسم:</span>
          <span class="party-value">{{اسم_المضارب}}</span>
        </div>
        <div class="party-info">
          <span class="party-label">رقم الهوية:</span>
          <span class="party-value">{{رقم_هوية_المضارب}}</span>
        </div>
        <div class="party-info">
          <span class="party-label">التاريخ:</span>
          <span class="party-value">{{تاريخ_الخروج}}</span>
        </div>
      </div>
      
      <div class="party-box">
        <div class="party-title">الطرف الثاني: المساهم</div>
        <div class="party-info">
          <span class="party-label">الاسم:</span>
          <span class="party-value">{{اسم_المساهم}}</span>
        </div>
        <div class="party-info">
          <span class="party-label">رقم الهوية:</span>
          <span class="party-value">{{رقم_هوية_المساهم}}</span>
        </div>
        <div class="party-info">
          <span class="party-label">تاريخ الخروج:</span>
          <span class="party-value">{{تاريخ_الخروج}}</span>
        </div>
      </div>
    </div>

    <!-- Financial Details -->
    <div class="details-section">
      <h2 class="section-title">التفاصيل المالية</h2>
      <table class="financial-table">
        <thead>
          <tr>
            <th>البند</th>
            <th>التفاصيل</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>رأس مال المساهم</td>
            <td>{{رأس_مال_المساهم}} ريال سعودي</td>
          </tr>
          <tr>
            <td>خصم نصيب المساهم من التعثرات حتي تاريخ الخروج</td>
            <td>{{خصم_نصيب_المساهم_من_الخسائر}} ريال سعودي</td>
          </tr>
          <tr>
            <td>المدخرات المستحقة للمساهم</td>
            <td>{{المدخرات_المستحقة_للمساهم}} ريال سعودي</td>
          </tr>
          <tr class="total-row">
            <td>صافي المبلغ المستحق بعد الخصم</td>
            <td>{{صافي_المبلغ_المستحق_بعد_الخصم}} ريال سعودي</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Terms and Conditions -->
    <div class="terms-section">
      <h2 class="terms-title">شروط وآلية السداد</h2>
      <div class="terms-grid">
        <div class="term-item">
          <span class="term-label">طريقة السداد:</span>
          <span class="term-value">{{طريقة_السداد}}</span>
        </div>
        <div class="term-item">
          <span class="term-label">الحد الأقصى للدفعة:</span>
          <span class="term-value">{{الحد_الأقصى_للدفعة}} ريال سعودي</span>
        </div>
        <div class="term-item">
          <span class="term-label">مدة السداد:</span>
          <span class="term-value">{{مدة_السداد}} شهر</span>
        </div>
        <div class="term-item">
          <span class="term-label">تاريخ بدء السداد:</span>
          <span class="term-value">{{تاريخ_بدء_السداد}}</span>
        </div>
      </div>
    </div>

    <!-- Exit Impact on Participation -->
    <div class="exit-impact-section">
      <h2 class="section-title">أثر الخروج على المشاركة</h2>
      <table class="impact-table">
        <thead>
          <tr>
            <th>البند</th>
            <th>التفاصيل</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>التصفية</td>
            <td>هذه الوثيقة تعتبر مخالصة نهائية وشاملة حتى تاريخ الخروج</td>
          </tr>
          <tr>
            <td>المطالبات المستقبلية</td>
            <td>لا يحق للمساهم المطالبة بأي أرباح أو حقوق مالية بعد الخروج</td>
          </tr>
          <tr>
            <td>التعثرات الجديدة</td>
            <td>لا يتحمل المساهم أي تعثرات جديدة بعد الخروج</td>
          </tr>
          <tr>
            <td>المبالغ المتعثرة السابقة</td>
            <td>تعتبر نهائية وغير قابلة للمطالبة بها مستقبلاً</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Declaration Section -->
    <div class="declaration-section">
      <h3 class="declaration-title">إقرار المخالصة النهائية</h3>
      <div class="declaration-text">
        <p>استلم المساهم كافة حقوقه المالية المستحقة حتى تاريخ التصفية، بما في ذلك المدخرات.</p>
        <p>صافي المبلغ المستحق له هو <strong>{{صافي_المبلغ_المستحق_بعد_الخصم}} ريال سعودي</strong> وسيتم سداده على دفعات حسب التحصيل.</p>
        <p>• لا يحق له المطالبة بأي مبالغ إضافية أو أرباح بعد تاریخ خروجه.</p>
        <p>• أي مبالغ تم خصمها بسبب التعثر نهائية وغير قابلة للرجوع.</p>
        <p>• هذه الوثيقة تمثل مخالصة نهائية وشاملة بين الطرفين ملزمة لهما ولخلفهما العام والخاص.</p>
      </div>
    </div>

    <!-- Signatures and Footer Wrapper -->
    <div class="signatures-footer-wrapper">
      <!-- Signatures -->
      <div class="signatures-section">
        <div class="signature-title-main">توقيعات الأطراف</div>

        <div class="signatures-row">
          <div class="signature-box">
            <div class="signature-title">المضارب</div>
            <div class="signature-line"></div>
            <div class="signature-name">{{اسم_المضارب}}</div>
          </div>

          <div class="signature-box">
            <div class="signature-title">المساهم</div>
            <div class="signature-line"></div>
            <div class="signature-name">{{اسم_المساهم}}</div>
          </div>
        </div>

        <div class="date-box">
          <span class="signature-label">التاريخ:</span>
          <span class="signature-value">{{التاريخ_الكامل}}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>هذه المخالصة صادرة من النظام الآلي - جميع الحقوق محفوظة</p>
      </div>
    </div>

  </div>
</div>
`;
};

export default WithdrawReceipt;