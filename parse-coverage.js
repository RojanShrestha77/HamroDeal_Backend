const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, 'coverage', 'coverage-summary.json');
if (!fs.existsSync(summaryPath)) {
    console.log("No coverage summary found at " + summaryPath);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const files = [];

for (const [file, metrics] of Object.entries(data)) {
    if (file === 'total') continue;

    const lines = metrics.lines;
    const branches = metrics.branches;

    const missingLines = lines.total - lines.covered;
    const missingBranches = branches.total - branches.covered;

    if (missingLines > 0 || missingBranches > 0) {
        files.push({
            file: file.replace(__dirname, '').substring(1),
            missingLines,
            missingBranches,
            linesPct: lines.pct,
            branchesPct: branches.pct
        });
    }
}

// Sort by most missing lines first
files.sort((a, b) => b.missingLines - a.missingLines);

console.log('--- Top 15 Files with Missing Code Coverage ---');
files.slice(0, 15).forEach(f => {
    console.log(`${f.file}: Missing Lines: ${f.missingLines} (${f.linesPct}%), Missing Branches: ${f.missingBranches} (${f.branchesPct}%)`);
});
