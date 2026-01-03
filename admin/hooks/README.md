# Git Hooks - In the Wake

## Installation

Copy hooks to your local `.git/hooks/` directory:

```bash
cp admin/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Available Hooks

### pre-commit

Security-focused pre-commit hook that checks for:

1. **Forbidden File Types**
   - `.env`, `.pem`, `.key`, `.sql`, `credentials.*`, etc.
   - BLOCKS commit if found

2. **Secret Patterns**
   - API keys, passwords, tokens, private keys
   - WARNS but allows commit (with confirmation)

3. **DOM XSS Danger Sinks** (Smart Detection)
   - `innerHTML` usage - checks if `escapeHtml()` is used
     - ✅ PASSES if dynamic values use `escapeHtml()`
     - ⚠️ WARNS if unescaped `${}` interpolation detected
     - Suggests adding `escapeHtml()` function if missing
   - Dynamic `href` attributes - checks for `sanitizeUrl()`
   - `eval()` calls - BLOCKS commit
   - `document.write()` - BLOCKS commit

4. **Analytics Requirement**
   - Checks HTML files for Google Analytics
   - Checks HTML files for Umami Analytics
   - WARNS if missing

## Bypassing (Emergency Only)

```bash
git commit --no-verify -m "Emergency fix"
```

**Note:** Only use `--no-verify` for genuine emergencies. All security checks should pass under normal circumstances.

## Updating Hooks

When hooks are updated in `admin/hooks/`, re-run the installation command to update your local hooks.
