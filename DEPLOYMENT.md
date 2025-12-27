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

## Step 5: Configure Nginx as Reverse Proxy (Recommended)

Since port 80 is likely already in use, we'll use Nginx as a reverse proxy on port 80 that forwards to the Docker container on port 8082 (ports 8080 and 8081 are already in use by other containers).

### Check what's using port 80:
```bash
sudo netstat -tulpn | grep :80
# or
sudo lsof -i :80
```

### Option A: If Nginx is already installed (Recommended)

If Nginx is already running, create a new configuration:

```bash
sudo nano /etc/nginx/sites-available/robotic-dashboard
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name robotic-dashboard.nexussolutions.tech;

    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option B: If you need to install Nginx

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/robotic-dashboard
```

Add the same configuration as above.

### Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/robotic-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option C: Stop the service using port 80 (if not needed)

If you don't need the service using port 80, you can stop it:

```bash
# If it's Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# If it's another Nginx instance
sudo systemctl stop nginx
# Or remove the default site
sudo rm /etc/nginx/sites-enabled/default
```

Then update `docker-compose.yml` to use port 80 directly (change `8082:80` back to `80:80`).

## Step 6: Install SSL Certificate with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d robotic-dashboard.nexussolutions.tech

# Follow the prompts and Certbot will automatically configure SSL
```

The certificate will auto-renew. You can test renewal with:
```bash
sudo certbot renew --dry-run
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

