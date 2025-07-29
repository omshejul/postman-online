/**
 * Security utilities for API Tester
 * Handles request validation, sanitization, and security checks
 */

// List of dangerous protocols that should be blocked
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'file:', 'ftp:', 'vbscript:'];

// List of sensitive headers that should be handled carefully
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'access-token',
  'refresh-token'
];

// Common injection patterns to detect
const INJECTION_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /vbscript:/gi
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SecurityConfig {
  allowedProtocols: string[];
  maxUrlLength: number;
  maxHeaderCount: number;
  maxHeaderValueLength: number;
  maxBodySize: number;
  blockDangerousContent: boolean;
  warnOnSensitiveHeaders: boolean;
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowedProtocols: ['http:', 'https:'],
  maxUrlLength: 2048,
  maxHeaderCount: 50,
  maxHeaderValueLength: 8192,
  maxBodySize: 10 * 1024 * 1024, // 10MB
  blockDangerousContent: true,
  warnOnSensitiveHeaders: true,
};

/**
 * Validates a URL for security and format correctness
 */
export function validateUrl(url: string, config: Partial<SecurityConfig> = {}): ValidationResult {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!url || url.trim().length === 0) {
    errors.push('URL is required');
    return { isValid: false, errors, warnings };
  }

  // Length check
  if (url.length > mergedConfig.maxUrlLength) {
    errors.push(`URL exceeds maximum length of ${mergedConfig.maxUrlLength} characters`);
  }

  // Protocol validation
  try {
    const parsedUrl = new URL(url);
    
    if (!mergedConfig.allowedProtocols.includes(parsedUrl.protocol)) {
      errors.push(`Protocol '${parsedUrl.protocol}' is not allowed. Allowed protocols: ${mergedConfig.allowedProtocols.join(', ')}`);
    }

    // Check for dangerous protocols
    if (DANGEROUS_PROTOCOLS.some(protocol => url.toLowerCase().includes(protocol))) {
      errors.push('URL contains potentially dangerous protocol');
    }

    // Check for localhost/private IP warnings in production
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      if (parsedUrl.hostname === 'localhost' || 
          parsedUrl.hostname.startsWith('127.') ||
          parsedUrl.hostname.startsWith('192.168.') ||
          parsedUrl.hostname.startsWith('10.') ||
          parsedUrl.hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
        warnings.push('Requesting localhost/private IP from production environment');
      }
    }

    // Check for potential SSRF targets
    if (parsedUrl.hostname === '0.0.0.0' || parsedUrl.hostname === '[::]') {
      errors.push('Requests to wildcard addresses are not allowed');
    }

  } catch (error) {
    errors.push('Invalid URL format');
  }

  // Content injection check
  if (mergedConfig.blockDangerousContent) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(url)) {
        errors.push('URL contains potentially dangerous content');
        break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates HTTP headers
 */
export function validateHeaders(
  headers: Array<{ key: string; value: string }>, 
  config: Partial<SecurityConfig> = {}
): ValidationResult {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  // Count check
  if (headers.length > mergedConfig.maxHeaderCount) {
    errors.push(`Too many headers. Maximum allowed: ${mergedConfig.maxHeaderCount}`);
  }

  for (const header of headers) {
    if (!header.key || !header.value) continue;

    // Header name validation
    if (!/^[a-zA-Z0-9\-_]+$/.test(header.key)) {
      errors.push(`Invalid header name: '${header.key}'. Only alphanumeric characters, hyphens, and underscores are allowed`);
    }

    // Header value length check
    if (header.value.length > mergedConfig.maxHeaderValueLength) {
      errors.push(`Header '${header.key}' value exceeds maximum length of ${mergedConfig.maxHeaderValueLength} characters`);
    }

    // Sensitive header warning
    if (mergedConfig.warnOnSensitiveHeaders) {
      if (SENSITIVE_HEADERS.includes(header.key.toLowerCase())) {
        warnings.push(`Header '${header.key}' contains sensitive information. Ensure it's necessary and secure`);
      }
    }

    // Content injection check
    if (mergedConfig.blockDangerousContent) {
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(header.value)) {
          errors.push(`Header '${header.key}' contains potentially dangerous content`);
          break;
        }
      }
    }

    // Check for null bytes and control characters
    if (/[\x00-\x1f\x7f]/.test(header.value)) {
      errors.push(`Header '${header.key}' contains invalid control characters`);
    }
  }

  // Check for duplicate headers
  const headerNames = headers.map(h => h.key.toLowerCase()).filter(Boolean);
  const duplicates = headerNames.filter((name, index) => headerNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    warnings.push(`Duplicate headers detected: ${[...new Set(duplicates)].join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates request body content
 */
export function validateBody(body: string, config: Partial<SecurityConfig> = {}): ValidationResult {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!body || body.trim().length === 0) {
    return { isValid: true, errors, warnings };
  }

  // Size check
  const bodySize = new Blob([body]).size;
  if (bodySize > mergedConfig.maxBodySize) {
    errors.push(`Request body exceeds maximum size of ${Math.round(mergedConfig.maxBodySize / 1024 / 1024)}MB`);
  }

  // Content injection check
  if (mergedConfig.blockDangerousContent) {
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(body)) {
        errors.push('Request body contains potentially dangerous content');
        break;
      }
    }
  }

  // JSON validation if content appears to be JSON
  const trimmedBody = body.trim();
  if (trimmedBody.startsWith('{') || trimmedBody.startsWith('[')) {
    try {
      JSON.parse(trimmedBody);
    } catch (error) {
      warnings.push('Request body appears to be JSON but is not valid JSON format');
    }
  }

  // Check for potential secrets in body
  const secretPatterns = [
    /(?:password|pwd|pass)\s*[:=]\s*["']?[^"'\s]+/gi,
    /(?:api[_-]?key|apikey)\s*[:=]\s*["']?[^"'\s]+/gi,
    /(?:secret|token)\s*[:=]\s*["']?[^"'\s]+/gi,
    /sk_[a-zA-Z0-9]{24,}/g, // Stripe secret keys
    /pk_[a-zA-Z0-9]{24,}/g, // Stripe public keys (less sensitive but still worth noting)
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(body)) {
      warnings.push('Request body may contain sensitive information (passwords, API keys, etc.)');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates an entire API request
 */
export function validateRequest(
  url: string,
  method: string,
  headers: Array<{ key: string; value: string }>,
  body: string,
  config: Partial<SecurityConfig> = {}
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate URL
  const urlValidation = validateUrl(url, config);
  errors.push(...urlValidation.errors);
  warnings.push(...urlValidation.warnings);

  // Validate method
  const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  if (!allowedMethods.includes(method.toUpperCase())) {
    errors.push(`HTTP method '${method}' is not supported`);
  }

  // Validate headers
  const headerValidation = validateHeaders(headers, config);
  errors.push(...headerValidation.errors);
  warnings.push(...headerValidation.warnings);

  // Validate body (only for methods that typically have a body)
  if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    const bodyValidation = validateBody(body, config);
    errors.push(...bodyValidation.errors);
    warnings.push(...bodyValidation.warnings);
  } else if (body && body.trim().length > 0) {
    warnings.push(`HTTP ${method} requests typically should not have a request body`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitizes a string to prevent XSS and other injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[\x00-\x1f\x7f]/g, ''); // Remove control characters
}

/**
 * Creates a CSP-compliant nonce for inline scripts
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): number {
    const requests = this.requests.get(identifier) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }
}