# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-03-05

### Improved
- Replaced deprecated `escape()`/`unescape()` with `TextEncoder`/`TextDecoder` in obfuscation layers
- Protected `#buf2b64` against stack overflow with large buffers
- Added input validation to `configure()` method
- Added minimum password length validation (8 characters) in `encrypt()`
- Added per-layer password validation in `encryptMultiLayer()`
- Replaced inline `onclick` handlers with `addEventListener` in example

### Removed
- Dead code `#generateRandomChars()` method
- `CODE_OF_CONDUCT.md` (merged into CONTRIBUTING.md)

### Fixed
- Shuffle PRNG producing negative indices due to signed integer overflow
- Mixed language heading in DOCUMENTATION.md

---

## [0.1.0] - 2026-02-25

### Added
- AES-256-GCM encryption with integrated authentication (AEAD)
- PBKDF2-SHA256 key derivation with 310,000 iterations (OWASP 2025)
- Multiple obfuscation layers (Base64, ROT13, XOR, Shuffle, Reverse)
- `encrypt(plaintext, password, salt)` method for encryption
- `decrypt(encrypted, password)` method for decryption
- `encryptMultiLayer(plaintext, layers)` method for multi-layer encryption
- `decryptMultiLayer(data, passwords)` method for multi-layer decryption
- `hash(data)` method for unique encryption key generation
  - Combines timestamp, 32 random bytes (CSPRNG), UUID v4 and optional data
  - Returns 64-character hexadecimal SHA-256 hash
  - Each call generates a different key (even with the same input)
- `generateSalt()` method for secure salt generation
- `configure(config)` method for custom configuration
- `getConfig()` method to retrieve current configuration
- `inspect(encrypted)` method to inspect encrypted data
- Complete documentation in separate file (DOCUMENTATION.md)
- LICENSE file with MIT license
- CONTRIBUTING.md with contribution guidelines
- SECURITY.md with security policy
- Basic usage example in HTML (example.html)
