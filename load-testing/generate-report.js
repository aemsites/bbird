#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const RESULTS_DIR = './results';

function generateReport() {
  console.log(chalk.blue('📊 Generating Load Test Report'));
  console.log(chalk.gray('─'.repeat(50)));
  
  // Find the latest metrics file
  const files = fs.readdirSync(RESULTS_DIR)
    .filter(file => file.startsWith('metrics-') && file.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    console.log(chalk.red('❌ No metrics files found. Run a load test first.'));
    process.exit(1);
  }
  
  const latestMetricsFile = files[0];
  const metricsPath = path.join(RESULTS_DIR, latestMetricsFile);
  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  
  // Generate HTML report
  const htmlReport = generateHTMLReport(metrics);
  const reportPath = path.join(RESULTS_DIR, 'load-test-report.html');
  fs.writeFileSync(reportPath, htmlReport);
  
  // Display summary
  displaySummary(metrics);
  
  console.log(chalk.green(`\n📄 HTML Report saved to: ${reportPath}`));
  console.log(chalk.gray('Open the HTML file in your browser to view detailed results.'));
}

function displaySummary(metrics) {
  const { testConfig, metrics: testMetrics } = metrics;
  const statistics = testMetrics.statistics;
  
  console.log(chalk.cyan('🔧 Test Configuration:'));
  console.log(chalk.white(`   URL: ${testConfig.url}`));
  console.log(chalk.white(`   Users: ${testConfig.users}`));
  console.log(chalk.white(`   Duration: ${testConfig.duration}s`));
  console.log(chalk.white(`   Ramp-up: ${testConfig.rampUp}s`));
  console.log(chalk.white(`   Headless: ${testConfig.headless}`));
  
  console.log(chalk.cyan('\n📈 Test Results:'));
  console.log(chalk.white(`   Total Requests: ${testMetrics.totalRequests}`));
  console.log(chalk.green(`   Successful: ${testMetrics.successfulRequests}`));
  console.log(chalk.red(`   Failed: ${testMetrics.failedRequests}`));
  console.log(chalk.white(`   Success Rate: ${((testMetrics.successfulRequests / testMetrics.totalRequests) * 100).toFixed(2)}%`));
  
  console.log(chalk.cyan('\n⏱️  Performance Metrics:'));
  console.log(chalk.white(`   Average Response Time: ${statistics.avgResponseTime.toFixed(2)}ms`));
  console.log(chalk.white(`   95th Percentile: ${statistics.p95 ? statistics.p95.toFixed(2) : 'N/A'}ms`));
  console.log(chalk.white(`   99th Percentile: ${statistics.p99 ? statistics.p99.toFixed(2) : 'N/A'}ms`));
  console.log(chalk.white(`   Min: ${statistics.min.toFixed(2)}ms`));
  console.log(chalk.white(`   Max: ${statistics.max.toFixed(2)}ms`));
  
  if (testMetrics.errors.length > 0) {
    console.log(chalk.red('\n❌ Errors:'));
    testMetrics.errors.forEach((error, index) => {
      console.log(chalk.red(`   ${index + 1}. User ${error.user}: ${error.error}`));
    });
  }
}

function generateHTMLReport(metrics) {
  const { testConfig, metrics: testMetrics } = metrics;
  const statistics = testMetrics.statistics;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report - bbird.live</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #667eea;
        }
        .card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.1em;
        }
        .card .value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .card .label {
            color: #666;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .success { border-left-color: #28a745; }
        .success .value { color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .warning .value { color: #ffc107; }
        .error { border-left-color: #dc3545; }
        .error .value { color: #dc3545; }
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        .errors {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
        }
        .error-item {
            background: white;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 3px solid #dc3545;
        }
        .timestamp {
            color: #666;
            font-size: 0.8em;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #dee2e6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Load Test Report</h1>
            <p>Performance analysis for ${testConfig.url}</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Test Summary</h2>
                <div class="grid">
                    <div class="card success">
                        <h3>Success Rate</h3>
                        <div class="value">${((testMetrics.successfulRequests / testMetrics.totalRequests) * 100).toFixed(1)}%</div>
                        <div class="label">${testMetrics.successfulRequests} / ${testMetrics.totalRequests} requests</div>
                    </div>
                    <div class="card">
                        <h3>Average Response Time</h3>
                        <div class="value">${statistics.avgResponseTime.toFixed(0)}ms</div>
                        <div class="label">Mean response time</div>
                    </div>
                    <div class="card">
                        <h3>95th Percentile</h3>
                        <div class="value">${statistics.p95 ? statistics.p95.toFixed(0) : 'N/A'}ms</div>
                        <div class="label">95% of requests faster than this</div>
                    </div>
                    <div class="card">
                        <h3>99th Percentile</h3>
                        <div class="value">${statistics.p99 ? statistics.p99.toFixed(0) : 'N/A'}ms</div>
                        <div class="label">99% of requests faster than this</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>⚙️ Test Configuration</h2>
                <div class="grid">
                    <div class="card">
                        <h3>Target URL</h3>
                        <div class="value">${testConfig.url}</div>
                        <div class="label">Tested endpoint</div>
                    </div>
                    <div class="card">
                        <h3>Concurrent Users</h3>
                        <div class="value">${testConfig.users}</div>
                        <div class="label">Simulated load</div>
                    </div>
                    <div class="card">
                        <h3>Test Duration</h3>
                        <div class="value">${testConfig.duration}s</div>
                        <div class="label">Total test time</div>
                    </div>
                    <div class="card">
                        <h3>Ramp-up Time</h3>
                        <div class="value">${testConfig.rampUp}s</div>
                        <div class="label">Gradual user increase</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>📈 Response Time Distribution</h2>
                <div class="chart-container">
                    <canvas id="responseTimeChart"></canvas>
                </div>
            </div>
            
            <div class="section">
                <h2>📋 Detailed Metrics</h2>
                <div class="grid">
                    <div class="card">
                        <h3>Minimum Response Time</h3>
                        <div class="value">${statistics.min.toFixed(0)}ms</div>
                        <div class="label">Fastest request</div>
                    </div>
                    <div class="card">
                        <h3>Maximum Response Time</h3>
                        <div class="value">${statistics.max.toFixed(0)}ms</div>
                        <div class="label">Slowest request</div>
                    </div>
                    <div class="card">
                        <h3>Total Test Time</h3>
                        <div class="value">${((new Date(testMetrics.endTime) - new Date(testMetrics.startTime)) / 1000).toFixed(1)}s</div>
                        <div class="label">Actual duration</div>
                    </div>
                    <div class="card">
                        <h3>Requests per Second</h3>
                        <div class="value">${(testMetrics.totalRequests / ((new Date(testMetrics.endTime) - new Date(testMetrics.startTime)) / 1000)).toFixed(1)}</div>
                        <div class="label">Throughput</div>
                    </div>
                </div>
            </div>
            
            ${testMetrics.errors.length > 0 ? `
            <div class="section">
                <h2>❌ Errors</h2>
                <div class="errors">
                    ${testMetrics.errors.map(error => `
                        <div class="error-item">
                            <strong>User ${error.user}</strong>
                            <div>${error.error}</div>
                            <div class="timestamp">${new Date(error.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>Report generated on ${new Date().toLocaleString()}</p>
            <p>Load testing performed with Playwright</p>
        </div>
    </div>
    
    <script>
        // Response time distribution chart
        const ctx = document.getElementById('responseTimeChart').getContext('2d');
        const responseTimes = ${JSON.stringify(testMetrics.responseTimes)};
        
        // Create histogram data
        const min = Math.min(...responseTimes);
        const max = Math.max(...responseTimes);
        const bucketCount = 20;
        const bucketSize = (max - min) / bucketCount;
        
        const buckets = new Array(bucketCount).fill(0);
        responseTimes.forEach(time => {
            const bucketIndex = Math.min(Math.floor((time - min) / bucketSize), bucketCount - 1);
            buckets[bucketIndex]++;
        });
        
        const labels = buckets.map((_, i) => {
            const start = min + i * bucketSize;
            const end = min + (i + 1) * bucketSize;
            return \`\${start.toFixed(0)}-\${end.toFixed(0)}ms\`;
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Requests',
                    data: buckets,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Requests'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Response Time Distribution'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
}

// Run the report generator
if (require.main === module) {
  generateReport();
}

module.exports = { generateReport }; 