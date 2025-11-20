import http from 'http';
import https from 'https';
import net from 'net';
import { URL } from 'url';
import config from './config.js';
import { logStartup, logResponse, logError, logRequest } from './logger.js';
import logger from './logger.js';

// Track request timing
const requestTimings = new Map();

// Create HTTP server
const server = http.createServer((req, res) => {
  // Store start time
  const startTime = Date.now();
  requestTimings.set(req, startTime);
  
  // Parse the target URL
  let targetUrl;
  let targetHost;
  let targetPath;
  let targetPort;
  let targetProtocol;
  
  try {
    // Check if URL is absolute (http://example.com/path)
    if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
      targetUrl = new URL(req.url);
      targetHost = targetUrl.hostname;
      targetPort = targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80);
      targetPath = targetUrl.pathname + targetUrl.search;
      targetProtocol = targetUrl.protocol === 'https:' ? https : http;
    } else {
      // Relative URL - use Host header
      const host = req.headers.host;
      if (!host) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Bad Request: No Host header');
        return;
      }
      
      targetHost = host.split(':')[0];
      targetPort = host.split(':')[1] || 443;
      targetPath = req.url;
      targetProtocol = https; // Assume HTTPS for proxy requests
    }
    
    // Log the request
    logRequest(req.method, `https://${targetHost}${targetPath}`, req.headers['x-goog-api-key']);
    
    // Determine if this is a Gemini API request
    const isGeminiRequest = targetHost.includes('generativelanguage.googleapis.com');
    
    // Prepare request options
    const options = {
      hostname: targetHost,
      port: targetPort,
      path: targetPath,
      method: req.method,
      headers: { ...req.headers },
    };
    
    // Remove proxy-specific headers
    delete options.headers['proxy-connection'];
    delete options.headers['proxy-authorization'];
    
    // Intercept Gemini requests
    if (isGeminiRequest) {
      // Replace API key in headers
      if (options.headers['x-goog-api-key']) {
        const oldKey = options.headers['x-goog-api-key'];
        options.headers['x-goog-api-key'] = config.geminiApiKey;
        logger.info(`🔄 Replaced API key: ${oldKey.substring(0, 15)}*** → ${config.geminiApiKey.substring(0, 15)}***`);
      }
      
      // Replace API key in query string
      if (targetPath.includes('key=')) {
        options.path = targetPath.replace(/key=([^&]+)/, `key=${config.geminiApiKey}`);
        logger.info(`🔄 Replaced API key in URL query parameter`);
      }
    }
    
    // Make the request
    const proxyReq = targetProtocol.request(options, (proxyRes) => {
      // Calculate duration
      const duration = Date.now() - startTime;
      requestTimings.delete(req);
      
      // Log response
      logResponse(proxyRes.statusCode, duration);
      
      // Forward response headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe response data
      proxyRes.pipe(res);
    });
    
    // Handle errors
    proxyReq.on('error', (err) => {
      logError(err, {
        url: `https://${targetHost}${targetPath}`,
        method: req.method,
      });
      
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end(`Proxy Error: ${err.message}`);
      }
    });
    
    // Pipe request data
    req.pipe(proxyReq);
    
  } catch (err) {
    logError(err, {
      url: req.url,
      method: req.method,
    });
    
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Proxy Error: ${err.message}`);
    }
  }
});

// Handle CONNECT method for HTTPS tunneling
server.on('connect', (req, clientSocket, head) => {
  const startTime = Date.now();
  
  // Parse target host and port
  const { port, hostname } = new URL(`https://${req.url}`);
  const targetPort = port || 443;
  const targetHost = hostname;
  
  // Log the CONNECT request
  logger.info(`📡 CONNECT to ${targetHost}:${targetPort}`);
  
  // Determine if this is a Gemini API request
  const isGeminiRequest = targetHost.includes('generativelanguage.googleapis.com');
  
  if (isGeminiRequest) {
    logger.info(`🎯 Gemini API CONNECT detected - will intercept requests`);
  }
  
  // Connect to the target server
  const serverSocket = net.connect(targetPort, targetHost, () => {
    // Tell client connection is established
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    
    // Pipe data between client and server
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
    
    const duration = Date.now() - startTime;
    logger.info(`✅ CONNECT established to ${targetHost}:${targetPort} (${duration}ms)`);
  });
  
  // Handle errors
  serverSocket.on('error', (err) => {
    logError(err, {
      context: 'CONNECT error',
      target: `${targetHost}:${targetPort}`,
    });
    clientSocket.end();
  });
  
  clientSocket.on('error', (err) => {
    logError(err, {
      context: 'Client socket error',
      target: `${targetHost}:${targetPort}`,
    });
    serverSocket.end();
  });
});

// Handle server errors
server.on('error', (err) => {
  logError(err, { context: 'Server error' });
  process.exit(1);
});

// Start server
server.listen(config.proxyPort, () => {
  logStartup(config.proxyPort, config.geminiApiKey);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Shutting down proxy server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
