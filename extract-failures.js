const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('jest_results.json', 'utf8'));
    const failures = [];
    data.testResults.forEach(suite => {
        if (suite.status === 'failed') {
            const suiteFailures = [];
            suite.assertionResults.forEach(res => {
                if (res.status === 'failed') {
                    suiteFailures.push({
                        test: res.title,
                        error: res.failureMessages[0].split('\n').slice(0, 3).join(' ')
                    });
                }
            });
            // Also catch suite-level errors if no assertion failed
            if (suiteFailures.length === 0 && suite.message) {
                suiteFailures.push({ test: 'Suite Level Error', error: suite.message.split('\n').slice(0, 3).join(' ') });
            }
            failures.push({
                suite: suite.name.replace(/.*src[\\\/]/, 'src/'),
                failures: suiteFailures
            });
        }
    });

    fs.writeFileSync('jest_failures_summary.json', JSON.stringify(failures, null, 2));
    console.log('Wrote', failures.length, 'failed suites to jest_failures_summary.json');
} catch (e) {
    console.error('Error parsing JSON:', e);
}
