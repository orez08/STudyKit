export const triggerNotification = (title: string, body: string) => {
  // Browser Push
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  }
  // In-app Toast (simple implementation using browser console for now as per constraints)
  console.log(`Notification: ${title} - ${body}`);
};
