#!/usr/bin/env node

/**
 * Regression Test Script
 * This script runs regression tests for the project
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  resultsDir: path.join(__dirname, 'results'),
  logsDir: path.join(__dirname, 'logs'),
  projectRoot: path.join(__dirname, '..', '..'),
  maxLogFileSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 5
};

// Create results and logs directories if they don't exist
[CONFIG.resultsDir, CONFIG.logsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Log rotation function
function rotateLogs() {
  const logFile = path.join(CONFIG.logsDir, `regression-test-${new Date().toISOString().split('T')[0]}.log`);
  
  if (fs.existsSync(logFile) && fs.statSync(logFile).size > CONFIG.maxLogFileSize) {
    // Rotate log file
    const backupFile = `${logFile}.${Date.now()}`;
    fs.renameSync(logFile, backupFile);
    
    // Keep only the most recent log files
    const logFiles = fs.readdirSync(CONFIG.logsDir)
      .filter(file => file.startsWith('regression-test-') && file.endsWith('.log'))
      .map(file => ({ name: file, time: fs.statSync(path.join(CONFIG.logsDir, file)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);
    
    // Remove old log files
    logFiles.slice(CONFIG.maxLogFiles).forEach(file => {
      fs.unlinkSync(path.join(CONFIG.logsDir, file.name));
    });
  }
}

// Log function with rotation
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  
  // Rotate logs if needed
  rotateLogs();
  
  // Write to log file
  const logFile = path.join(CONFIG.logsDir, `regression-test-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

// Test results storage
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: [],
  startTime: new Date(),
  endTime: null
};

// Test runner function
function runTest(testName, testFunction) {
  testResults.total++;
  log(`Running test: ${testName}`);
  
  const startTime = Date.now();
  
  try {
    const result = testFunction();
    const duration = Date.now() - startTime;
    
    if (result === true || result === undefined) {
      testResults.passed++;
      testResults.tests.push({ 
        name: testName, 
        status: 'PASSED', 
        duration: `${duration}ms` 
      });
      log(`✓ Test passed: ${testName} (${duration}ms)`, 'PASS');
    } else {
      testResults.failed++;
      testResults.tests.push({ 
        name: testName, 
        status: 'FAILED', 
        error: result,
        duration: `${duration}ms` 
      });
      log(`✗ Test failed: ${testName} - ${result} (${duration}ms)`, 'FAIL');
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    testResults.tests.push({ 
      name: testName, 
      status: 'ERROR', 
      error: error.message,
      duration: `${duration}ms` 
    });
    log(`✗ Test error: ${testName} - ${error.message} (${duration}ms)`, 'ERROR');
  }
}

// Example test functions - replace with your actual tests
function testPackageJsonExists() {
  const packageJsonPath = path.join(CONFIG.projectRoot, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return 'package.json not found';
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.name || !packageJson.version) {
      return 'package.json missing required fields (name, version)';
    }
    return true;
  } catch (error) {
    return `Invalid package.json: ${error.message}`;
  }
}

function testBasicProjectStructure() {
  const requiredDirs = ['blocks', 'styles', 'scripts'];
  const missingDirs = requiredDirs.filter(dir => !fs.existsSync(path.join(CONFIG.projectRoot, dir)));
  return missingDirs.length === 0 ? true : `Missing directories: ${missingDirs.join(', ')}`;
}

function testGitHubWorkflowExists() {
  const workflowPath = path.join(CONFIG.projectRoot, '.github', 'workflows', 'regression-tests.yaml');
  return fs.existsSync(workflowPath) ? true : 'GitHub workflow not found';
}

// Main execution
async function main() {
  log('Starting regression tests...');
  log(`Project root: ${CONFIG.projectRoot}`);
  log(`Node.js version: ${process.version}`);
  log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Run tests
  runTest('Package.json validation', testPackageJsonExists);
  runTest('Basic project structure', testBasicProjectStructure);
  runTest('GitHub workflow exists', testGitHubWorkflowExists);
  
  // Add your custom regression tests here
  // runTest('Your test name', yourTestFunction);
  
  testResults.endTime = new Date();
  const totalDuration = testResults.endTime - testResults.startTime;
  
  // Generate test report
  const report = {
    timestamp: testResults.startTime.toISOString(),
    duration: `${totalDuration}ms`,
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0
    },
    tests: testResults.tests,
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      nodeEnv: process.env.NODE_ENV || 'development',
      ci: process.env.CI === 'true'
    }
  };
  
  // Save report to results directory
  const reportFile = path.join(CONFIG.resultsDir, `test-report-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  // Log summary
  log(`Test Summary: ${testResults.passed}/${testResults.total} tests passed (${report.summary.successRate}%) in ${totalDuration}ms`);
  
  // Exit with appropriate code
  if (testResults.failed > 0) {
    log('Some tests failed!', 'ERROR');
    process.exit(1);
  } else {
    log('All tests passed!', 'SUCCESS');
    process.exit(0);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'ERROR');
  log(`Stack trace: ${error.stack}`, 'ERROR');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR');
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log(`Main function error: ${error.message}`, 'ERROR');
  log(`Stack trace: ${error.stack}`, 'ERROR');
  process.exit(1);
}); 