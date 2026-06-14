const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next')) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:\\CargoHub\\CargoHub\\frontend\\customer-portal');

let totalReplaced = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*"http:\/\/localhost:5000"\}/g, 
    '${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/api\\/?$/, \'\')}');

  // Replace (`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`)
  content = content.replace(/\(\`\$\{process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*"http:\/\/localhost:5000"\}\`\)/g, 
    '((process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/api\\/?$/, \'\'))');

  // Replace process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' (single quotes)
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'http:\/\/localhost:5000'/g, 
    '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\\/api\\/?$/, \'\')');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
    totalReplaced++;
  }
});

console.log('Total files updated:', totalReplaced);
