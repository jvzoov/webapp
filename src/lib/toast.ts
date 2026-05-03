import toastLib from 'react-hot-toast';

export const toast = {
  success: (msg: string) => toastLib.success(msg, {
    style: {
      background: '#1A7A4A',
      color: '#fff',
      borderRadius: '8px',
      fontFamily: 'DM Mono, monospace',
      fontSize: '13px',
    },
    iconTheme: { primary: '#fff', secondary: '#1A7A4A' },
  }),
  error: (msg: string) => toastLib.error(msg, {
    style: {
      background: '#dc2626',
      color: '#fff',
      borderRadius: '8px',
      fontFamily: 'DM Mono, monospace',
      fontSize: '13px',
    },
    iconTheme: { primary: '#fff', secondary: '#dc2626' },
  }),
  info: (msg: string) => toastLib(msg, {
    style: {
      background: '#1A1612',
      color: '#fff',
      borderRadius: '8px',
      fontFamily: 'DM Mono, monospace',
      fontSize: '13px',
    },
  }),
};
