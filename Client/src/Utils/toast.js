import addNotification from 'react-push-notification';

export function toastSuccess(message, title = 'Success') {
  addNotification({
    title,
    message,
    theme: 'light',
    duration: 2500,
    native: false
  });
}

export function toastError(message, title = 'Error') {
  addNotification({
    title,
    message,
    theme: 'dark',
    duration: 3500,
    native: false
  });
}
