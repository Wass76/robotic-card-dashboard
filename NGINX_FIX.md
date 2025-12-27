# Nginx Configuration Fix Guide

## Problem
You're getting these errors:
1. `protocol options redefined for 0.0.0.0:443` - Multiple server blocks listening on the same port
2. `shared memory zone "SSL" conflicts` - SSL cache defined multiple times with different sizes

## Solution

### Step 1: Define SSL Cache Globally (Recommended)

Edit the main Nginx config file:

```bash
sudo nano /etc/nginx/nginx.conf
```

Inside the `http { }` block, add (or update) the SSL cache definition:

```nginx
http {
    # ... existing configuration ...
    
    # SSL Session Cache - Define once globally
    ssl_session_cache shared:SSL:50m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # ... rest of configuration ...
}
```

### Step 2: Remove SSL Cache from Individual Site Configs

In each site configuration file (`/etc/nginx/sites-available/*`), you should **remove** these lines:

```nginx
# Remove these lines from site configs:
ssl_session_cache shared:SSL:50m;  # Remove this
```

Keep only:
```nginx
ssl_session_timeout 1d;
ssl_session_tickets off;
```

### Step 3: Check for Duplicate Server Blocks

Check what sites are enabled:

```bash
ls -la /etc/nginx/sites-enabled/
```

Make sure each domain has only ONE configuration file enabled.

### Step 4: Check for Port Conflicts

Search for duplicate listen directives:

```bash
sudo grep -r "listen 443" /etc/nginx/sites-enabled/
sudo grep -r "listen \[::\]:443" /etc/nginx/sites-enabled/
```

Each `server_name` should have only one `listen 443` directive.

### Step 5: Alternative - Use Different Cache Names

If you can't modify the global config, use unique cache names in each site config:

**For nexussolutions.tech:**
```nginx
ssl_session_cache shared:SSL_Main:50m;
```

**For robotic-dashboard.nexussolutions.tech:**
```nginx
ssl_session_cache shared:SSL_Robotics:10m;
```

But this is less efficient - defining globally is better.

### Step 6: Test and Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Quick Fix Commands

```bash
# 1. Check what's in sites-enabled
ls -la /etc/nginx/sites-enabled/

# 2. Check for SSL cache conflicts
sudo grep -r "ssl_session_cache shared" /etc/nginx/sites-enabled/

# 3. Check for duplicate listen directives
sudo grep -r "listen 443" /etc/nginx/sites-enabled/

# 4. Check main nginx.conf for SSL cache definition
sudo grep -A 2 -B 2 "ssl_session_cache" /etc/nginx/nginx.conf

# 5. After fixing, test
sudo nginx -t
```

