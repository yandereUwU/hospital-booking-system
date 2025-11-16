const fs = require('fs');
const path = require('path');

console.log('📁 Структура проекта:');
function listFiles(dir, indent = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        if (file === 'node_modules' || file === '.git') return;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            console.log(`${indent}📁 ${file}/`);
            listFiles(filePath, indent + '  ');
        } else {
            console.log(`${indent}📄 ${file}`);
        }
    });
}

listFiles(__dirname);