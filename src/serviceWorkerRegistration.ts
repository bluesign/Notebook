
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister().then();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
