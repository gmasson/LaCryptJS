# Security Policy

## Supported Versions

| Version | Support          |
| ------- | ---------------- |
| 0.2.x   | Yes              |
| 0.1.x   | Yes              |
| < 0.1   | No               |

## Reporting Vulnerabilities

LaCryptJS takes security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do not** open a public issue for security vulnerabilities
2. Send an email to the project maintainer with: lacryptjs@gabrielmasson.com.br
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- Acknowledgment of receipt within 72 hours
- Initial assessment within 14 days
- Progress updates every 30 days
- Credit in the fix (if desired)

### Scope

Relevant vulnerabilities include:

- Encryption bypass
- Key or sensitive data leakage
- Timing attacks
- Cryptographic weaknesses
- Issues in random number generation

### Out of Scope

- Attacks requiring physical access to the user's device
- Social engineering attacks
- Denial of service (DoS) in the browser
- Vulnerabilities in third-party dependencies (report to the relevant project)

## Security Practices

### Algorithms Used

- **Encryption**: AES-256-GCM (AEAD)
- **Key Derivation**: PBKDF2-SHA256 with 310,000 iterations
- **Hash**: SHA-256
- **Randomness**: Web Crypto API (crypto.getRandomValues)

### Usage Recommendations

1. Use strong passwords (minimum 12 characters)
2. Never store passwords in plain text
3. Use the `hash()` function to generate a unique key per user
4. Implement HTTPS in production
5. Do not rely solely on client-side encryption for critical data

### Known Limitations

- Client-side encryption does not replace server-side security
- JavaScript can be manipulated in man-in-the-middle attacks without HTTPS
- Weak passwords compromise all security
- Decrypted data is exposed in browser memory
- Encrypted data cannot be searched on the backend
- Data cannot be recovered if the password(s) are forgotten/deleted

## Responsible Disclosure

We follow coordinated disclosure practice:

1. Vulnerability reported and confirmed
2. Fix developed and tested
3. New version released
4. Public disclosure after update period (minimum 30 days)

We appreciate everyone who reports vulnerabilities responsibly.
