// contractNumbers.js - إدارة ترقيم السندات والعقود
class ContractNumbersService {
  constructor() {
    this.STORAGE_KEY = 'contract_numbers';
    this.initializeStorage();
  }

  // تهيئة التخزين المحلي
  initializeStorage() {
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(this.STORAGE_KEY);
      if (!existing) {
        const initialData = {
          promissoryNoteCounter: 1,
          debtAcknowledgmentCounter: 1,
          settlementReceiptCounter: 1,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
      }
    }
  }

  // الحصول على البيانات من التخزين المحلي
  getStorageData() {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('خطأ في قراءة بيانات الترقيم:', error);
      return null;
    }
  }

  // حفظ البيانات في التخزين المحلي
  saveStorageData(data) {
    if (typeof window === 'undefined') return;
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('خطأ في حفظ بيانات الترقيم:', error);
    }
  }

  // تحويل الرقم إلى كتابة عربية
  numberToArabic(num) {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  }

  // الحصول على رقم السند التالي
  getNextPromissoryNoteNumber() {
    const data = this.getStorageData();
    if (!data) return '١';

    const currentNumber = data.promissoryNoteCounter;
    const arabicNumber = this.numberToArabic(currentNumber);

    // زيادة العداد للمرة القادمة
    data.promissoryNoteCounter = currentNumber + 1;
    this.saveStorageData(data);

    return arabicNumber;
  }

  // الحصول على رقم إقرار الدين التالي
  getNextDebtAcknowledgmentNumber() {
    const data = this.getStorageData();
    if (!data) return '١';

    const currentNumber = data.debtAcknowledgmentCounter;
    const arabicNumber = this.numberToArabic(currentNumber);

    // زيادة العداد للمرة القادمة
    data.debtAcknowledgmentCounter = currentNumber + 1;
    this.saveStorageData(data);

    return arabicNumber;
  }

  // الحصول على رقم سند التسوية التالي
  getNextSettlementReceiptNumber() {
    const data = this.getStorageData();
    if (!data) return '١';

    const currentNumber = data.settlementReceiptCounter;
    const arabicNumber = this.numberToArabic(currentNumber);

    // زيادة العداد للمرة القادمة
    data.settlementReceiptCounter = currentNumber + 1;
    this.saveStorageData(data);

    return arabicNumber;
  }

  // إعادة تعيين العدادات (للاختبار فقط)
  resetCounters() {
    const data = {
      promissoryNoteCounter: 1,
      debtAcknowledgmentCounter: 1,
      settlementReceiptCounter: 1,
      lastUpdated: new Date().toISOString()
    };
    this.saveStorageData(data);
  }

  // الحصول على حالة العدادات الحالية
  getCountersStatus() {
    const data = this.getStorageData();
    if (!data) return null;

    return {
      promissoryNoteCounter: data.promissoryNoteCounter,
      debtAcknowledgmentCounter: data.debtAcknowledgmentCounter,
      settlementReceiptCounter: data.settlementReceiptCounter,
      lastUpdated: data.lastUpdated
    };
  }
}

// إنشاء instance واحد من الخدمة
const contractNumbersService = new ContractNumbersService();

export default contractNumbersService;
