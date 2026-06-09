
// Run this in your browser console to clear Redux cache
const keysToClear = [
  "admin",
  "adminToken",
  "user"
];

console.log('🧹 Clearing Redux cache...');
keysToClear.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('✅ Cleared:', key);
  } else {
    console.log('ℹ️  Not found:', key);
  }
});
console.log('✨ Redux cache cleared! Please refresh the page.');
