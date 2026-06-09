#!/usr/bin/env node

/**
 * Script to clear Redux cache (localStorage items)
 * Run with: npm run clear-cache
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Clearing Redux cache...\n');

// List of localStorage keys to clear
const keysToClear = [
  'admin',
  'adminToken',
  'user',
  // Add any other Redux-related keys here
];

console.log('The following localStorage keys will be cleared:');
keysToClear.forEach(key => console.log(`  - ${key}`));
console.log('\n');

// Create a browser console script
const browserScript = `
// Run this in your browser console to clear Redux cache
const keysToClear = ${JSON.stringify(keysToClear, null, 2)};

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
`;

// Save the script to a file
const scriptPath = path.join(__dirname, '..', 'clear-redux-cache-console.js');
fs.writeFileSync(scriptPath, browserScript);

console.log('📝 Browser console script created at:');
console.log(`   ${scriptPath}\n`);
console.log('📋 To clear Redux cache:');
console.log('   1. Open your browser console (F12)');
console.log('   2. Copy and paste the contents of clear-redux-cache-console.js');
console.log('   3. Press Enter to execute');
console.log('   4. Refresh the page\n');

console.log('💡 Alternative: Open browser DevTools and run:');
console.log('   localStorage.clear()');
console.log('   (This will clear ALL localStorage, not just Redux cache)\n');

