// Simple debounce utility to replace lodash with cancel functionality
export const debounce = (func, wait) => {
  let timeout;
  const executedFunction = function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  executedFunction.cancel = () => {
    clearTimeout(timeout);
  };

  return executedFunction;
};
