import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

dotenv.config({ path: join(rootDir, '.env') });

// Validate required configuration
function validateConfig() {
  const errors = [];

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    errors.push('GEMINI_API_KEY is not configured. Please set it in .env file');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration Error:');
    errors.forEach(err => console.error(`   - ${err}`));
    console.error('\n💡 Copy .env.example to .env and configure your API key:');
    console.error('   cp .env.example .env\n');
    process.exit(1);
  }
}

// Configuration object
const config = {
  // API Configuration
  geminiApiKey: process.env.GEMINI_API_KEY,
  targetApiUrl: process.env.TARGET_API_URL || 'https://generativelanguage.googleapis.com',
  
  // Proxy Configuration
  proxyPort: parseInt(process.env.PROXY_PORT || '8080', 10),
  
  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Antigravity Configuration
  antigravityPath: process.env.ANTIGRAVITY_PATH || '/Applications/Antigravity.app/Contents/MacOS/Antigravity',
  
  // Paths
  rootDir,
  logsDir: join(rootDir, 'logs'),
};

// Validate before exporting
validateConfig();

export default config;
