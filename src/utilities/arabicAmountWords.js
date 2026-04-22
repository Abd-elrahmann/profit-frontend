/**
 * Arabic wording for non-negative integers (تفقيط أعداد صحيحة).
 */
export function integerToArabicWords(num) {
  const n = Math.trunc(Number(num));
  if (!Number.isFinite(n)) return "صفر";
  if (n === 0) return "صفر";
  if (n < 0) return "سالب " + integerToArabicWords(-n);

  const ones = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const tens = [
    "",
    "",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const teens = [
    "عشرة",
    "أحد عشر",
    "اثنا عشر",
    "ثلاثة عشر",
    "أربعة عشر",
    "خمسة عشر",
    "ستة عشر",
    "سبعة عشر",
    "ثمانية عشر",
    "تسعة عشر",
  ];
  const hundreds = [
    "",
    "مائة",
    "مئتان",
    "ثلاثمائة",
    "أربعمائة",
    "خمسمائة",
    "ستمائة",
    "سبعمائة",
    "ثمانمائة",
    "تسعمائة",
  ];

  let result = "";
  let hasThousands = false;
  let working = n;

  const scale = [
    { value: 1e9, singular: "مليار", dual: "ملياران", plural: "مليارات" },
    { value: 1e6, singular: "مليون", dual: "مليونان", plural: "ملايين" },
    { value: 1e3, singular: "ألف", dual: "ألفان", plural: "آلاف" },
  ];

  for (const s of scale) {
    if (working >= s.value) {
      const part = Math.floor(working / s.value);
      if (part === 1) {
        result += s.singular + " ";
      } else if (part === 2) {
        result += s.dual + " ";
      } else if (part === 10) {
        result += "عشرة " + s.plural + " ";
      } else if (part >= 3 && part <= 9) {
        result += ones[part] + " " + s.plural + " ";
      } else if (part >= 11 && part <= 19) {
        result += teens[part - 10] + " " + s.singular + " ";
      } else {
        result += integerToArabicWords(part) + " " + s.singular + " ";
      }
      working %= s.value;
      if (s.value === 1e3) hasThousands = true;
    }
  }

  if (working >= 100) {
    const hundredsPart = Math.floor(working / 100);
    if (hundredsPart > 0) {
      if (hasThousands && result.trim().length > 0) {
        result += "و" + hundreds[hundredsPart];
      } else {
        result += hundreds[hundredsPart];
      }
    }
    working %= 100;
    if (working > 0 && hundredsPart > 0) result += " ";
  }

  if (working >= 20) {
    const t = Math.floor(working / 10);
    const o = working % 10;
    const hasHigherUnits = result.length > 0;
    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith("و")) {
        result += " و";
      }
      result += " ";
    }
    if (o > 0) {
      result += ones[o] + " و" + tens[t];
    } else {
      result += tens[t];
    }
  } else if (working >= 10) {
    const hasHigherUnits = result.length > 0;
    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith("و")) {
        result += " و";
      }
      result += " ";
    }
    result += teens[working - 10];
  } else if (working > 0) {
    const hasHigherUnits = result.length > 0;
    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith("و")) {
        result += " و";
      }
      result += " ";
    }
    result += ones[working];
  }

  return result.trim();
}

/**
 * مبلغ بالريال السعودي كتابة: جزء صحيح بـ «ريال»، وإن وُجدت هللات تُذكر بـ «هللة» فقط عند الحاجة.
 */
export function amountToArabicSarInWords(amount) {
  const raw = Number(amount);
  if (!Number.isFinite(raw)) return "صفر ريال";

  const negative = raw < 0;
  const absTotalHalalas = Math.round(Math.abs(raw) * 100);
  const riyals = Math.floor(absTotalHalalas / 100);
  const halalas = absTotalHalalas % 100;

  let body;
  if (riyals === 0 && halalas === 0) {
    body = "صفر ريال";
  } else if (riyals === 0) {
    body = integerToArabicWords(halalas) + " هللة";
  } else if (halalas === 0) {
    body = integerToArabicWords(riyals) + " ريال";
  } else {
    body =
      integerToArabicWords(riyals) +
      " ريال و " +
      integerToArabicWords(halalas) +
      " هللة";
  }

  return negative ? "سالب " + body : body;
}

/** اسم قديم — يعادل الأعداد الصحيحة فقط (للتوافق مع الاستدعاءات القديمة). */
export const numberToArabicWords = integerToArabicWords;
