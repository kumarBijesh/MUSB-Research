const fs = require('fs');
const path = require('path');

const directory = 'src';

const replacements = [
    { old: /text-\[10px\]/g, new: 'text-[15px]' },
    { old: /text-\[11px\]/g, new: 'text-[1px]' },
    { old: /text-\[12px\]/g, new: 'text-[1px]' },
    { old: /text-xs/g, new: 'text-[13px]' }
];

function processFile(filepath) {
    try {
        const content = fs.readFileSync(filepath, 'utf8');
        let newContent = content;

        for (const replacement of replacements) {
            newContent = newContent.replace(replacement.old, replacement.new);
        }

        if (newContent !== content) {
            fs.writeFileSync(filepath, newContent, 'utf8');
            console.log(`Updated ${filepath}`);
        }
    } catch (e) {
        console.error(`Error processing ${filepath}:`, e);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

traverseDirectory(directory);
