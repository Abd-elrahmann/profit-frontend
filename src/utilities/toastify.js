import toast, { Toaster } from 'react-hot-toast';

export const notifySuccess = (msg) => {
  toast.success(msg, {
    pauseOnHover: true,
    className: 'toast-success',
  });
}

export const notifyInfo = (msg, icon) => {
  toast(msg, {
    icon: icon,
    duration: 4000,
    position: 'top-right',
    style: {
      border: '1px solid var(--primary)',
      padding: '16px',
      color: 'var(--primary)',
    },
  });
};

export const notifyError = (msg) => {
  toast.error(msg, {
    pauseOnHover: true,
    className: 'toast-error',
  });
}
export const notifyWarning = (msg) => {
  toast(msg, {
    icon: '⚠️',
    duration: 3000,
    position: 'top-center',
    style: {
      padding: '16px',
    },
  });
};



