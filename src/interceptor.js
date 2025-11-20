import config from './config.js';
import { logRequest, logKeyReplacement } from './logger.js';

/**
 * Intercepts and modifies proxy requests to replace API keys
 */
export class RequestInterceptor {
  constructor() {
    this.targetHost = 'generativelanguage.googleapis.com';
    this.apiKey = config.geminiApiKey;
  }

  /**
   * Check if this request should be intercepted
   */
  shouldIntercept(proxyReq) {
    const host = proxyReq.getHeader('host') || proxyReq.host;
    return host && host.includes(this.targetHost);
  }

  /**
   * Extract API key from request
   */
  extractOriginalKey(proxyReq, req) {
    // Check header
    const headerKey = proxyReq.getHeader('x-goog-api-key');
    if (headerKey) {
      return { source: 'header', key: headerKey };
    }

    // Check query parameter
    if (req.url && req.url.includes('key=')) {
      const match = req.url.match(/key=([^&]+)/);
      if (match) {
        return { source: 'query', key: match[1] };
      }
    }

    return null;
  }

  /**
   * Replace API key in request headers
   */
  replaceHeaderKey(proxyReq) {
    proxyReq.setHeader('x-goog-api-key', this.apiKey);
  }

  /**
   * Replace API key in query parameters
   */
  replaceQueryKey(req) {
    if (req.url && req.url.includes('key=')) {
      const originalUrl = req.url;
      req.url = req.url.replace(/key=([^&]+)/, `key=${this.apiKey}`);
      return originalUrl !== req.url;
    }
    return false;
  }

  /**
   * Main interception logic
   */
  intercept(proxyReq, req) {
    if (!this.shouldIntercept(proxyReq)) {
      return;
    }

    // Log incoming request
    const originalKey = this.extractOriginalKey(proxyReq, req);
    logRequest(req.method, `https://${this.targetHost}${req.url}`, originalKey?.key);

    // Replace API key in header
    const hadHeaderKey = proxyReq.getHeader('x-goog-api-key');
    this.replaceHeaderKey(proxyReq);

    // Replace API key in query params
    const hadQueryKey = this.replaceQueryKey(req);

    // Log replacement
    if (hadHeaderKey || hadQueryKey) {
      logKeyReplacement(originalKey?.key, this.apiKey);
    }

    // Set additional headers for better compatibility
    proxyReq.setHeader('User-Agent', 'Antigravity-Proxy/1.0');
  }
}

export default RequestInterceptor;
