import fs from 'fs';
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = content.split('\n');
lines.forEach((line, i) => {
    console.log(`${i + 1}: ${JSON.stringify(line)}`);
});
