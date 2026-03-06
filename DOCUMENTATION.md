# Technical Documentation - LaCryptJS

Complete documentation for the LaCryptJS multi-layer encryption library for JavaScript.

## Table of Contents

1. [Overview](#overview)
2. [Usage Flow](#usage-flow)
3. [Installation](#installation)
4. [Complete API](#complete-api)
5. [Configuration](#configuration)
6. [Obfuscation Layers](#obfuscation-layers)
7. [Technical Specifications](#technical-specifications)
8. [Advanced Examples](#advanced-examples)

---

## Overview

LaCryptJS is a client-side encryption library that combines:

- **AES-256-GCM**: Authenticated encryption (AEAD) that prevents padding oracle attacks
- **PBKDF2-SHA256**: Key derivation with 310,000 iterations (OWASP 2025 standard)
- **Multiple obfuscation layers**: Base64, ROT13, XOR, Shuffle and Reverse

### Requirements

- Modern browser with Web Crypto API support
- Chrome 37+, Firefox 34+, Safari 11+, Edge 12+

---

## Usage Flow

The recommended flow for using LaCryptJS in systems with authentication:

### 1. Registration

During user registration, generate a unique key:

```javascript
// Option 1: Frontend generates the key
const userKey = await LaCryptJS.hash();
// Send userKey along with registration data to the backend

// Option 2: Backend generates the key with its own logic
// No need to use LaCryptJS.hash()
```

### 2. Login

After authentication, the server returns the user's key:

```javascript
const { user, encryptionKey } = await response.json();
sessionStorage.setItem('userKey', encryptionKey);
```

### 3. Encrypt

Before sending sensitive data:

```javascript
const userKey = sessionStorage.getItem('userKey');
const encryptedSSN = await LaCryptJS.encrypt(ssn, userKey);
```

### 4. Decrypt

When displaying data from the server:

```javascript
const userKey = sessionStorage.getItem('userKey');
const ssn = await LaCryptJS.decrypt(encryptedSSN, userKey);
```

### 5. Logout

Remove the key from the session:

```javascript
sessionStorage.removeItem('userKey');
```

### Diagram

```
REGISTRATION: [Generate key] --> [Store in database]
                                   |
LOGIN:        [Authenticate] --> [Return key] --> [sessionStorage]
                                                     |
USAGE:        [encrypt(data, key)] <--> [decrypt(data, key)]
                                                     |
LOGOUT:       [Remove key from sessionStorage]
```

---

## Installation

### Via CDN

```html
<script src="https://cdn.jsdelivr.net/gh/gmasson/lacryptjs@0.2.0/src/lacrypt.min.js"></script>
```

### Local Download

1. Download the `src/lacrypt.min.js` file
2. Include in your HTML:

```html
<script src="src/lacrypt.min.js"></script>
```

---

## Complete API

### encrypt(plaintext, password, [salt])

Encrypts text with AES-256-GCM and applies obfuscation layers.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| plaintext | string | Yes | Text to be encrypted |
| password | string | Yes | Encryption password (minimum 8 characters required) |
| salt | string | No | Custom salt in Base64. If omitted, it will be generated automatically |

**Returns:** `Promise<string>` - Encrypted data in Base64

**Exceptions:**
- `Error` if plaintext or password are invalid

```javascript
const encrypted = await LaCryptJS.encrypt('Sensitive data', 'strong-password-123');
```

---

### decrypt(encrypted, password)

Decrypts previously encrypted data.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| encrypted | string | Yes | Encrypted data returned by encrypt() |
| password | string | Yes | Same password used for encryption |

**Returns:** `Promise<string>` - Original decrypted text

**Exceptions:**
- `Error` if the password is incorrect or data is corrupted

```javascript
const decrypted = await LaCryptJS.decrypt(encrypted, 'strong-password-123');
```

---

### hash([data])

Generates a unique key for encryption based on multiple entropy sources.

**Usage:** Optional method to generate the user's encryption key during registration on the frontend. The developer can choose to use this method or create their own key generation logic on the backend.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | string | No | Optional data to add entropy (e.g., visitorId) |

**Returns:** `Promise<string>` - SHA-256 key in hexadecimal (64 characters)

**Internal composition:**
- `Date.now()` - Timestamp in milliseconds
- `Math.random().toString(36)` - Additional random value
- 32 random bytes via `crypto.getRandomValues()` (CSPRNG)
- UUID v4 generated via Web Crypto API
- Optional user-provided data

**Important:** Each call generates a different key, even with the same input, as it includes timestamp and random bytes.

```javascript
// On the frontend during registration:
const userKey = await LaCryptJS.hash();
// Send userKey along with registration data to the backend for storage

// With additional data for more entropy:
const userKey = await LaCryptJS.hash(visitorId);

// Example of generated key:
// "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
```

---

### encryptMultiLayer(plaintext, layers)

Encrypts with multiple sequential layers of protection.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| plaintext | string | Yes | Text to be encrypted |
| layers | Array<{password, salt?}> | Yes | Array of objects with password and optional salt |

**Returns:** `Promise<Object>` with properties:
- `encrypted`: Final encrypted data
- `metadata`: Layer metadata (required for decryption)
- `layers`: Number of layers applied

```javascript
const layers = [
  { password: 'first-layer-pass' },
  { password: 'second-layer-pass' },
  { password: 'third-layer-pass' }
];

const result = await LaCryptJS.encryptMultiLayer('Data', layers);
```

---

### decryptMultiLayer(data, passwords)

Decrypts data with multiple layers.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | Object | Yes | Object returned by encryptMultiLayer() |
| passwords | Array<string> | Yes | Passwords in the same order used for encryption |

**Returns:** `Promise<string>` - Original text

```javascript
const decrypted = await LaCryptJS.decryptMultiLayer(
  result,
  ['first-layer-pass', 'second-layer-pass', 'third-layer-pass']
);
```

---

### generateSalt()

Generates a cryptographically secure salt.

**Returns:** `string` - Salt in Base64 (32 bytes by default)

```javascript
const salt = LaCryptJS.generateSalt();
```

---

### configure(config)

Sets custom library configurations.

**Parameters:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| pbkdf2Iterations | number | 310000 | PBKDF2 iterations (minimum 10000) |
| saltSize | number | 32 | Salt size in bytes (minimum 16) |
| ivSize | number | 12 | IV size in bytes (minimum 12) |
| enableObfuscation | boolean | true | Enables obfuscation layers |
| obfuscationLayers | Array<string> | ['base64', 'reverse', 'rot13', 'xor', 'shuffle'] | Layers to apply |

```javascript
LaCryptJS.configure({
  pbkdf2Iterations: 500000,
  enableObfuscation: false
});
```

---

### getConfig()

Returns the current configuration.

**Returns:** `Object` - Active configuration

```javascript
const config = LaCryptJS.getConfig();
console.log(config.pbkdf2Iterations); // 310000
```

---

### inspect(encrypted)

Returns information about encrypted data without decrypting.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| encrypted | string | Yes | Encrypted data |

**Returns:** `Object` with properties:
- `version`: LaCryptJS version used
- `timestamp`: Encryption date/time
- `obfuscationLayers`: Applied obfuscation layers
- `hasSalt`: Whether it has a salt
- `format`: 'valid' or 'invalid'

```javascript
const info = LaCryptJS.inspect(encrypted);
console.log(info.version); // '0.2.0'
```

---

### VERSION

Static property with the current version.

```javascript
console.log(LaCryptJS.VERSION); // '0.2.0'
```

---

## Configuration

### Default Configuration

```javascript
{
  pbkdf2Iterations: 310000,  // OWASP 2025
  saltSize: 32,              // 256 bits
  ivSize: 12,                // 96 bits (GCM default)
  enableObfuscation: true,
  obfuscationLayers: ['base64', 'reverse', 'rot13', 'xor', 'shuffle']
}
```

### Performance Tuning

For slower devices, reduce iterations (less secure, minimum 10000):

```javascript
LaCryptJS.configure({ pbkdf2Iterations: 100000 });
```

For maximum security (slower):

```javascript
LaCryptJS.configure({ pbkdf2Iterations: 600000 });
```

### Disable Obfuscation

For compatibility or debugging:

```javascript
LaCryptJS.configure({ enableObfuscation: false });
```

---

## Obfuscation Layers

### Application Order

1. **Base64**: Encodes in Base64 (increases size by ~33%)
2. **Reverse**: Reverses character order
3. **ROT13**: Alphabetic substitution cipher
4. **XOR**: XOR operation with key derived from salt
5. **Shuffle**: Deterministic shuffling based on salt

### Customization

```javascript
// Only Base64 and XOR
LaCryptJS.configure({
  obfuscationLayers: ['base64', 'xor']
});
```

---

## Technical Specifications

### Encrypted Envelope Structure

```json
{
  "v": "0.2.0",
  "c": "encrypted_and_obfuscated_data",
  "i": "initialization_vector_base64",
  "s": "salt_base64",
  "o": ["base64", "reverse", "rot13", "xor", "shuffle"],
  "t": 1738857600000
}
```

### Algorithms

| Component | Algorithm | Specification |
|-----------|-----------|---------------|
| Encryption | AES-256-GCM | 256-bit key, 128-bit tag |
| Key Derivation | PBKDF2 | SHA-256, 310k iterations |
| Hash | SHA-256 | 256-bit output |
| Randomness | CSPRNG | Web Crypto API |

### Sizes

| Element | Size |
|---------|------|
| AES Key | 256 bits (32 bytes) |
| Salt | 256 bits (32 bytes) |
| IV | 96 bits (12 bytes) |
| GCM Tag | 128 bits (16 bytes) |
| Hash | 256 bits (64 hex chars) |

---

## Advanced Examples

### Complete Flow: Registration, Login and Usage

```javascript
// ========== REGISTRATION ==========
async function onRegister(userData) {
  // Option 1: Frontend generates the user's unique key
  const userKey = await LaCryptJS.hash();
  
  // Send along with registration data
  await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...userData, encryptionKey: userKey })
  });
  
  // Option 2: Backend generates the key with its own logic
  // In this case, no need to generate on the frontend
}

// ========== LOGIN ==========
async function onLogin(credentials) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  const { user, encryptionKey } = await response.json();
  
  // Store the key for use during the session
  sessionStorage.setItem('userKey', encryptionKey);
  
  return user;
}

// ========== SAVE SENSITIVE DATA ==========
async function saveSensitiveData(ssn, creditCard) {
  const userKey = sessionStorage.getItem('userKey');
  
  // Encrypt each sensitive field
  const data = {
    ssn: await LaCryptJS.encrypt(ssn, userKey),
    creditCard: await LaCryptJS.encrypt(creditCard, userKey)
  };
  
  await fetch('/api/user/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

// ========== LOAD SENSITIVE DATA ==========
async function loadSensitiveData() {
  const userKey = sessionStorage.getItem('userKey');
  
  const response = await fetch('/api/user/data');
  const { ssn: encSSN, creditCard: encCard } = await response.json();
  
  // Decrypt for display
  return {
    ssn: await LaCryptJS.decrypt(encSSN, userKey),
    creditCard: await LaCryptJS.decrypt(encCard, userKey)
  };
}

// ========== LOGOUT ==========
function onLogout() {
  sessionStorage.removeItem('userKey');
  window.location.href = '/login';
}
```

### E2E Messaging System

```javascript
class SecureMessaging {
  constructor(sharedSecret) {
    this.key = sharedSecret;
  }
  
  async send(message) {
    return await LaCryptJS.encrypt(message, this.key);
  }
  
  async receive(encrypted) {
    return await LaCryptJS.decrypt(encrypted, this.key);
  }
}

// Usage
const chat = new SecureMessaging(userKey);
const encrypted = await chat.send('Secret message');
const message = await chat.receive(encrypted);
```

### Secure Local Storage

```javascript
class SecureStorage {
  constructor(masterKey) {
    this.key = masterKey;
  }
  
  async set(name, value) {
    const encrypted = await LaCryptJS.encrypt(
      JSON.stringify(value),
      this.key
    );
    localStorage.setItem(name, encrypted);
  }
  
  async get(name) {
    const encrypted = localStorage.getItem(name);
    if (!encrypted) return null;
    
    const decrypted = await LaCryptJS.decrypt(encrypted, this.key);
    return JSON.parse(decrypted);
  }
  
  remove(name) {
    localStorage.removeItem(name);
  }
}
```

### Multi-Layer for Critical Data

```javascript
async function encryptCriticalData(data, userPassword, systemKey) {
  const layers = [
    { password: userPassword },
    { password: systemKey },
    { password: await LaCryptJS.hash(userPassword + systemKey) }
  ];
  
  return await LaCryptJS.encryptMultiLayer(data, layers);
}
```

---

## Error Handling

```javascript
try {
  const decrypted = await LaCryptJS.decrypt(data, password);
} catch (error) {
  if (error.message.includes('Decryption failed')) {
    // Incorrect password or corrupted data
    console.error('Unable to decrypt');
  }
}
```

---

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 37+ |
| Firefox | 34+ |
| Safari | 11+ |
| Edge | 12+ |
| Opera | 24+ |

Internet Explorer is not supported.

---

## References

- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [AES-GCM - NIST SP 800-38D](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
