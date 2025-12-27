# Quick Fix for Nginx SSL Cache Conflict

## Problem
You're getting: `shared memory zone "SSL" conflicts with already declared size`

## Quick Solution

### Option 1: Remove SSL Cache from Site Configs (Recommended)

Edit your site config files and **remove or comment out** the `ssl_session_cache` line:

**For `/etc/nginx/sites-available/nexussolutions.tech`:**
```bash
sudo nano /etc/nginx/sites-available/nexussolutions.tech
```

Find and **comment out** this line:
```nginx
# ssl_session_cache shared:SSL:50m;  # Remove or comment this line
```

Keep only:
```nginx
ssl_session_timeout 1d;
ssl_session_tickets off;
```

**For `/etc/nginx/sites-available/robotic-dashboard` (if it exists):**
```bash
sudo nano /etc/nginx/sites-available/robotic-dashboard
```

Do the same - comment out or remove the `ssl_session_cache` line.

### Option 2: Define SSL Cache Globally (Better Performance)

Edit the main Nginx config:
```bash
sudo nano /etc/nginx/nginx.conf
```

Inside the `http { }` block, add:
```nginx
http {
    # ... existing config ...
    
    # SSL Session Cache - Define once globally for all sites
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # ... rest of config ...
}
```

Then remove `ssl_session_cache` from all site configs.

### Option 3: Use Different Cache Names Per Site

If you can't modify global config, use unique names:

**nexussolutions.tech:**
```nginx
ssl_session_cache shared:SSL_Main:50m;
```

**robotic-dashboard.nexussolutions.tech:**
```nginx
ssl_session_cache shared:SSL_Robotics:10m;
```

## After Fixing:

```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

