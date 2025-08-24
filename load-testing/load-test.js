#!/usr/bin/env node

const { chromium } = require('playwright');
const { program } = require('commander');
const chalk = require('chalk');
const cliProgress = require('cli-progress');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = 'https://www.bbird.live/?rum=on';
const RESULTS_DIR = './results';

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Parse command line arguments
program
  .option('-u, --users <number>', 'Number of concurrent users', '10')
  .option('-d, --duration <number>', 'Test duration in seconds', '60')
  .option('-r, --ramp-up <number>', 'Ramp-up time in seconds', '10')
  .option('--headless', 'Run browsers in headless mode', true)
  .option('--output <filename>', 'Output CSV filename', 'load-test-results.csv')
  .parse(process.argv);

const options = program.opts();

// Metrics collection
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  startTime: null,
  endTime: null
};

// CSV Writer setup
const csvWriter = createCsvWriter({
  path: path.join(RESULTS_DIR, options.output),
  header: [
    { id: 'timestamp', title: 'Timestamp' },
    { id: 'user', title: 'User' },
    { id: 'action', title: 'Action' },
    { id: 'responseTime', title: 'ResponseTime(ms)' },
    { id: 'status', title: 'Status' },
    { id: 'error', title: 'Error' }
  ]
});

// Progress bar
const progressBar = new cliProgress.SingleBar({
  format: 'Load Testing |{bar}| {percentage}% | {value}/{total} Users | ETA: {eta}s | {status}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

// User simulation function
async function simulateUser(userId, duration) {
  const browser = await chromium.launch({ 
    headless: options.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  const results = [];
  
  try {
    // Navigate to the target URL
    const startTime = Date.now();
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    results.push({
      timestamp: new Date().toISOString(),
      user: userId,
      action: 'page_load',
      responseTime: loadTime,
      status: 'success',
      error: ''
    });
    
    metrics.totalRequests++;
    metrics.successfulRequests++;
    metrics.responseTimes.push(loadTime);
    
    // Execute JavaScript on the page
    const pageData = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        performance: {
          navigationStart: performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd,
          domContentLoaded: performance.timing.domContentLoadedEventEnd
        }
      };
    });
    
    // Simulate user interactions
    await simulateUserInteractions(page, userId, results);
    
    // Wait for the specified duration
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    
  } catch (error) {
    console.error(chalk.red(`Error for user ${userId}:`), error.message);
    metrics.failedRequests++;
    metrics.errors.push({
      user: userId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    results.push({
      timestamp: new Date().toISOString(),
      user: userId,
      action: 'error',
      responseTime: 0,
      status: 'failed',
      error: error.message
    });
  } finally {
    await browser.close();
  }
  
  return results;
}

// Simulate user interactions
async function simulateUserInteractions(page, userId, results) {
  try {
    // Scroll down the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Click on links or buttons if they exist
    const links = await page.$$('a[href]');
    if (links.length > 0) {
      const randomLink = links[Math.floor(Math.random() * Math.min(links.length, 3))];
      const startTime = Date.now();
      
      try {
        await randomLink.click();
        const clickTime = Date.now() - startTime;
        
        results.push({
          timestamp: new Date().toISOString(),
          user: userId,
          action: 'link_click',
          responseTime: clickTime,
          status: 'success',
          error: ''
        });
        
        // Go back to original page
        await page.goBack();
        
      } catch (error) {
        results.push({
          timestamp: new Date().toISOString(),
          user: userId,
          action: 'link_click',
          responseTime: Date.now() - startTime,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    // Extract performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
        loadComplete: perf.loadEventEnd - perf.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    results.push({
      timestamp: new Date().toISOString(),
      user: userId,
      action: 'performance_metrics',
      responseTime: performanceMetrics.domContentLoaded,
      status: 'success',
      error: JSON.stringify(performanceMetrics)
    });
    
  } catch (error) {
    console.error(chalk.yellow(`Interaction error for user ${userId}:`), error.message);
  }
}

// Main load testing function
async function runLoadTest() {
  const numUsers = parseInt(options.users);
  const duration = parseInt(options.duration);
  const rampUp = parseInt(options.rampUp);
  
  console.log(chalk.blue('🚀 Starting Load Test for bbird.live'));
  console.log(chalk.gray(`Target URL: ${TARGET_URL}`));
  console.log(chalk.gray(`Users: ${numUsers}`));
  console.log(chalk.gray(`Duration: ${duration}s`));
  console.log(chalk.gray(`Ramp-up: ${rampUp}s`));
  console.log(chalk.gray(`Headless: ${options.headless}`));
  console.log('');
  
  metrics.startTime = new Date();
  progressBar.start(numUsers, 0, { status: 'Initializing...' });
  
  const allResults = [];
  const userPromises = [];
  
  // Ramp up users
  for (let i = 0; i < numUsers; i++) {
    const delay = (rampUp / numUsers) * i * 1000;
    
    const userPromise = new Promise(resolve => {
      setTimeout(async () => {
        const results = await simulateUser(i + 1, duration);
        allResults.push(...results);
        progressBar.update(i + 1, { status: `User ${i + 1} completed` });
        resolve();
      }, delay);
    });
    
    userPromises.push(userPromise);
  }
  
  // Wait for all users to complete
  await Promise.all(userPromises);
  
  progressBar.stop();
  metrics.endTime = new Date();
  
  // Calculate statistics
  const totalTime = metrics.endTime - metrics.startTime;
  const avgResponseTime = metrics.responseTimes.length > 0 
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length 
    : 0;
  
  const sortedResponseTimes = [...metrics.responseTimes].sort((a, b) => a - b);
  const p95 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.95)];
  const p99 = sortedResponseTimes[Math.floor(sortedResponseTimes.length * 0.99)];
  
  // Display results
  console.log(chalk.green('\n✅ Load Test Completed!'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.cyan('📊 Test Results:'));
  console.log(chalk.white(`   Total Time: ${(totalTime / 1000).toFixed(2)}s`));
  console.log(chalk.white(`   Total Requests: ${metrics.totalRequests}`));
  console.log(chalk.green(`   Successful: ${metrics.successfulRequests}`));
  console.log(chalk.red(`   Failed: ${metrics.failedRequests}`));
  console.log(chalk.white(`   Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`));
  console.log('');
  console.log(chalk.cyan('⏱️  Response Times:'));
  console.log(chalk.white(`   Average: ${avgResponseTime.toFixed(2)}ms`));
  console.log(chalk.white(`   95th Percentile: ${p95 ? p95.toFixed(2) : 'N/A'}ms`));
  console.log(chalk.white(`   99th Percentile: ${p99 ? p99.toFixed(2) : 'N/A'}ms`));
  console.log(chalk.white(`   Min: ${Math.min(...metrics.responseTimes).toFixed(2)}ms`));
  console.log(chalk.white(`   Max: ${Math.max(...metrics.responseTimes).toFixed(2)}ms`));
  
  // Save results to CSV
  try {
    await csvWriter.writeRecords(allResults);
    console.log(chalk.green(`\n📄 Results saved to: ${path.join(RESULTS_DIR, options.output)}`));
  } catch (error) {
    console.error(chalk.red('Error saving results:'), error.message);
  }
  
  // Save detailed metrics
  const metricsFile = path.join(RESULTS_DIR, `metrics-${Date.now()}.json`);
  fs.writeFileSync(metricsFile, JSON.stringify({
    testConfig: {
      url: TARGET_URL,
      users: numUsers,
      duration: duration,
      rampUp: rampUp,
      headless: options.headless
    },
    metrics: {
      ...metrics,
      statistics: {
        avgResponseTime,
        p95,
        p99,
        min: Math.min(...metrics.responseTimes),
        max: Math.max(...metrics.responseTimes)
      }
    }
  }, null, 2));
  
  console.log(chalk.green(`📊 Detailed metrics saved to: ${metricsFile}`));
  
  // Exit with appropriate code
  const successRate = metrics.successfulRequests / metrics.totalRequests;
  if (successRate < 0.95) {
    console.log(chalk.red('\n❌ Test failed: Success rate below 95%'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ Test passed: Success rate above 95%'));
    process.exit(0);
  }
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error);
  process.exit(1);
});

// Run the load test
if (require.main === module) {
  runLoadTest().catch(error => {
    console.error(chalk.red('Load test failed:'), error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, simulateUser }; 