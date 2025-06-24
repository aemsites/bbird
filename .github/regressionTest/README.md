# Regression Tests

This directory contains regression tests for the project that run automatically on pull requests.

## Structure

```
.github/regressionTest/
├── regressionTest.js    # Main test script
├── results/            # Test results and reports
├── logs/              # Test execution logs
└── README.md          # This file
```

## Running Tests

### Locally
```bash
node .github/regressionTest/regressionTest.js
```

### Via GitHub Actions
Tests run automatically when:
- A pull request is opened
- New commits are pushed to a pull request
- A pull request is reopened

## Adding New Tests

To add new regression tests, edit `regressionTest.js` and add your test functions:

```javascript
function yourCustomTest() {
  // Your test logic here
  // Return true for pass, error message string for fail
  return true; // or "Error message"
}

// Then add it to the main() function:
runTest('Your test name', yourCustomTest);
```

## Test Results

- **Console Output**: Real-time test results in the console
- **Log Files**: Detailed logs saved to `logs/` directory
- **JSON Reports**: Test summaries saved to `results/` directory
- **GitHub Artifacts**: Results uploaded as workflow artifacts

## Exit Codes

- `0`: All tests passed
- `1`: One or more tests failed

## Example Test Functions

The script includes basic example tests:
- Package.json existence check
- Node modules installation check
- Basic project structure validation

Replace these with your actual regression test requirements.

## Path Considerations

Since this script is located in `.github/regressionTest/`, it uses relative paths to access project files:
- Project root: `../../` (two levels up from script location)
- Example: `path.join(__dirname, '..', '..', 'package.json')` 