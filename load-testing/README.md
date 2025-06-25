# Load Testing Module for bbird.live

A comprehensive load testing solution using Playwright for testing the [bbird.live](https://www.bbird.live/?rum=on) website with JavaScript execution capabilities.

## Features

- 🚀 **Real Browser Testing** - Uses Playwright for full browser automation
- 📊 **JavaScript Execution** - Executes JavaScript on the target pages
- 📈 **Comprehensive Metrics** - Response times, success rates, error tracking
- 📋 **Detailed Reporting** - HTML reports with charts and statistics
- ⚡ **Configurable Load** - Adjustable users, duration, and ramp-up
- 🎯 **User Simulation** - Realistic user interactions (scrolling, clicking)
- 📄 **CSV Export** - Detailed results in CSV format
- 🎨 **Beautiful Reports** - Interactive HTML reports with Chart.js

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup
```bash
# Navigate to the load-testing directory
cd load-testing

# Install dependencies
npm install

# Install Playwright browsers
npm run install:playwright
```

## Usage

### Quick Start
```bash
# Run a basic load test (10 users, 60 seconds)
npm test

# Run a light load test (5 users, 30 seconds)
npm run test:light

# Run a medium load test (20 users, 60 seconds)
npm run test:medium

# Run a heavy load test (50 users, 120 seconds)
npm run test:heavy
```

### Custom Configuration
```bash
# Custom number of users and duration
node load-test.js --users 25 --duration 90

# Custom ramp-up time
node load-test.js --users 30 --duration 120 --ramp-up 20

# Run with visible browser (not headless)
node load-test.js --users 5 --duration 30 --headless false

# Custom output filename
node load-test.js --users 10 --duration 60 --output my-test-results.csv
```

### Command Line Options
| Option | Description | Default |
|--------|-------------|---------|
| `-u, --users <number>` | Number of concurrent users | 10 |
| `-d, --duration <number>` | Test duration in seconds | 60 |
| `-r, --ramp-up <number>` | Ramp-up time in seconds | 10 |
| `--headless` | Run browsers in headless mode | true |
| `--output <filename>` | Output CSV filename | load-test-results.csv |

## What the Load Test Does

### 1. **Page Loading**
- Navigates to `https://www.bbird.live/?rum=on`
- Measures page load time
- Waits for network idle

### 2. **JavaScript Execution**
- Extracts page title and URL
- Captures viewport dimensions
- Collects performance metrics
- Executes user interactions

### 3. **User Interactions**
- Scrolls down the page
- Clicks on random links (if available)
- Measures interaction response times
- Collects performance data

### 4. **Performance Metrics**
- Page load time
- DOM content loaded time
- First paint and first contentful paint
- Navigation timing data

## Results and Reports

### Generated Files
```
load-testing/
├── results/
│   ├── load-test-results.csv          # Detailed CSV results
│   ├── metrics-1234567890.json        # JSON metrics data
│   └── load-test-report.html          # Interactive HTML report
```

### CSV Results Format
| Column | Description |
|--------|-------------|
| `timestamp` | ISO timestamp of the action |
| `user` | User ID (1, 2, 3, etc.) |
| `action` | Action type (page_load, link_click, performance_metrics) |
| `responseTime` | Response time in milliseconds |
| `status` | Success or failed |
| `error` | Error message (if any) |

### HTML Report Features
- 📊 **Interactive Charts** - Response time distribution
- 📈 **Performance Metrics** - Average, 95th/99th percentiles
- ✅ **Success Rate** - Overall test success percentage
- ⚙️ **Test Configuration** - All test parameters
- ❌ **Error Details** - Detailed error information
- 📋 **Detailed Statistics** - Min, max, throughput

## Example Output

```
🚀 Starting Load Test for bbird.live
Target URL: https://www.bbird.live/?rum=on
Users: 10
Duration: 60s
Ramp-up: 10s
Headless: true

Load Testing |████████████████████| 100% | 10/10 Users | ETA: 0s | User 10 completed

✅ Load Test Completed!
──────────────────────────────────────────────────
📊 Test Results:
   Total Time: 65.23s
   Total Requests: 30
   Successful: 29
   Failed: 1
   Success Rate: 96.67%

⏱️  Response Times:
   Average: 1245.67ms
   95th Percentile: 1890.45ms
   99th Percentile: 2100.12ms
   Min: 890.23ms
   Max: 2156.78ms

📄 Results saved to: ./results/load-test-results.csv
📊 Detailed metrics saved to: ./results/metrics-1703123456789.json
✅ Test passed: Success rate above 95%
```

## Generating Reports

```bash
# Generate HTML report from latest test results
npm run report

# Or run directly
node generate-report.js
```

## Advanced Configuration

### Custom User Simulation
Edit `load-test.js` to modify user behavior:

```javascript
// In simulateUserInteractions function
async function simulateUserInteractions(page, userId, results) {
  // Add custom interactions here
  await page.click('#specific-button');
  await page.fill('#search-input', 'test query');
  // ... more custom actions
}
```

### Custom Metrics Collection
```javascript
// Add custom metrics
const customMetrics = await page.evaluate(() => {
  return {
    customValue: window.someCustomProperty,
    apiCalls: window.apiCallCount || 0
  };
});
```

## Performance Considerations

### Resource Usage
- **Memory**: ~50-100MB per concurrent user
- **CPU**: Varies based on page complexity
- **Network**: Depends on page size and interactions

### Scaling Tips
- Start with small user counts (5-10)
- Gradually increase load
- Monitor system resources
- Use headless mode for better performance

### Browser Options
```javascript
// Custom browser launch options
const browser = await chromium.launch({ 
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
});
```

## Troubleshooting

### Common Issues

#### 1. **Playwright Installation**
```bash
# If browsers aren't installed
npx playwright install chromium

# Or install all browsers
npx playwright install
```

#### 2. **Permission Issues**
```bash
# On Linux/Mac, you might need
chmod +x load-test.js
chmod +x generate-report.js
```

#### 3. **Memory Issues**
- Reduce concurrent users
- Increase system memory
- Use headless mode
- Close other applications

#### 4. **Network Issues**
- Check internet connection
- Verify target URL accessibility
- Increase timeout values

### Debug Mode
```bash
# Run with visible browser for debugging
node load-test.js --users 1 --duration 30 --headless false
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Load Test
on: [push, pull_request]

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: |
          cd load-testing
          npm install
          npm run install:playwright
          npm run test:light
      - uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: load-testing/results/
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the generated logs
- Open an issue in the repository

---

**Happy Load Testing! 🚀** 