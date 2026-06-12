const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('alert(')) {
    // Add import if not exists
    if (!content.includes("import { toast } from")) {
      // Find the last import statement
      const importRegex = /^import\s+.*$/gm;
      let lastMatch;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastMatch = match;
      }
      
      const importLine = `import { toast } from '@/store/toastStore';\n`;
      if (lastMatch) {
        const insertIndex = lastMatch.index + lastMatch[0].length + 1;
        content = content.substring(0, insertIndex) + importLine + content.substring(insertIndex);
      } else {
        content = importLine + content;
      }
    }

    // Replace alert(...) with toast(...) based on context
    // Very simple heuristics
    content = content.replace(/alert\((.*?)\)/g, (match, p1) => {
      p1 = p1.trim();
      const lowerP1 = p1.toLowerCase();
      if (lowerP1.includes('success') || lowerP1.includes('accepted') || lowerP1.includes('completed') || lowerP1.includes('thank you') || lowerP1.includes('updated')) {
        return `toast.success(${p1})`;
      } else if (lowerP1.includes('sent') || lowerP1.includes('created')) {
        return `toast.success(${p1})`;
      } else {
        return `toast.error(${p1})`;
      }
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'app'), processFile);
walkDir(path.join(__dirname, 'components'), processFile);
