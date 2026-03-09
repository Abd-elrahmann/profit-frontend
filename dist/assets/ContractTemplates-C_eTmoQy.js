import{r as l,p as t,x as m,Q as C,y as I,b0 as D,W as u,ay as V,b1 as $,o as N,aK as F,aL as h,t as M,b2 as U,aC as Y,aJ as K}from"./mui-BaQITPNA.js";import{i as L}from"./sanitize-R_7M0aqo.js";import{e as G,n as O,h as W,H as J,A as H,a as Q}from"./index-BlwF_92m.js";import"./react-dUYnP3YU.js";import"./purify.es-B9ZVCkUG.js";const X=({value:n,onChange:A,variables:y=[],height:B="500px"})=>{const s=l.useRef(null),k=l.useRef(!1),S=l.useRef(!1),[z,v]=l.useState(null);l.useEffect(()=>{if(s.current&&!k.current){const d=s.current.innerHTML,p=n||"";if(d!==p){const e=window.getSelection();let i=null;if(e.rangeCount>0&&s.current.contains(e.anchorNode)){const r=e.getRangeAt(0),g=r.cloneRange();g.selectNodeContents(s.current),g.setEnd(r.endContainer,r.endOffset),i={offset:g.toString().length,node:r.startContainer,nodeOffset:r.startOffset}}if(s.current.innerHTML=p,i&&i.offset>0)try{const r=document.createRange(),g=document.createTreeWalker(s.current,NodeFilter.SHOW_TEXT,null);let w=0,_=null,R=0,E;for(;E=g.nextNode();){const b=E.textContent.length;if(w+b>=i.offset){_=E,R=i.offset-w;break}w+=b}_&&(r.setStart(_,Math.min(R,_.textContent.length)),r.collapse(!0),e.removeAllRanges(),e.addRange(r))}catch{}}S.current||(S.current=!0)}},[n]);const j=()=>{s.current&&A&&(k.current=!0,A(s.current.innerHTML),setTimeout(()=>{k.current=!1},0))},c=d=>{if(s.current){const p=window.getSelection();if(p.rangeCount>0){const e=p.getRangeAt(0);e.deleteContents();const i=document.createElement("span");i.contentEditable="false",i.className="template-variable",i.style.cssText=`
          background-color: #f0fdf4;
          padding: 2px 6px;
          border-radius: 4px;
          margin: 0 2px;
          color: #2E8B45;
          border: 1px solid #86efac;
          cursor: default;
          font-family: 'Cairo', sans-serif;
        `,i.textContent=d,i.title="متغير - لا تقم بتغييره";const r=document.createElement("span");r.textContent=" ⓘ",r.style.cssText=`
          font-size: 12px;
          opacity: 0.7;
          cursor: help;
        `,r.title="هذا متغير - لا تقم بتغييره",i.appendChild(r),e.insertNode(i);const g=document.createTextNode(" ");e.insertNode(g),e.setStartAfter(g),e.collapse(!0),p.removeAllRanges(),p.addRange(e),j()}}};return l.useEffect(()=>{const d=i=>{i.target.classList.contains("template-variable")&&v(i.target.textContent.replace(" ⓘ",""))},p=()=>{v(null)},e=s.current;return e&&(e.addEventListener("mouseover",d),e.addEventListener("mouseout",p)),()=>{e&&(e.removeEventListener("mouseover",d),e.removeEventListener("mouseout",p))}},[]),t.jsxs(m,{sx:{height:B},children:[t.jsxs(C,{sx:{p:2,mb:1,display:"flex",flexWrap:"wrap",gap:1,alignItems:"center"},children:[t.jsx(I,{variant:"subtitle2",children:"إدراج متغير:"}),y.map((d,p)=>t.jsx(D,{title:`إدراج: ${d.key}`,arrow:!0,children:t.jsx(u,{variant:"outlined",size:"small",startIcon:t.jsx(V,{}),onClick:()=>c(d.key),sx:{fontSize:"0.75rem"},children:d.description||d.key})},p))]}),t.jsxs(C,{sx:{border:"1px solid #e0e0e0",borderRadius:1,height:"calc(100% - 80px)",position:"relative"},children:[z&&t.jsxs(m,{sx:{position:"absolute",top:-40,left:0,right:0,bgcolor:"info.main",color:"white",p:1,borderRadius:1,textAlign:"center",zIndex:10,fontSize:"0.75rem"},children:["ⓘ هذا متغير - لا تقم بتغييره: ",z]}),t.jsx(m,{ref:s,contentEditable:!0,onInput:j,sx:{height:"100%",padding:2,overflow:"auto",outline:"none",fontFamily:'"Noto Sans Arabic", "Cairo", sans-serif',fontSize:"14px",lineHeight:1.6,direction:"rtl",textAlign:"right"}})]}),t.jsxs(C,{sx:{p:1,mt:1,display:"flex",gap:1,flexWrap:"wrap"},children:[t.jsx(u,{size:"small",variant:"outlined",onClick:()=>document.execCommand("bold",!1,null),children:"عريض"}),t.jsx(u,{size:"small",variant:"outlined",onClick:()=>document.execCommand("underline",!1,null),children:"تحته خط"}),t.jsx(u,{size:"small",variant:"outlined",onClick:()=>document.execCommand("justifyRight",!1,null),children:"محاذاة لليمين"}),t.jsx(u,{size:"small",variant:"outlined",onClick:()=>document.execCommand("insertUnorderedList",!1,null),children:"قائمة"})]})]})},q=()=>`
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
    margin-bottom: 10px; 
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
  .signatures-section {
    margin-top: 30px; 
    padding-top: 20px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    page-break-inside: avoid;
  }
  .signatures-header {
    text-align: center;
    margin-bottom: 20px; 
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
    gap: 25px; 
    margin-bottom: 15px; 
    page-break-inside: avoid;
  }
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
      margin-bottom: 15px; 
  }
  .signature-details {
    margin-bottom: 15px; 
    page-break-inside: avoid;
  }
  .signature-name {
    color: #555;
    font-size: 15px;
    margin-top: 15px; 
    margin-bottom: 20px; 
    font-weight: 600;
  }
  .signature-line {
    width: 80%;
    height: 1px;
    background: #222;
    margin: 20px auto; 
  }
  .signature-fields {
    color: #666;
    font-size: 14px;
    margin-top: 20px; 
  }
  .signature-fields p {
    margin: 8px 0; 
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
    .clauses-section {
      page-break-before: always !important;
      break-before: page !important;
    }
    .preamble-box {
      page-break-after: avoid !important;
    }
    .signatures-section { 
      page-break-inside: avoid !important;
    }
    .contract-header,
    .section-title,
    .party-card,
    .preamble-box,
    .clause,
    .signature-box {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
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
    .clause-content p,
    .preamble-text,
    .clause-text,
    .party-reference {
      orphans: 3;
      widows: 3;
      page-break-inside: avoid;
    }
    .clause-list li {
      page-break-inside: avoid;
    }
    .detail-row,
    .clause-list li,
    .signature-line {
      border-color: #000 !important;
    }
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
    .signature-name {
      color: #000 !important;
      font-weight: 700 !important;
    }
    .signature-line {
      width: 80% !important;
      background: #000 !important;
      height: 1px !important;
    }
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
    <div class="contract-header">
      <div class="header-left">
        <img src="/assets/images/logo.webp" alt="شعار الشركة" class="contract-logo" />
        <h1 class="contract-title">عقد مضاربة</h1>
      </div>
      <div class="contract-dates">
        <p>حرر هذا العقد في مدينة الرياض</p>
        <p>بتاريخ <span class="placeholder">{{التاريخ_الهجري}}</span> الموافق <span class="placeholder">{{التاريخ_الميلادي}}</span></p>
      </div>
    </div>
    <section class="contract-section">
      <h2 class="section-title">أطراف العقد</h2>
      <div class="parties-grid">
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
    <section class="contract-section clauses-section">
      <h2 class="section-title">بنود العقد</h2>
      <div class="clauses-container">
        <div class="clause">
          <h4 class="clause-title">البند الأول: موضوع العقد</h4>
          <p class="clause-text">
            يقدم رب المال للمضارب مبلغاً من المال كمضاربة، ليقوم المضارب باستثماره في أنشطة التسويق الرقمي، والبيع،
            وشراء المستلزمات اللازمة للمشروع، على أن يكون الربح الناتج مشتركاً بين الطرفين وفقًا للنسب المتفق عليها في هذا
            العقد.
          </p>
        </div>
        <div class="clause">
          <h4 class="clause-title">البند الثاني: رأس المال</h4>
          <div class="clause-content">
            <p>1. رأس مال المضاربة هو مبلغ وقدره <span class="placeholder english-number">{{رأس_المال}}</span> (<span class="placeholder">{{رأس_المال_كتابة}}</span>) فقط لا غير.</p>
            <p>2. يُقر رب المال بأنه قد سلّم رأس المال كاملاً للمضارب عند توقيع هذا العقد، ويُقر المضارب باستلامه للمبلغ،
            ويعتبر توقيع الطرفين على هذا العقد بمثابة إيصال استلام.</p>
          </div>
        </div>
        <div class="clause">
          <h4 class="clause-title">البند الثالث: طبيعة العمل</h4>
          <div class="clause-content">
            <p>1. تُعتبر هذه المضاربة مضاربة مقيدة، حيث يقتصر عمل المضارب على الأنشطة المذكورة في البند الأول من هذا العقد.</p>
            <p>2. يلتزم المضارب ببذل عناية الشخص المعتاد في إدارة أموال المضاربة والمحافظة عليها.</p>
            <p>3. يُقر المضارب بأنه يعمل بشكل مشترك ومتضامن في إدارة هذه المضاربة، ويكونان مسؤولين بالتضامن تجاه رب المال عن أي التزامات تنشأ عن تعدٍ أو تقصير أو مخالفة لشروط العقد.</p>
          </div>
        </div>
        <div class="clause">
          <h4 class="clause-title">البند الرابع: مدة العقد</h4>
          <p class="clause-text">
            مدة هذا العقد سنتان ميلاديتان كاملتان، تبدأ من تاريخ توقيعه. لا يتم تجديد العقد تلقائياً، ويتطلب تجديده اتفاقاً كتابياً جديداً بين الأطراف.
          </p>
        </div>
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
        <div class="clause">
          <h4 class="clause-title">البند السادس: الخسارة</h4>
          <div class="clause-content">
            <p>1. في حال حدوث خسارة مالية، يتحملها رب المال وحده وتُخصم من رأس مال المضاربة، ولا يتحمل المضارب منها شيئاً، وإنما يخسر جهده وعمله.</p>
            <p>2. استثناءً مما ورد أعلاه، يضمن المضارب رأس المال ويتحمل الخسارة إذا ثبت أنها نشأت بسبب تعديه (مثل مخالفة شروط العقد) أو تقصيره (مثل الإهمال الجسيم في إدارة العمل).</p>
          </div>
        </div>
        <div class="clause">
          <h4 class="clause-title">البند السابع: نفقات المضاربة</h4>
          <p class="clause-text">
            للمضارب أن يخصم من رأس مال المضاربة النفقات التشغيلية المعتادة والضرورية لسير العمل، مثل تكاليف التسويق، وشراء البضائع، وأي مصاريف أخرى يتطلبها المشروع، على أن يتم توثيق جميع هذه النفقات بفواتير رسمية.
          </p>
        </div>
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
`,Z=()=>`
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
    padding: 20px;
    width: 100%;
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
    align-items: start;
  }
  .details-box {
    background: rgba(46, 139, 69, 0.05);
    padding: 15px;
    border-radius: 8px;
    height: fit-content;
  }
  .details-box h2 {
    font-weight: bold;
    margin-bottom: 8px;
    font-size: 16px;
    color: #2E8B45;
  }
  .row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 25px;
    border-top: 1px solid #ddd;
    padding: 5px 0;
    font-size: 13px;
    word-spacing: normal;
    letter-spacing: normal;
  }
  .row:first-child {
    border-top: none;
  }
  .row p {
    margin: 0;
    color: #666;
    word-spacing: normal;
    letter-spacing: normal;
  }
  .row span {
    font-weight: bold;
    color: #111;
    text-align: right;
    word-spacing: normal;
    letter-spacing: normal;
  }
  .content-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 100%;
  }
  .amount-box {
    text-align: center;
    border: 1px solid rgba(46, 139, 69, 0.2);
    padding: 15px;
    border-radius: 8px;
    background: rgba(46, 139, 69, 0.02);
    margin: 0;
    height: fit-content;
  }
  .amount-box h3 {
    font-size: 15px;
    font-weight: bold;
    color: #2E8B45;
    margin-top: 0;
    margin-bottom: 10px;
    background: #e5e7eb;
    padding: 6px 10px;
    border-radius: 6px;
  }
  .amount-box h1 {
    font-size: 28px;
    font-weight: 800;
    color: #2E8B45;
    margin: 6px 0;
  }
  .amount-box p {
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 0;
  }
  .section-title {
    font-size: 16px;
    font-weight: bold;
    margin: 12px 0 8px;
    color: #2E8B45;
  }
  .info-box {
    padding: 8px;
    border-radius: 6px;
    margin-bottom: 0;
  }
  .info-box h3 {
    font-size: 14px;
    font-weight: bold;
    color: #2E8B45;
    margin-top: 0;
    background: rgba(46, 139, 69, 0.1);
    padding: 6px 10px;
    border-radius: 6px;
    margin-bottom: 8px;
  }
  .info-box .row {
    border-top: 1px solid rgba(46, 139, 69, 0.2);
  }
  .info-box .row:first-of-type {
    border-top: none;
  }
  .parties-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
  .text-box {
    background: rgba(46, 139, 69, 0.03);
    padding: 10px 15px;
    border-radius: 8px;
    margin-top: 12px;
    border: 1px solid rgba(46, 139, 69, 0.1);
  }
  .text-box p {
    font-size: 13px;
    color: #444;
    line-height: 1.4;
    margin: 3px 0;
    word-spacing: normal;
    letter-spacing: normal;
    text-align: justify;
  }
  .strong {
    font-weight: bold;
    margin-top: 6px;
    gap: 15px;
  }
  .spacer {
    display: inline-block;
    width: 15px;
  }
  .signatures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    text-align: center;
    margin-top: 15px;
    padding-top: 12px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
  }
  .sign-line {
    width: 140px;
    height: 35px;
    margin: auto;
    border-bottom: 2px solid #666;
  }
  .signatures p {
    font-size: 13px;
    margin: 5px 0;
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
      padding: 20px;
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
        <p class="title">سند لأمر</p>
      </div>
      <p class="sub-text">رقم السند: {{رقم_السند}}</p>
    </div>
    <div class="grid-wrapper">
      <div class="details-box">
        <h2>تفاصيل السند</h2>
        <div class="row"><p>تاريخ الإنشاء:</p> <span>{{التاريخ_الهجري}} هـ الموافق {{التاريخ_الميلادي}}</span></div>
        <div class="row"><p>تاريخ الاستحقاق:</p> <span>{{تاريخ_الاستحقاق}}</span></div>
        <div class="row"><p>مدينة الإصدار:</p> <span>{{مدينة_الاصدار}}</span></div>
        <div class="row"><p>مدينة الوفاء:</p> <span>{{مدينة_الوفاء}}</span></div>
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
    <div class="section-title">أطراف السند</div>
    <div class="parties-grid">
      <div class="info-box">
        <h3>تفاصيل الدائن</h3>
        <div class="row"><p>الاسم:</p> <span>{{اسم_الدائن}}</span></div>
        <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_الدائن}}</span></div>
      </div>
      <div class="info-box">
        <h3>تفاصيل المدين</h3>
        <div class="row"><p>الاسم:</p> <span>{{اسم_المدين}}</span></div>
        <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_المدين}}</span></div>
      </div>
      <div class="info-box">
        <h3>تفاصيل الكفيل</h3>
        <div class="row"><p>الاسم:</p> <span>{{اسم_الكفيل}}</span></div>
        <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_الكفيل}}</span></div>
      </div>
    </div>
    <div class="text-box">
      <p>
        أتعهد بأن أدفع لأمر {{اسم_الدائن}} دون قيد أو شرط مبلغاً قدره {{المبلغ_رقما}} ريال وفق البيانات المذكورة أعلاه.
        ولحامل هذا السند حق الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
      </p>
      <p class="strong">اسم المدين:<span class="spacer"></span>{{اسم_المدين}}</p>
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
`,tt=()=>`
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
`,at=()=>`
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
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
    gap: 20px;
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
    }
  }
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    .contract-wrapper,
    .contract-container {
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
    .signatures {
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
  `,et=()=>`
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
    padding: 3px 0;
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
  .info-box {
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
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
  .signatures {
    display: flex;
    justify-content: center;
    text-align: center;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 2px solid rgba(46, 139, 69, 0.2);
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
  }
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    .contract-wrapper,
    .contract-container {
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
    .details-box,
    .content-box,
    .text-box,
    .signatures {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    * {
      max-height: none !important;
      overflow: visible !important;
    }
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
        <p class="title">سند قبض دفعة</p>
      </div>
      <p class="sub-text">رقم الإيصال: {{رقم_الايصال}}</p>
    </div>
    <div class="grid-wrapper">
      <div class="details-box">
        <h2>معلومات العميل</h2>
        <div class="row"><p>اسم العميل:</p> <span>{{اسم_العميل}}</span></div>
        <div class="row"><p>رقم الهوية:</p> <span>{{رقم_هوية_العميل}}</span></div>
        <div class="row"><p>تاريخ السداد:</p> <span>{{التاريخ_الهجري}} هـ الموافق {{التاريخ_الميلادي}}.</span></div>
      </div>
      <div class="content-box">
        <div class="amount-box">
          <h3>المبلغ المدفوع</h3>
          <h1>{{المبلغ_رقما}}</h1>
          <p>{{المبلغ_كتابة}}</p>
        </div>
      </div>
    </div>
    <div id="installments-table-container" style="{{عرض_جدول_الدفعات}}">
      <div class="section-title">تفاصيل الدفعات المعتمدة</div>
      {{جدول_الدفعات}}
    </div>
    <div class="section-title">تفاصيل السداد</div>
    <div class="text-box">
      <p style="{{عرض_نص_فردي}}">
        أقرّ أنا {{اسم_رب_المال}} باستلام مبلغ وقدره {{المبلغ_رقما}}،
        كدفعة سداد من العميل المذكور أعلاه.
      </p>
      <p style="{{عرض_نص_مجمع}}">
        أقرّ أنا {{اسم_رب_المال}} باستلام مبلغ وقدره {{المبلغ_رقما}}،
        كدفعات سداد من العميل المذكور أعلاه للدفعات الموضحة في الجدول أعلاه.
      </p>
    </div>
    <div class="signatures">
      <div>
        <p class="strong">توقيع الموظف المختص</p>
        <div class="sign-line"></div>
        <p>{{اسم_الموظف}}</p>
      </div>
    </div>
  </div>
</div>
`,it=()=>`
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
  .discount-text {
    font-weight: bold;
    color: #000;
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
    .details-box,
    .content-box,
    .text-box,
    .signatures {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    * {
      max-height: none !important;
      overflow: visible !important;
    }
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
        أُقر أنا الموقع أدناه <span class="highlight-text">{{اسم_المستثمر}}</span>، بأن السيد <span class="highlight-text">{{اسم_العميل}}</span> رقم الهوية الوطنية: <span class="highlight-text">{{رقم_هوية_العميل}}</span> قد قام بسداد كامل مبلغ السلفة الممنوحة له بموجب: • سند أمر رقم (<span class="highlight-text">{{رقم_السند}}</span>) • إقرار دين وتعهد بالسداد رقم (<span class="highlight-text">{{رقم_الإقرار}}</span>) وذلك بمبلغ وقدره (<span class="highlight-text">{{المبلغ_كتابة}}</span>) {{معلومات_الخصم}}. وبناءً على ذلك، فقد تم استلام المبلغ كاملًا وتُعتبر هذه السلفة مقفلة نهائيًا، ولا يترتب على السيد {{اسم_العميل}} أي التزامات مالية أخرى تخص السلفة أو السند المشار إليهما أعلاه. ويُعد هذا الإشعار خلو طرف نهائي صادر بناءً على السداد الكامل والمطابقة مع المستندات الرسمية.
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
`,ot=()=>`
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
    .section-title,
    .terms-title,
    .declaration-title {
      margin: 8px 0 6px;
      padding: 6px 10px;
      font-size: 15px;
    }
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
        <div class="party-title">الطرف الأول: الإدارة (المضارب)</div>
        <div class="party-info">
          <span class="party-label">الموظف المختص:</span>
          <span class="party-value">{{اسم_المضارب}}</span>
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
            <td>{{رأس_مال_المساهم}}</td>
          </tr>
          <tr>
            <td>خصم نصيب المساهم من التعثرات حتي تاريخ الخروج</td>
            <td>{{خصم_نصيب_المساهم_من_الخسائر}}</td>
          </tr>
          <tr>
            <td>المدخرات المستحقة للمساهم</td>
            <td>{{المدخرات_المستحقة_للمساهم}}</td>
          </tr>
          <tr class="total-row">
            <td>صافي المبلغ المستحق بعد الخصم</td>
            <td>{{صافي_المبلغ_المستحق_بعد_الخصم}}</td>
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
          <span class="term-value">{{الحد_الأقصى_للدفعة}}</span>
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
        <p>صافي المبلغ المستحق له هو <strong>{{صافي_المبلغ_المستحق_بعد_الخصم}}</strong> وسيتم سداده على دفعات حسب التحصيل.</p>
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
    </div>
  </div>
</div>
`;function lt(){const[n,A]=l.useState("debt-acknowledgment"),[y,B]=l.useState({mudarabah:"",promissoryNote:"",debtAcknowledgment:"",paymentVoucher:"",paymentProof:"",settlement:"",withdrawalReceipt:""}),[s,k]=l.useState({mudarabah:"",promissoryNote:"",debtAcknowledgment:"",paymentVoucher:"",paymentProof:"",settlement:"",withdrawalReceipt:""}),[S,z]=l.useState(!1),[v,j]=l.useState(!1),[c,d]=l.useState("preview"),{permissions:p}=G(),e=$(),i=N.useMemo(()=>({mudarabah:"MUDARABAH","promissory-note":"PROMISSORY_NOTE","debt-acknowledgment":"DEBT_ACKNOWLEDGMENT","payment-voucher":"PAYMENT_VOUCHER","payment-proof":"PAYMENT_PROOF",settlement:"SETTLEMENT","withdrawal-receipt":"WITHDRAWAL_RECEIPT"}),[]),r=a=>a==="promissory-note"?"promissoryNote":a==="debt-acknowledgment"?"debtAcknowledgment":a==="payment-voucher"?"paymentVoucher":a==="payment-proof"?"paymentProof":a==="settlement"?"settlement":a==="withdrawal-receipt"?"withdrawalReceipt":a,g=N.useCallback(a=>{switch(a){case"MUDARABAH":return q();case"PROMISSORY_NOTE":return Z();case"DEBT_ACKNOWLEDGMENT":return tt();case"PAYMENT_VOUCHER":return at();case"PAYMENT_PROOF":return et();case"SETTLEMENT":return it();case"WITHDRAWAL_RECEIPT":return ot();default:return""}},[]),w=N.useCallback(async()=>{z(!0);try{const a={},o={};Object.keys(i).forEach(x=>{const T=i[x],P=r(x);a[P]=g(T),o[P]=""}),B(a),k(o)}catch(a){O("خطأ في تحميل القوالب"),W(a)}finally{z(!1)}},[i,g]),_=async()=>{j(!0);try{const a=n,o=i[a],x=r(a),T=y[x];await H.post("/api/templates",{name:o,description:`Template for ${o} agreements`,content:T}),s[x]&&s[x].trim()!==""&&await H.post(`/api/templates/${o}/styles`,{css:s[x]}),Q("تم حفظ القالب بنجاح")}catch(a){O("خطأ في حفظ القالب"),W(a)}finally{j(!1)}},R=(a,o)=>{B(x=>({...x,[a]:o}))},E=(a,o)=>a&&!L(a)?(console.error("Template content contains potentially dangerous elements"),'<div style="color: red; text-align: center; padding: 20px;">القالب يحتوي على محتوى غير آمن</div>'):o&&o.trim()!==""&&!L(`<style>${o}</style>`)?(console.error("Template styles contain potentially dangerous content"),a):!o||o.trim()===""?a:`<style>${o}</style>${a}`,b=(a,o)=>{const x=y[a],T=s[o];return t.jsx(C,{sx:{p:4,mb:4,minHeight:"600px",bgcolor:e.palette.background.paper,border:`1px solid ${e.palette.divider}`,boxShadow:`0 2px 4px ${e.palette.mode==="dark"?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"}`,maxWidth:"1200px",margin:"0 auto"},children:t.jsx(m,{dangerouslySetInnerHTML:{__html:E(x,T)},sx:{"& *":{fontFamily:'"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important'}}})})},f=a=>t.jsx(X,{value:y[a],onChange:o=>R(a,o),height:"600px"});return l.useEffect(()=>{w()},[w]),t.jsxs(m,{sx:{display:"flex",minHeight:"100vh",bgcolor:e.palette.background.default},children:[t.jsxs(J,{children:[t.jsx("title",{children:"القوالب المالية"}),t.jsx("meta",{name:"description",content:"القوالب المالية"})]}),t.jsx(m,{sx:{flex:1,display:"flex",flexDirection:"column"},children:t.jsx(m,{sx:{p:4,overflowY:"auto",flex:1},children:t.jsxs(C,{sx:{p:3,borderRadius:2},children:[t.jsxs(F,{value:n,onChange:(a,o)=>A(o),variant:"scrollable",scrollButtons:"auto",textColor:"primary",indicatorColor:"primary",sx:{borderBottom:`1px solid ${e.palette.divider}`,mb:3,"& .MuiTab-root":{fontWeight:"bold",fontSize:"0.9rem",minWidth:"auto",px:2}},children:[t.jsx(h,{label:"عقد المضاربة",value:"mudarabah"}),t.jsx(h,{label:"سند لأمر",value:"promissory-note"}),t.jsx(h,{label:"إقرار دين وتعهد بالسداد",value:"debt-acknowledgment"}),t.jsx(h,{label:"سند الصرف",value:"payment-voucher"}),t.jsx(h,{label:"سند قبض دفعة",value:"payment-proof"}),t.jsx(h,{label:"تسوية سلفة وخلو طرف",value:"settlement"}),t.jsx(h,{label:"مخالصة مالية نهائية",value:"withdrawal-receipt"})]}),t.jsx(m,{sx:{mt:3},children:S?t.jsxs(m,{sx:{display:"flex",justifyContent:"center",alignItems:"center",height:"400px"},children:[t.jsx(M,{size:40}),t.jsx(I,{sx:{ml:2},children:"جاري تحميل القوالب..."})]}):t.jsxs(t.Fragment,{children:[t.jsxs(m,{sx:{mb:3,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:2},children:[t.jsxs(I,{variant:"h4",sx:{fontWeight:"bold",color:e.palette.text.primary},children:[n==="mudarabah"&&"عقد المضاربة",n==="promissory-note"&&"سند لأمر",n==="debt-acknowledgment"&&"إقرار دين وتعهد بالسداد",n==="payment-voucher"&&"سند الصرف",n==="payment-proof"&&"سند قبض دفعة",n==="settlement"&&"إيصال تسوية دفعة",n==="withdrawal-receipt"&&"مخالصة مالية نهائية"]}),t.jsxs(m,{sx:{display:"flex",gap:1,flexWrap:"wrap",alignItems:"center"},children:[t.jsx(u,{variant:c==="preview"?"contained":"outlined",startIcon:t.jsx(U,{sx:{marginLeft:"10px"}}),onClick:()=>d("preview"),children:"معاينة"}),p.includes("templates_Update")&&t.jsx(u,{variant:c==="edit"?"contained":"outlined",startIcon:t.jsx(Y,{sx:{marginLeft:"10px"}}),onClick:()=>d("edit"),children:"تحرير"}),p.includes("templates_Update")&&t.jsx(u,{variant:"contained",color:"success",startIcon:v?t.jsx(M,{size:16,color:"inherit"}):t.jsx(K,{sx:{marginLeft:"10px"}}),disabled:v,onClick:_,children:v?"جاري الحفظ...":"حفظ القالب"})]})]}),n==="mudarabah"&&(c==="preview"?b("mudarabah","mudarabah"):f("mudarabah")),n==="promissory-note"&&(c==="preview"?b("promissoryNote","promissoryNote"):f("promissoryNote")),n==="debt-acknowledgment"&&(c==="preview"?b("debtAcknowledgment","debtAcknowledgment"):f("debtAcknowledgment")),n==="payment-voucher"&&(c==="preview"?b("paymentVoucher","paymentVoucher"):f("paymentVoucher")),n==="payment-proof"&&(c==="preview"?b("paymentProof","paymentProof"):f("paymentProof")),n==="settlement"&&(c==="preview"?b("settlement","settlement"):f("settlement")),n==="withdrawal-receipt"&&(c==="preview"?b("withdrawalReceipt","withdrawalReceipt"):f("withdrawalReceipt"))]})})]})})})]})}export{lt as default};
