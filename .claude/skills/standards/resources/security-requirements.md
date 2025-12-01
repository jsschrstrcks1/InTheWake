# Security Requirements

**Version**: 1.0.0
**Last Updated**: 2025-11-24
**Purpose**: Comprehensive security best practices and requirements
**Line Count**: ~250 lines

---

## Security as Stewardship

> "Moreover, it is required of stewards that they be found faithful."
> — 1 Corinthians 4:2

Users trust us with their data, their privacy, and their security. We must steward that trust faithfully.

---

## Critical Security Rules

### 🚫 Never Commit Secrets

**Severity**: Error
**Scope**: All files

**Forbidden**:
```javascript
// ❌ NEVER DO THIS
const API_KEY = "sk_live_abc123def456";
const SECRET = "my-secret-token";
const PASSWORD = "admin123";
const TOKEN = "ghp_abc123def456";
```

**Why**:
- Git history is permanent
- Public repos expose secrets to the world
- Private repos can become public
- Attackers scan GitHub for exposed secrets

**What to Check For**:
- `api_key`, `apiKey`, `API_KEY`
- `secret`, `SECRET`
- `password`, `PASSWORD`, `pwd`
- `token`, `TOKEN`
- `private_key`, `privateKey`
- Actual key patterns: `sk_`, `ghp_`, `AIza`, etc.

**Correct Approach**:
```javascript
// ✅ Use environment variables
const API_KEY = process.env.API_KEY;

// ✅ Load from .env file (gitignored)
require('dotenv').config();
const SECRET = process.env.SECRET;

// ✅ Configuration file (gitignored)
const config = require('./config.local.js');
```

**If You Accidentally Commit a Secret**:
1. **Immediately revoke the secret** (rotate API key, change password)
2. **Do not just delete it in a new commit** (still in git history)
3. **Use git filter-branch or BFG Repo-Cleaner** to remove from history
4. **Force push** (after warning team)
5. **Assume the secret is compromised**

---

### 🚫 No eval() or Similar

**Severity**: Error
**Scope**: All JavaScript files

**Forbidden**:
```javascript
// ❌ Code injection risk
eval(userInput);
new Function(userInput);
setTimeout(userInput, 1000);
setInterval(userInput, 1000);
```

**Why**:
- Executes arbitrary code
- Major code injection vulnerability
- Attackers can run malicious JavaScript
- No safe way to sanitize input for eval

**Alternatives**:
```javascript
// ✅ Parse JSON safely
const data = JSON.parse(userInput);

// ✅ Use Function constructor with known code only
const fn = new Function('a', 'b', 'return a + b');

// ✅ Use setTimeout with function, not string
setTimeout(() => doSomething(), 1000);
```

---

### ⚠️ Sanitize innerHTML

**Severity**: Warning
**Scope**: All JavaScript files

**Dangerous**:
```javascript
// ⚠️ XSS vulnerability
element.innerHTML = userInput;
element.innerHTML = `<div>${userInput}</div>`;
```

**Why**:
- User input can contain `<script>` tags
- Attackers inject malicious code
- XSS (Cross-Site Scripting) attacks

**Alternatives**:
```javascript
// ✅ Use textContent for plain text
element.textContent = userInput;

// ✅ Create elements programmatically
const div = document.createElement('div');
div.textContent = userInput;
element.appendChild(div);

// ✅ If HTML is needed, sanitize first
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

---

### 🚫 No Debugging Code in Production

**Severity**: Error (debugger), Warning (console.log)

**Forbidden in Production**:
```javascript
// ❌ Exposes code flow
debugger;

// ⚠️ Leaks information
console.log('User data:', userData);
console.log('API response:', response);
console.error('Error:', error);
```

**Why**:
- `debugger` pauses execution in browser DevTools
- `console.log` exposes internal data in browser console
- Attackers use this information to understand code flow
- Performance impact

**Exceptions**:
```javascript
// ✅ Allowed in development tools
// admin/*.js
// dev/*.js
console.log('[Dev Tool] Processing...', data);

// ✅ Proper error logging
try {
  // code
} catch (error) {
  // Log to server, not console
  logErrorToServer(error);
}
```

---

## Input Validation

### Validate All User Input

**Severity**: Error
**Principle**: "Never trust user input"

**Server-Side Validation** (Critical):
```javascript
// ✅ Always validate on server
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regex.test(email)) {
    throw new Error('Invalid email');
  }
  return email.trim().toLowerCase();
}
```

**Client-Side Validation** (UX only):
```html
<!-- ✅ Client-side for user experience -->
<input type="email" required pattern="[^@]+@[^@]+\.[^@]+">
```

**Remember**: Client-side validation can be bypassed. Always validate server-side.

---

### SQL Injection Prevention

**Severity**: Error (if applicable)

**Dangerous**:
```javascript
// ❌ SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

**Safe**:
```javascript
// ✅ Use parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.execute(query, [userId]);

// ✅ Or use an ORM
const user = await User.findByPk(userId);
```

---

### Command Injection Prevention

**Severity**: Error

**Dangerous**:
```javascript
// ❌ Command injection
exec(`git clone ${userInput}`);
```

**Safe**:
```javascript
// ✅ Use array syntax
execFile('git', ['clone', userInput]);

// ✅ Or validate input strictly
const ALLOWED_REPOS = ['repo1', 'repo2'];
if (ALLOWED_REPOS.includes(userInput)) {
  exec(`git clone ${userInput}`);
}
```

---

## Authentication & Authorization

### Password Security

**Never Store Plain Text Passwords**:
```javascript
// ❌ NEVER
users.password = userPassword;

// ✅ Hash with bcrypt or similar
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(userPassword, 10);
users.password = hash;
```

### Session Security

**Secure Session Cookies**:
```javascript
// ✅ Secure session configuration
session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,    // Prevents JavaScript access
    secure: true,      // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000    // 1 hour
  }
})
```

### JWT Best Practices

```javascript
// ✅ Sign tokens properly
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// ✅ Verify tokens
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (err) {
  // Invalid token
}
```

---

## HTTPS & Transport Security

### Always Use HTTPS

**HTTP Headers**:
```javascript
// ✅ Force HTTPS
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});
```

**HSTS Header**:
```javascript
// ✅ HTTP Strict Transport Security
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Content Security Policy (CSP)

### Implement CSP Headers

```javascript
// ✅ Restrict resource loading
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self';"
  );
  next();
});
```

**Why**:
- Prevents XSS attacks
- Restricts where resources can load from
- Blocks inline scripts (unless allowed)

---

## Dependency Security

### Keep Dependencies Updated

```bash
# ✅ Check for vulnerabilities
npm audit

# ✅ Fix vulnerabilities
npm audit fix

# ✅ Update dependencies regularly
npm update
```

### Use Lock Files

```bash
# ✅ Commit lock files
git add package-lock.json
# or
git add yarn.lock
```

**Why**: Ensures consistent dependency versions across environments.

---

## Error Handling

### Don't Expose Stack Traces

**Dangerous**:
```javascript
// ❌ Exposes internal structure
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});
```

**Safe**:
```javascript
// ✅ Generic error messages to users
app.use((err, req, res, next) => {
  // Log full error server-side
  console.error(err.stack);

  // Send generic message to client
  res.status(500).json({
    error: 'Internal server error'
  });
});
```

---

## Rate Limiting

### Prevent Brute Force Attacks

```javascript
// ✅ Rate limit sensitive endpoints
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/login', loginLimiter, (req, res) => {
  // login logic
});
```

---

## CORS (Cross-Origin Resource Sharing)

### Configure CORS Properly

**Dangerous**:
```javascript
// ❌ Allows all origins
app.use(cors({ origin: '*' }));
```

**Safe**:
```javascript
// ✅ Whitelist specific origins
const allowedOrigins = [
  'https://cruisinginthewake.com',
  'https://cruisinginthewake.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## File Upload Security

### Validate File Uploads

```javascript
// ✅ Validate file type, size, name
const multer = require('multer');

const upload = multer({
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

**Never Trust Client-Provided Filenames**:
```javascript
// ✅ Generate safe filenames
const path = require('path');
const filename = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
```

---

## Security Checklist

### Before Every Commit

```
[ ] No API keys, tokens, passwords, or secrets
[ ] No debugger statements
[ ] No unnecessary console.log (especially with sensitive data)
[ ] No eval() or new Function() with user input
[ ] innerHTML usage is sanitized or replaced with textContent
[ ] All user input is validated
[ ] Error messages don't expose internal details
[ ] HTTPS is enforced (if applicable)
[ ] Dependencies are up to date (npm audit)
```

### For Production Deployment

```
[ ] All environment variables are set securely
[ ] HTTPS is configured with valid certificate
[ ] CSP headers are set
[ ] CORS is configured (not '*')
[ ] Rate limiting is enabled on sensitive endpoints
[ ] Error handling doesn't expose stack traces
[ ] Logging doesn't include sensitive data
[ ] Security headers are set (HSTS, X-Frame-Options, etc.)
[ ] Dependencies have no known vulnerabilities
```

---

## Security Resources

**OWASP Top 10**: https://owasp.org/www-project-top-ten/
**Security Headers**: https://securityheaders.com/
**Node.js Security**: https://nodejs.org/en/docs/guides/security/
**npm Security**: https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities

---

## Remember

Security is stewardship. We protect users because we love them as image-bearers of God.

**1 Corinthians 4:2**
> "Moreover, it is required of stewards that they be found faithful."

Be faithful with the trust users place in us.

---

**End of security-requirements.md** (~250 lines)
