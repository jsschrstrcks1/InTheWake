# Cache Headers Configuration

This directory contains cache header configuration files for optimal performance.

## Problem

Google Search Console reported that assets were only cached for 10 minutes, causing users to re-download 1.5+ MB of assets every 10 minutes. Since all assets use versioned URLs (e.g., `styles.css?v=3.010.300`), they can be safely cached for 1 year.

## Solution

### Cache Duration Strategy

| Asset Type | Cache Duration | Reasoning |
|------------|---------------|-----------|
| CSS, JS with version query strings | 1 year (immutable) | Version number in URL allows cache busting |
| Images (webp, png, jpg, svg) | 1 year (immutable) | Optimized and versioned/rarely changed |
| JSON data files | 1 day (revalidate) | May update more frequently |
| HTML pages | 1 hour (revalidate) | Content updates regularly |
| Favicons, manifests | 30 days | Rarely change but not versioned |

### Files Provided

1. **`_headers`** - For Netlify hosting
2. **`.htaccess`** - For Apache servers
3. **`nginx-cache-headers.conf`** - For nginx servers

## Usage

### Netlify

The `_headers` file is automatically detected and applied by Netlify. No additional configuration needed.

### Apache

1. Ensure `mod_headers` and `mod_expires` are enabled:
   ```bash
   sudo a2enmod headers expires deflate
   sudo systemctl restart apache2
   ```

2. The `.htaccess` file will be automatically applied if `AllowOverride All` is set in your Apache config.

### Nginx

Add this to your `server` block in your nginx configuration:

```nginx
server {
    listen 80;
    server_name cruisinginthewake.com;
    root /var/www/html;

    # Include cache headers
    include /path/to/nginx-cache-headers.conf;

    # ... rest of your config
}
```

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Expected Performance Impact

**Before:**
- Assets cached for 10 minutes only
- Users re-download ~1.5 MB every 10 minutes
- Poor Page Speed scores

**After:**
- Versioned assets cached for 1 year
- Users only download assets on first visit or after version updates
- Significantly improved Page Speed scores
- Reduced bandwidth usage by ~95%

## Verification

After deploying, verify cache headers are working:

```bash
curl -I https://cruisinginthewake.com/assets/styles.css?v=3.010.300
```

Should show:
```
Cache-Control: public, max-age=31536000, immutable
```

## Security Headers Included

All configurations include security headers:
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Referrer-Policy: no-referrer-when-downgrade` - Privacy protection

---

Soli Deo Gloria
