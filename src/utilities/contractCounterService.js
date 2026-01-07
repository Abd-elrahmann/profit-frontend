// Contract Counter Service - Local storage based counter for contract numbers
class ContractCounterService {
  constructor() {
    this.STORAGE_KEY = 'contract_counters';
    this.COUNTER_TYPES = {
      PAYMENT_RECEIPT: 'payment_receipt',
      PROMISSORY_NOTE: 'promissory_note',
      DEBT_ACKNOWLEDGMENT: 'debt_acknowledgment',
      MUDARABAH: 'mudarabah',
      WITHDRAWAL_RECEIPT: 'withdrawal_receipt',
      PAYMENT_VOUCHER: 'payment_voucher'
    };
  }

  // Get current counter for a specific type
  getCurrentCounter(type) {
    const counters = this.getCounters();
    return counters[type] || 1; // Start from 1 if not exists
  }

  // Increment and get next counter for a specific type
  getNextCounter(type) {
    const counters = this.getCounters();
    const currentCounter = counters[type] || 1;
    const nextCounter = currentCounter + 1;

    // Update the counter
    counters[type] = nextCounter;
    this.saveCounters(counters);

    return currentCounter; // Return the current counter before increment
  }

  // Get all counters from localStorage
  getCounters() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading contract counters:', error);
      return {};
    }
  }

  // Save counters to localStorage
  saveCounters(counters) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(counters));
    } catch (error) {
      console.error('Error saving contract counters:', error);
    }
  }

  // Reset counter for a specific type (useful for testing or manual reset)
  resetCounter(type) {
    const counters = this.getCounters();
    counters[type] = 1;
    this.saveCounters(counters);
  }

  // Get formatted contract number with type prefix
  getFormattedContractNumber(type, counter = null) {
    const number = counter || this.getCurrentCounter(type);

    switch (type) {
      case this.COUNTER_TYPES.PAYMENT_RECEIPT:
        return number.toString(); // 1, 2, 3, 4, etc.
      case this.COUNTER_TYPES.PROMISSORY_NOTE:
        return number.toString(); // 1, 2, 3, 4, etc.
      case this.COUNTER_TYPES.DEBT_ACKNOWLEDGMENT:
        return number.toString(); // 1, 2, 3, 4, etc.
      case this.COUNTER_TYPES.MUDARABAH:
        return number.toString(); // 1, 2, 3, 4, etc.
      case this.COUNTER_TYPES.WITHDRAWAL_RECEIPT:
        return number.toString(); // 1, 2, 3, 4, etc.
      case this.COUNTER_TYPES.PAYMENT_VOUCHER:
        return number.toString(); // 1, 2, 3, 4, etc.
      default:
        return number.toString();
    }
  }

  // Generate contract number for saving (uses current counter, then increments)
  generateContractNumber(type) {
    const currentCounter = this.getCurrentCounter(type);
    // Use the current counter value for the contract
    const contractNumber = this.getFormattedContractNumber(type, currentCounter);

    // Increment the counter for next use
    const counters = this.getCounters();
    counters[type] = currentCounter + 1;
    this.saveCounters(counters);

    return contractNumber;
  }

  // Preview what the next contract number will be (same as getCurrentContractNumber)
  previewNextContractNumber(type) {
    return this.getCurrentContractNumber(type);
  }

  // Get next contract number for preview (shows what will be saved)
  getCurrentContractNumber(type) {
    const counter = this.getCurrentCounter(type);
    // Show the next number that will be used when saving
    return this.getFormattedContractNumber(type, counter);
  }

  // Get contract numbers for settlement (promissory note and debt acknowledgment)
  getSettlementContractNumbers() {
    const promissoryNoteNumber = this.getCurrentContractNumber(this.COUNTER_TYPES.PROMISSORY_NOTE);
    const debtAcknowledgmentNumber = this.getCurrentContractNumber(this.COUNTER_TYPES.DEBT_ACKNOWLEDGMENT);

    return {
      promissoryNoteNumber,
      debtAcknowledgmentNumber
    };
  }

  // Update loan data with generated contract numbers (when saving settlement)
  updateLoanWithContractNumbers(loanData) {
    if (!loanData) return loanData;

    const updatedLoan = { ...loanData };

    // Generate new numbers for promissory note and debt acknowledgment
    updatedLoan.promissoryNoteNumber = this.generateContractNumber(this.COUNTER_TYPES.PROMISSORY_NOTE);
    updatedLoan.debtAcknowledgmentNumber = this.generateContractNumber(this.COUNTER_TYPES.DEBT_ACKNOWLEDGMENT);

    return updatedLoan;
  }
}

// Export singleton instance
const contractCounterService = new ContractCounterService();
export default contractCounterService;
