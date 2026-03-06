# Contributing Guide

Thank you for your interest in contributing to LaCryptJS. This document describes the guidelines for contributions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has not already been reported in [Issues](https://github.com/gmasson/lacryptjs/issues)
2. If it does not exist, create a new issue with:
   - Clear and descriptive title
   - Steps to reproduce the problem
   - Expected behavior vs actual behavior
   - LaCryptJS version
   - Browser and version
   - Minimal code example that reproduces the problem

### Suggesting Improvements

1. Open an issue describing the improvement
2. Explain why this improvement would be useful
3. Provide usage examples, if applicable

### Submitting Pull Requests

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Make your changes following the code standards
4. Test your changes
5. Commit your changes (`git commit -m 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Open a Pull Request

## Code Standards

### JavaScript

- Use `const` by default, `let` when reassignment is necessary
- Never use `var`
- Use template literals for strings with interpolation
- Document public functions with JSDoc
- Private methods should use the `#` prefix
- Keep functions small and focused on a single responsibility

### Naming

- **Variables and functions**: camelCase
- **Classes**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case

### Commits

Use clear and descriptive commit messages:

- `Add` - for new features
- `Fix` - for bug fixes
- `Update` - for updates to existing code
- `Remove` - for code removals
- `Docs` - for documentation changes

Examples:
```
Add hash() method for unique key generation
Fix input validation in encrypt() method
Update PBKDF2 iteration count to 310000
```

## Security

- Never commit credentials, keys, or sensitive data
- Do not introduce external dependencies without prior discussion
- Changes to cryptographic algorithms require careful review
- Follow OWASP practices for security-related code

## Testing

Before submitting a PR:

1. Manually test all affected features
2. Verify compatibility with modern browsers (Chrome, Firefox, Safari, Edge)
3. Make sure there are no errors in the console
4. Test edge cases and error scenarios

## Documentation

- Update documentation when changing features
- Keep code examples functional
- Document breaking changes in the CHANGELOG

## Review Process

1. All PRs go through review
2. Changes may be requested
3. Once approved, the PR will be merged

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other members

Unacceptable behaviors include harassment, trolling, personal attacks, publishing private information without consent, or any conduct considered inappropriate in a professional setting. Project maintainers may remove contributions or ban participants who violate these standards.

Instances of unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed confidentially.

> Adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.1.

## Questions

If you have questions about how to contribute, open an issue with the `question` tag.
