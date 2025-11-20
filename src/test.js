import http from 'http';
import config from './config.js';
import chalk from 'chalk';

console.log(chalk.bold.cyan('\n🧪 Testing Antigravity Proxy\n'));
console.log(chalk.gray('━'.repeat(60)));

// Test configuration
const testConfig = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: '/v1beta/models',
  method: 'GET',
  headers: {
    'x-goog-api-key': 'fake_test_key_12345',
  },
};

console.log(`${chalk.bold('Testing proxy at:')} ${chalk.green(`http://localhost:${config.proxyPort}`)}`);
console.log(`${chalk.bold('Target API:')} ${chalk.blue(`https://${testConfig.hostname}`)}`);
console.log(`${chalk.bold('Test API Key:')} ${chalk.yellow('fake_test_key_12345')}`);
console.log(chalk.gray('━'.repeat(60)) + '\n');

// Create test request through proxy
const proxyRequest = http.request({
  hostname: 'localhost',
  port: config.proxyPort,
  path: `https://${testConfig.hostname}${testConfig.path}`,
  method: testConfig.method,
  headers: testConfig.headers,
}, (res) => {
  console.log(chalk.green(`✅ Response received: ${res.statusCode}`));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n${chalk.bold('Response preview:')}`);
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2).substring(0, 500) + '...');
    } catch (e) {
      console.log(data.substring(0, 500) + '...');
    }
    
    console.log(chalk.gray('\n' + '━'.repeat(60)));
    console.log(chalk.green('\n✅ Test completed!'));
    console.log(chalk.gray('\nCheck the proxy server logs to verify API key replacement.\n'));
  });
});

proxyRequest.on('error', (err) => {
  console.error(chalk.red('❌ Test failed:'), err.message);
  console.log(chalk.yellow('\n💡 Make sure the proxy server is running:'));
  console.log(chalk.gray('   npm start\n'));
  process.exit(1);
});

proxyRequest.end();
