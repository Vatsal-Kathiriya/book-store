const fs = require('fs');
const path = require('path');

const directoryToSearch = path.join(__dirname);
const results = [];

// Patterns to search for
const patterns = [
  'onClick=',
  'onChange=',
  'onSubmit=',
  'onBlur=',
  'onFocus=',
  'onKeyDown=',
  'onKeyPress=',
  'onKeyUp=',
  'onMouseDown=',
  'onMouseEnter=',
  'onMouseLeave=',
  'onMouseMove=',
  'onMouseOut=',
  'onMouseOver=',
  'onMouseUp='
];

function searchInFile(filePath) {
  try {
    if (filePath.includes('node_modules') || filePath.includes('.next')) {
      return;
    }

    // Only check .js, .jsx, .ts, .tsx files
    if (!['.js', '.jsx', '.ts', '.tsx'].some(ext => filePath.endsWith(ext))) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already has "use client" directive
    const hasUseClient = content.trim().startsWith('"use client"') || 
                        content.trim().startsWith("'use client'");
    
    // Check if file contains any of the event handler patterns
    const hasEventHandlers = patterns.some(pattern => content.includes(pattern));
    
    if (hasEventHandlers && !hasUseClient) {
      results.push({
        filePath: filePath.replace(directoryToSearch, ''),
        hasUseClient,
        hasEventHandlers
      });
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}: ${err}`);
  }
}

function searchDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      searchDirectory(filePath);
    } else {
      searchInFile(filePath);
    }
  }
}

// Start the search
console.log('Scanning for files with event handlers but missing "use client"...');
searchDirectory(directoryToSearch);

// Print the results
console.log('\nFound these files with event handlers but missing "use client":');
results.forEach(result => {
  console.log(`- ${result.filePath}`);
});

console.log(`\nTotal: ${results.length} files need "use client" directive`);