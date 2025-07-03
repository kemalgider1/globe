// Performance monitoring for the globe app
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('App loaded in:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
  });
}
