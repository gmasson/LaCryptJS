# LaCryptJS

Multi-layer JavaScript encryption library for protecting sensitive data in the browser.

Combines AES-256-GCM with multiple obfuscation layers for end-to-end encryption in web applications, following OWASP 2025 recommendations.

## Installation

```html
<script src="https://cdn.jsdelivr.net/gh/gmasson/lacryptjs@main/src/lacrypt.min.js"></script>
```

Or download `src/lacrypt.min.js` and include it locally.

## Quick Start

### Encrypt and Decrypt

```javascript
// Encrypt
const encrypted = await LaCryptJS.encrypt('Sensitive data', 'secure-password');

// Decrypt
const decrypted = await LaCryptJS.decrypt(encrypted, 'secure-password');
```

### Generate Unique Key (Optional)

```javascript
// During user registration, the frontend can generate the unique key:
const userKey = await LaCryptJS.hash();
// Send userKey along with registration data to the backend for storage

// With additional data for more entropy:
const userKey = await LaCryptJS.hash(visitorId);
```

The `hash()` method is optional. The developer can use their own backend logic to generate the user's unique key.

### Multi-Layer Encryption

```javascript
const layers = [
  { password: 'password1' },
  { password: 'password2' }
];

const result = await LaCryptJS.encryptMultiLayer('Critical data', layers);
const original = await LaCryptJS.decryptMultiLayer(result, ['password1', 'password2']);
```

## When to Use

LaCryptJS is ideal for:

- **Systems with authentication**: Where each user has a unique key generated during registration and delivered by the server after login
- **Sensitive data protection**: SSN, credit cards, medical records, financial information
- **End-to-end encryption**: Data encrypted on the client, stored encrypted on the server
- **Database breach protection**: Even with database access, attackers cannot read the data
- **Secure user-to-user communication**: Private messages, chats, shared documents
- **Secure local storage**: Sensitive data in localStorage/sessionStorage

## When NOT to Use

LaCryptJS may not be suitable for:

- **Sites without authentication**: Without login, there is no secure way to deliver a unique key per user
- **Applications where the server needs to process the data**: If the backend needs to read/validate SSN, calculate with values, etc., client-side encryption prevents this
- **Protection against the server itself**: If the server is malicious, it can capture the key when delivering it
- **Replacing HTTPS**: LaCryptJS complements but does not replace secure connections
- **Data that needs to be indexed/searched**: Encrypted data cannot be searched in the database
- **Environments without Web Crypto API**: Very old browsers (IE) are not supported

### Important Limitations

1. **No login = no individual security**: On public sites, everyone would share the same key
2. **Key recovery**: If the user's key is lost, encrypted data is unrecoverable
3. **Performance**: Encryption adds overhead, especially with large data volumes
4. **Size**: Encrypted data is larger than the original (~40% more)

## Configuration

```javascript
// Adjust PBKDF2 iterations (default: 310000)
LaCryptJS.configure({ pbkdf2Iterations: 500000 });

// Disable obfuscation (for debugging)
LaCryptJS.configure({ enableObfuscation: false });

// View current configuration
console.log(LaCryptJS.getConfig());
```

## Documentation

For complete API documentation, advanced examples, and technical specifications, see [DOCUMENTATION.md](DOCUMENTATION.md).

## Security

- AES-256-GCM with integrated authentication (AEAD)
- PBKDF2-SHA256 with 310,000 iterations (OWASP 2025)
- Unique salt and IV per operation via Web Crypto API
- Zero external dependencies

To report vulnerabilities, see [SECURITY.md](SECURITY.md).

## Compatibility

Chrome 37+, Firefox 34+, Safari 11+, Edge 12+

Internet Explorer is not supported.

## License

MIT - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

