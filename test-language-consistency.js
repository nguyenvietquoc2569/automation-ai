// Test script to verify language consistency between pages
// Run this in browser console to check sessionStorage

console.log('=== Language Settings Test ===');

// Check current sessionStorage values
console.log('Current sessionStorage values:');
console.log('workforce-locale:', sessionStorage.getItem('workforce-locale'));
console.log('app-locale (old):', sessionStorage.getItem('app-locale'));

// Clear all language-related storage
console.log('\nClearing all language storage...');
sessionStorage.removeItem('workforce-locale');
sessionStorage.removeItem('app-locale');
localStorage.removeItem('workforce-locale');
localStorage.removeItem('app-locale');

console.log('\nAfter clearing:');
console.log('workforce-locale:', sessionStorage.getItem('workforce-locale'));
console.log('app-locale:', sessionStorage.getItem('app-locale'));

console.log('\n=== Test Instructions ===');
console.log('1. Go to /login page');
console.log('2. Change language to Vietnamese');
console.log('3. Check sessionStorage: sessionStorage.getItem("workforce-locale")');
console.log('4. Login and navigate to /dashboard');
console.log('5. Verify dashboard shows Vietnamese interface');
console.log('6. Check sessionStorage again to confirm consistency');

console.log('\nExpected result: Language setting should persist from login to dashboard');
