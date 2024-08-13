import { Workbox } from 'workbox-window';

const swRegister = async () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.bundle.js');
    wb.register().then((registration) => {
      console.log('Service worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.log('Service worker registration failed:', error);
    });
  }
};

export default swRegister;
