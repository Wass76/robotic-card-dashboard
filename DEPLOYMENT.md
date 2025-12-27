# Deployment Guide for Robotics Dashboard

This guide will help you deploy the Robotics Dashboard to your VPS at `robotic-dashboard.nexussolutions.tech`.

## Prerequisites

- VPS with Ubuntu/Debian (or similar Linux distribution)
- SSH access to your VPS
- Domain DNS A record pointing to your VPS IP
- Docker and Docker Compose installed on the VPS

## Step 1: Install Docker and Docker Compose on VPS

### Connect to your VPS via SSH:
```bash
ssh your-username@your-vps-ip
```

### Install Docker:
```bash
# Update package index
sudo apt update

# Install dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

**Note:** If you added your user to docker group, you'll need to log out and log back in for changes to take effect.

## Step 2: Transfer Project Files to VPS

### Option A: Using Git (Recommended)

```bash
# On VPS, clone your repository
cd ~
git clone <your-repository-url> robotics-dashboard-v3
cd robotics-dashboard-v3
```

### Option B: Using SCP (if not using Git)

```bash
# On your local machine
cd "D:\Robotic club"
scp -r robotics-dashboard-v3 your-username@your-vps-ip:~/
```

### Option C: Using rsync

```bash
# On your local machine
cd "D:\Robotic club"
rsync -avz --exclude 'node_modules' --exclude 'dist' robotics-dashboard-v3/ your-username@your-vps-ip:~/robotics-dashboard-v3/
```

## Step 3: Configure Environment Variables

Create a `.env` file in the project root on your VPS:

```bash
cd ~/robotics-dashboard-v3
nano .env
```

Add the following content (modify the API URL if needed):

```env
VITE_API_BASE_URL=https://api-cards-robotic-club.tech-sauce.com
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 4: Build and Run with Docker Compose

```bash
# Make sure you're in the project directory
cd ~/robotics-dashboard-v3

# Build and start the container
docker compose up -d --build

# Check if container is running
docker compose ps

# View logs
docker compose logs -f
```

## Step 5: Configure Nginx as Reverse Proxy with SSL (Recommended)

Since port 80 is likely already in use, we'll use Nginx as a reverse proxy on port 80 that forwards to the Docker container on port 8082 (ports 8080 and 8081 are already in use by other containers).

### Check what's using port 80:
```bash
sudo netstat -tulpn | grep :80
# or
sudo lsof -i :80
```

### Install Nginx (if not already installed):

```bash
sudo apt update
sudo apt install -y nginx
```

### Copy the Nginx configuration file:

The project includes a complete Nginx configuration file (`nginx-vps.conf`) with SSL support. Copy it to your VPS:

```bash
# If you're transferring files via SCP/rsync, the file should already be there
# Otherwise, create it manually or copy from the project
sudo cp ~/robotics-dashboard-v3/nginx-vps.conf /etc/nginx/sites-available/robotic-dashboard
```

### Or create the configuration manually:

```bash
sudo nano /etc/nginx/sites-available/robotic-dashboard
```

You can find the complete configuration in `nginx-vps.conf` in the project root. The key points:
- HTTP server (port 80) redirects to HTTPS and handles Let's Encrypt challenges
- HTTPS server (port 443) with SSL configuration
- Proxies to Docker container on `http://127.0.0.1:8082`
- Includes security headers, gzip compression, and proper SSL settings

### Create certbot directory (for Let's Encrypt validation):

```bash
sudo mkdir -p /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
```

### Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/robotic-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
```

If the test passes, reload Nginx:

```bash
sudo systemctl reload nginx
```

## Step 6: Install SSL Certificate with Let's Encrypt (Required for HTTPS)

### Install Certbot (if not already installed):

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Verify HTTP is Working First:

Before requesting SSL, make sure your Nginx configuration is correct and the site is accessible via HTTP:

```bash
# Test Nginx configuration
sudo nginx -t

# Check if the site is accessible via HTTP (should redirect to HTTPS)
curl -I http://robotic-dashboard.nexussolutions.tech
```

You should see a `301` redirect to HTTPS. If not, make sure:
1. DNS A record points to your VPS IP
2. Docker container is running on port 8082: `docker compose ps`
3. Nginx configuration is correct: `sudo nginx -t`

### Obtain SSL Certificate:

**Important:** Since we're using a custom Nginx configuration file, use `certonly` to obtain the certificate without modifying the config:

```bash
# Obtain certificate only (don't modify Nginx config)
sudo certbot certonly --nginx -d robotic-dashboard.nexussolutions.tech

# Follow the prompts:
# - Enter your email address
# - Agree to terms of service
# - Certbot will automatically validate the domain
```

**Alternative:** If the automatic method fails, use standalone mode (temporarily stops Nginx):

```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone -d robotic-dashboard.nexussolutions.tech
sudo systemctl start nginx
```

**Or use DNS validation** (useful if port 80 is not accessible):

```bash
sudo certbot certonly --manual --preferred-challenges dns -d robotic-dashboard.nexussolutions.tech
# Follow the prompts to add TXT record to your DNS
```

### Verify SSL Certificate Files:

After obtaining the certificate, verify the files exist:

```bash
sudo ls -la /etc/letsencrypt/live/robotic-dashboard.nexussolutions.tech/
```

You should see:
- `fullchain.pem` (SSL certificate)
- `privkey.pem` (Private key)
- `chain.pem` (Certificate chain)

### Verify SSL is Working:

The Nginx configuration already includes SSL settings. After obtaining the certificate, test:

```bash
# Test HTTPS connection
curl -I https://robotic-dashboard.nexussolutions.tech

# You should see HTTP/2 200 or similar success response
```

If you get SSL errors, make sure the certificate paths in `/etc/nginx/sites-available/robotic-dashboard` match the actual certificate location.

### Test Certificate Renewal:

Let's Encrypt certificates expire every 90 days, but Certbot automatically renews them. Test the renewal process:

```bash
sudo certbot renew --dry-run
```

### Manual Renewal (if needed):

```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Troubleshooting SSL Issues:

If you get certificate errors:

1. **Check if certificate exists:**
   ```bash
   sudo certbot certificates
   ```

2. **Check certificate expiration:**
   ```bash
   sudo openssl x509 -in /etc/letsencrypt/live/robotic-dashboard.nexussolutions.tech/fullchain.pem -noout -dates
   ```

3. **Verify certificate paths in Nginx config:**
   ```bash
   sudo grep -E "ssl_certificate|ssl_certificate_key" /etc/nginx/sites-available/robotic-dashboard
   ```
   Make sure they match the actual certificate location.

4. **If certificate is expired or missing, force renewal:**
   ```bash
   sudo certbot renew --force-renewal -d robotic-dashboard.nexussolutions.tech
   sudo systemctl reload nginx
   ```

5. **If Certbot fails, check Nginx error logs:**
   ```bash
   sudo tail -f /var/log/nginx/robotic-dashboard.error.log
   sudo tail -f /var/log/nginx/error.log
   ```

6. **Verify DNS is pointing correctly:**
   ```bash
   dig robotic-dashboard.nexussolutions.tech
   # Should show your VPS IP address
   ```

7. **Test Nginx configuration:**
   ```bash
   sudo nginx -t
   ```

## Step 7: Docker Container Port Configuration

The Docker container is configured to run on port 8082 (mapped to container port 80) to avoid conflicts with existing web servers. 

**Note:** Ports 8080 and 8081 are already in use by other containers (`nexus_portfolio` and `genius-planet-frontend`), so we're using port 8082.

If you stopped the service using port 80 and want to use port 80 directly, update `docker-compose.yml`:

```yaml
ports:
  - "80:80"  # Change from 8082:80 to 80:80
```

Then restart the container:
```bash
docker compose down
docker compose up -d --build
```

## Step 8: Verify Deployment

1. Visit `http://robotic-dashboard.nexussolutions.tech` (or `https://` if SSL is configured)
2. Check that the application loads correctly
3. Test the login functionality to ensure API connectivity

## Useful Docker Commands

```bash
# View logs
docker compose logs -f

# Stop the container
docker compose down

# Restart the container
docker compose restart

# Rebuild and restart (after code changes)
docker compose up -d --build

# View running containers
docker ps

# Execute commands inside container
docker compose exec robotics-dashboard sh

# Remove everything (containers, networks, volumes)
docker compose down -v
```

## Troubleshooting

### Container won't start:
```bash
# Check logs
docker compose logs

# Check if port 80 is already in use
sudo netstat -tulpn | grep :80
```

### Cannot connect to API:
- Verify `VITE_API_BASE_URL` in `.env` file is correct
- Check if the API server allows requests from your VPS IP
- Check browser console for CORS errors

### DNS not resolving:
- Wait for DNS propagation (can take up to 48 hours, usually faster)
- Verify A record is set correctly: `robotic-dashboard.nexussolutions.tech` -> your VPS IP
- Use `dig robotic-dashboard.nexussolutions.tech` or `nslookup robotic-dashboard.nexussolutions.tech` to verify

### SSL Certificate Issues:
- **Certificate expired or missing:** The subdomain needs its own SSL certificate (separate from main domain)
  ```bash
  # Check if certificate exists
  sudo certbot certificates
  
  # Request/renew certificate
  sudo certbot --nginx -d robotic-dashboard.nexussolutions.tech
  # Or force renewal if expired:
  sudo certbot renew --force-renewal -d robotic-dashboard.nexussolutions.tech
  sudo systemctl reload nginx
  ```
- **Certificate errors:** Make sure HTTP works first (`curl -I http://robotic-dashboard.nexussolutions.tech`)
- **Check certificate expiration:**
  ```bash
  sudo openssl x509 -in /etc/letsencrypt/live/robotic-dashboard.nexussolutions.tech/fullchain.pem -noout -dates
  ```
- **Verify port 80 is accessible** (required for Let's Encrypt verification)

### Permission denied errors:
```bash
# Fix permissions
sudo chown -R $USER:$USER ~/robotics-dashboard-v3
```

## Updating the Application

When you need to update the application:

```bash
# On your VPS
cd ~/robotics-dashboard-v3

# Pull latest changes (if using Git)
git pull

# Rebuild and restart
docker compose up -d --build
```

## Backup

Regular backups are recommended:

```bash
# Backup the project directory
tar -czf robotics-dashboard-backup-$(date +%Y%m%d).tar.gz ~/robotics-dashboard-v3
```

