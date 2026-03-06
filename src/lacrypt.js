/*!
 * LaCryptJS v0.2.0
 * https://github.com/gmasson/lacryptjs
 */

/**
 * @fileoverview LaCryptJS - Multi-layer encryption library
 * @author gmasson <https://github.com/gmasson>
 * @version 0.2.0
 * @license MIT
 */

/**
 * @typedef {Object} EncryptionConfig
 * @property {number} pbkdf2Iterations - Number of PBKDF2 iterations (default: 310000)
 * @property {number} saltSize - Salt size in bytes (default: 32)
 * @property {number} ivSize - IV size in bytes (default: 12)
 * @property {boolean} enableObfuscation - Enable obfuscation layers (default: true)
 * @property {Array<string>} obfuscationLayers - Obfuscation layers to apply
 */

/**
 * @typedef {Object} EncryptedEnvelope
 * @property {string} v - Format version
 * @property {string} c - Encrypted ciphertext
 * @property {string} i - Initialization Vector (IV)
 * @property {string} s - Salt used for key derivation
 * @property {Array<string>} [o] - Applied obfuscation layers
 * @property {number} t - Creation timestamp
 */

/**
 * @typedef {Object} MultiLayerResult
 * @property {string} encrypted - Final encrypted data
 * @property {string} metadata - Metadata of applied layers
 * @property {number} layers - Number of applied layers
 */

/**
 * LaCryptJS - Multi-layer encryption library for JavaScript
 * 
 * Combines AES-256-GCM (AEAD) with multiple obfuscation layers
 * including Base64, character reversal, ROT13, XOR and shuffling.
 * 
 * @class
 */
class LaCryptJS {
  
  /**
   * Library version
   * @type {string}
   * @constant
   */
  static VERSION = '0.2.0';
  
  /**
   * @private
   * @type {EncryptionConfig}
   */
  static #config = {
    pbkdf2Iterations: 310000, // OWASP 2025 recommendation
    saltSize: 32,
    ivSize: 12,
    enableObfuscation: true,
    obfuscationLayers: ['base64', 'reverse', 'rot13', 'xor', 'shuffle']
  };
  
  /**
   * Configures library parameters
   * 
   * @param {Partial<EncryptionConfig>} config - Configuration to apply
   * @returns {void}
   */
  static configure(config) {
    if (config.pbkdf2Iterations !== undefined) {
      if (typeof config.pbkdf2Iterations !== 'number' || config.pbkdf2Iterations < 10000) {
        throw new Error('pbkdf2Iterations must be a number >= 10000');
      }
    }
    if (config.saltSize !== undefined) {
      if (typeof config.saltSize !== 'number' || config.saltSize < 16) {
        throw new Error('saltSize must be a number >= 16');
      }
    }
    if (config.ivSize !== undefined) {
      if (typeof config.ivSize !== 'number' || config.ivSize < 12) {
        throw new Error('ivSize must be a number >= 12');
      }
    }
    if (config.enableObfuscation !== undefined && typeof config.enableObfuscation !== 'boolean') {
      throw new Error('enableObfuscation must be a boolean');
    }
    if (config.obfuscationLayers !== undefined) {
      if (!Array.isArray(config.obfuscationLayers)) {
        throw new Error('obfuscationLayers must be an array');
      }
      const validLayers = ['base64', 'reverse', 'rot13', 'xor', 'shuffle'];
      for (const layer of config.obfuscationLayers) {
        if (!validLayers.includes(layer)) {
          throw new Error(`Invalid obfuscation layer: ${layer}`);
        }
      }
    }
    this.#config = { ...this.#config, ...config };
  }
  
  /**
   * Returns current configuration
   * 
   * @returns {EncryptionConfig} Active configuration
   */
  static getConfig() {
    return { ...this.#config };
  }
  
  // ============= CONVERSION UTILITIES =============
  
  /**
   * Converts string to ArrayBuffer
   * 
   * @private
   * @param {string} str - String to convert
   * @returns {Uint8Array} Resulting ArrayBuffer
   */
  static #str2buf(str) {
    return new TextEncoder().encode(str);
  }
  
  /**
   * Converts ArrayBuffer to string
   * 
   * @private
   * @param {ArrayBuffer|Uint8Array} buf - Buffer to convert
   * @returns {string} Resulting string
   */
  static #buf2str(buf) {
    return new TextDecoder().decode(buf);
  }
  
  /**
   * Converts ArrayBuffer to Base64
   * 
   * @private
   * @param {ArrayBuffer|Uint8Array} buf - Buffer to convert
   * @returns {string} Base64 string
   */
  static #buf2b64(buf) {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Converts Base64 to ArrayBuffer
   * 
   * @private
   * @param {string} b64 - Base64 string
   * @returns {Uint8Array} Resulting ArrayBuffer
   */
  static #b642buf(b64) {
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  }
  
  // ============= OBFUSCATION LAYERS =============
  
  /**
   * Applies additional Base64 encoding
   * 
   * @private
   * @param {string} data - Data to encode
   * @returns {string} Encoded data
   */
  static #obfBase64(data) {
    const bytes = new TextEncoder().encode(data);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Removes additional Base64 encoding
   * 
   * @private
   * @param {string} data - Encoded data
   * @returns {string} Original data
   */
  static #deobfBase64(data) {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
  
  /**
   * Reverses character order
   * 
   * @private
   * @param {string} data - String to reverse
   * @returns {string} Reversed string
   */
  static #obfReverse(data) {
    return data.split('').reverse().join('');
  }
  
  /**
   * Undoes character reversal
   * 
   * @private
   * @param {string} data - Reversed string
   * @returns {string} Original string
   */
  static #deobfReverse(data) {
    return data.split('').reverse().join('');
  }
  
  /**
   * Applies ROT13 cipher
   * 
   * @private
   * @param {string} data - Data to cipher
   * @returns {string} Ciphered data
   */
  static #obfROT13(data) {
    return data.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  }
  
  /**
   * Removes ROT13 cipher (it is its own inverse)
   * 
   * @private
   * @param {string} data - Ciphered data
   * @returns {string} Original data
   */
  static #deobfROT13(data) {
    return this.#obfROT13(data);
  }
  
  /**
   * Applies XOR with derived key
   * 
   * @private
   * @param {string} data - Data to process
   * @param {string} seed - Seed to generate XOR key
   * @returns {string} Processed data in hex
   */
  static #obfXOR(data, seed = 'lacrypt') {
    const key = seed.split('').map(c => c.charCodeAt(0));
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      result.push((data.charCodeAt(i) ^ key[i % key.length]).toString(16).padStart(2, '0'));
    }
    
    return result.join('');
  }
  
  /**
   * Removes XOR
   * 
   * @private
   * @param {string} data - Data in hex
   * @param {string} seed - Seed used in XOR
   * @returns {string} Original data
   */
  static #deobfXOR(data, seed = 'lacrypt') {
    const key = seed.split('').map(c => c.charCodeAt(0));
    const result = [];
    
    for (let i = 0; i < data.length; i += 2) {
      const byte = parseInt(data.substr(i, 2), 16);
      result.push(String.fromCharCode(byte ^ key[(i / 2) % key.length]));
    }
    
    return result.join('');
  }
  
  /**
   * Shuffles characters using deterministic shuffle
   * 
   * @private
   * @param {string} data - Data to shuffle
   * @param {string} seed - Seed to generate order
   * @returns {string} Shuffled data + map
   */
  static #obfShuffle(data, seed = 'lacrypt') {
    const chars = data.split('');
    const indices = chars.map((_, i) => i);
    
    // Fisher-Yates shuffle with seeded LCG PRNG
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (((hash << 5) - hash) + seed.charCodeAt(i)) >>> 0;
    }
    
    const rng = () => {
      hash = ((hash * 1664525 + 1013904223) >>> 0);
      return hash / 0x100000000;
    };
    
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const shuffled = indices.map(i => chars[i]).join('');
    const map = this.#buf2b64(this.#str2buf(JSON.stringify(indices)));
    
    return `${map}:${shuffled}`;
  }
  
  /**
   * Unshuffles characters
   * 
   * @private
   * @param {string} data - Shuffled data + map
   * @returns {string} Original data
   */
  static #deobfShuffle(data) {
    const [map, shuffled] = data.split(':');
    const indices = JSON.parse(this.#buf2str(this.#b642buf(map)));
    const chars = shuffled.split('');
    const result = new Array(chars.length);
    
    indices.forEach((originalIndex, shuffledIndex) => {
      result[originalIndex] = chars[shuffledIndex];
    });
    
    return result.join('');
  }
  
  /**
   * Applies all obfuscation layers
   * 
   * @private
   * @param {string} data - Data to obfuscate
   * @param {string} seed - Seed for layers that need it
   * @returns {Object} Obfuscated data and applied layers
   */
  static #applyObfuscation(data, seed) {
    if (!this.#config.enableObfuscation) {
      return { data, layers: [] };
    }
    
    let result = data;
    const layers = [];
    
    for (const layer of this.#config.obfuscationLayers) {
      switch (layer) {
        case 'base64':
          result = this.#obfBase64(result);
          layers.push('base64');
          break;
        case 'reverse':
          result = this.#obfReverse(result);
          layers.push('reverse');
          break;
        case 'rot13':
          result = this.#obfROT13(result);
          layers.push('rot13');
          break;
        case 'xor':
          result = this.#obfXOR(result, seed);
          layers.push('xor');
          break;
        case 'shuffle':
          result = this.#obfShuffle(result, seed);
          layers.push('shuffle');
          break;
      }
    }
    
    return { data: result, layers };
  }
  
  /**
   * Removes all obfuscation layers
   * 
   * @private
   * @param {string} data - Obfuscated data
   * @param {Array<string>} layers - Layers to remove (reverse order)
   * @param {string} seed - Seed used
   * @returns {string} Original data
   */
  static #removeObfuscation(data, layers, seed) {
    if (!layers || layers.length === 0) {
      return data;
    }
    
    let result = data;
    
    // Remove in reverse order
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      
      switch (layer) {
        case 'base64':
          result = this.#deobfBase64(result);
          break;
        case 'reverse':
          result = this.#deobfReverse(result);
          break;
        case 'rot13':
          result = this.#deobfROT13(result);
          break;
        case 'xor':
          result = this.#deobfXOR(result, seed);
          break;
        case 'shuffle':
          result = this.#deobfShuffle(result);
          break;
      }
    }
    
    return result;
  }
  
  // ============= ENCRYPTION =============
  
  /**
   * Generates cryptographically secure salt
   * 
   * @returns {string} Salt in Base64
   */
  static generateSalt() {
    return this.#buf2b64(crypto.getRandomValues(new Uint8Array(this.#config.saltSize)));
  }
  
  /**
   * Derives key using PBKDF2-SHA256
   * 
   * @private
   * @param {string} password - Base password
   * @param {string} salt - Salt for derivation
   * @param {Array<string>} keyUsage - Key usage
   * @returns {Promise<CryptoKey>} Derived key
   */
  static async #deriveKey(password, salt, keyUsage = ['encrypt', 'decrypt']) {
    const baseKey = await crypto.subtle.importKey(
      'raw',
      this.#str2buf(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: typeof salt === 'string' ? this.#b642buf(salt) : salt,
        iterations: this.#config.pbkdf2Iterations,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      keyUsage
    );
  }
  
  /**
   * Encrypts data with AES-256-GCM and multiple obfuscation layers
   * 
   * @param {string} plaintext - Text to encrypt
   * @param {string} password - Encryption password
   * @param {string} [salt=null] - Custom salt (optional)
   * @returns {Promise<string>} Encrypted data in Base64
   * @throws {Error} If parameters are invalid
   */
  static async encrypt(plaintext, password, salt = null) {
    try {
      // Input validation
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext');
      }
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      // Generate salt if not provided
      salt = salt || this.generateSalt();
      
      // Derive key
      const key = await this.#deriveKey(password, salt);
      
      // Random IV
      const iv = crypto.getRandomValues(new Uint8Array(this.#config.ivSize));
      
      // Encrypt with AES-GCM
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        key,
        this.#str2buf(plaintext)
      );
      
      // Apply obfuscation layers
      const cipherB64 = this.#buf2b64(encrypted);
      const { data: obfuscated, layers } = this.#applyObfuscation(cipherB64, salt);
      
      // Build envelope
      const envelope = {
        v: this.VERSION,
        c: obfuscated,
        i: this.#buf2b64(iv),
        s: salt,
        o: layers,
        t: Date.now()
      };
      
      return this.#buf2b64(this.#str2buf(JSON.stringify(envelope)));
      
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }
  
  /**
   * Decrypts data
   * 
   * @param {string} encrypted - Encrypted data
   * @param {string} password - Decryption password
   * @returns {Promise<string>} Original text
   * @throws {Error} If password is incorrect or data is corrupted
   */
  static async decrypt(encrypted, password) {
    try {
      // Validation
      if (!encrypted || typeof encrypted !== 'string') {
        throw new Error('Invalid data');
      }
      if (!password || typeof password !== 'string') {
        throw new Error('Invalid password');
      }
      
      // Parse envelope
      const envelope = JSON.parse(this.#buf2str(this.#b642buf(encrypted)));
      
      // Validate structure
      if (!envelope.v || !envelope.c || !envelope.i || !envelope.s) {
        throw new Error('Invalid format');
      }
      
      // Remove obfuscation
      const cipherB64 = this.#removeObfuscation(envelope.c, envelope.o, envelope.s);
      
      // Derive same key
      const key = await this.#deriveKey(password, envelope.s);
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: this.#b642buf(envelope.i),
          tagLength: 128
        },
        key,
        this.#b642buf(cipherB64)
      );
      
      return this.#buf2str(decrypted);
      
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
  
  /**
   * Encrypts with multiple sequential layers
   * 
   * @param {string} plaintext - Text to encrypt
   * @param {Array<{password: string, salt?: string}>} layers - Encryption layers
   * @returns {Promise<MultiLayerResult>} Result with multiple layers
   * @throws {Error} If layers are invalid
   */
  static async encryptMultiLayer(plaintext, layers) {
    if (!Array.isArray(layers) || layers.length === 0) {
      throw new Error('Invalid layers');
    }
    
    for (let i = 0; i < layers.length; i++) {
      if (!layers[i].password || typeof layers[i].password !== 'string') {
        throw new Error(`Invalid password in layer ${i + 1}`);
      }
    }
    
    let result = plaintext;
    const metadata = {
      v: this.VERSION,
      layers: layers.length,
      salts: [],
      timestamp: Date.now()
    };
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const salt = layer.salt || this.generateSalt();
      metadata.salts.push(salt);
      
      result = await this.encrypt(result, layer.password, salt);
    }
    
    return {
      encrypted: result,
      metadata: this.#buf2b64(this.#str2buf(JSON.stringify(metadata))),
      layers: layers.length
    };
  }
  
  /**
   * Decrypts multiple layers
   * 
   * @param {MultiLayerResult} data - Data with multiple layers
   * @param {Array<string>} passwords - Passwords in the same order as encryption
   * @returns {Promise<string>} Original text
   * @throws {Error} If the number of passwords does not match
   */
  static async decryptMultiLayer(data, passwords) {
    try {
      const metadata = JSON.parse(this.#buf2str(this.#b642buf(data.metadata)));
      
      if (!Array.isArray(passwords) || passwords.length !== metadata.layers) {
        throw new Error(`Expected ${metadata.layers} passwords, received ${passwords.length}`);
      }
      
      let result = data.encrypted;
      
      // Decrypt in reverse order
      for (let i = passwords.length - 1; i >= 0; i--) {
        result = await this.decrypt(result, passwords[i]);
      }
      
      return result;
      
    } catch (error) {
      throw new Error('Multi-layer decryption failed');
    }
  }
  
  /**
   * Returns information about encrypted data without decrypting
   * 
   * @param {string} encrypted - Encrypted data
   * @returns {Object} Envelope information
   */
  static inspect(encrypted) {
    try {
      const envelope = JSON.parse(this.#buf2str(this.#b642buf(encrypted)));
      
      return {
        version: envelope.v,
        timestamp: envelope.t ? new Date(envelope.t) : null,
        obfuscationLayers: envelope.o || [],
        hasSalt: !!envelope.s,
        format: 'valid'
      };
    } catch {
      return { format: 'invalid' };
    }
  }
  
  /**
   * Generates cryptographically secure UUID v4
   * 
   * @private
   * @returns {string} UUID in format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  static #generateUUID() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    
    const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  
  /**
   * Generates a unique key for encryption based on multiple entropy sources.
   * 
   * Optional method to generate the user's encryption key during registration.
   * The generated key should be stored on the backend and delivered to the frontend after each login.
   * 
   * The developer may choose to use this method or create their own key
   * generation logic on the backend.
   * 
   * Internal composition:
   * - High-precision timestamp
   * - 32 cryptographically secure random bytes
   * - UUID v4 generated via Web Crypto API
   * - Optional provided data (e.g., visitorId)
   * 
   * @param {string} [data=''] - Optional data to add entropy
   * @returns {Promise<string>} SHA-256 key in hexadecimal (64 characters)
   */
  static async hash(data = '') {
    const timestamp = `${Date.now()}-${Math.random().toString(36)}`;
    const randomBytes = this.#buf2b64(crypto.getRandomValues(new Uint8Array(32)));
    const uuid = this.#generateUUID();
    const input = data ? String(data) : '';
    
    const composition = `${timestamp}|${randomBytes}|${uuid}|${input}`;
    
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      this.#str2buf(composition)
    );
    
    return [...new Uint8Array(hashBuffer)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// Export for ES6 modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LaCryptJS;
}