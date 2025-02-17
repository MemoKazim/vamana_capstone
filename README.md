# VAMANA

## Installation

```
git clone https://github.com/memokazim/vamana_capstone
cd vamana_capstone
```

## NVM installation

```
sudo apt install curl
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.bashrc
nvm install node
```

## Setup

- After installation of nvm you need to configure environmental variables. To do that you are gonna need to export following variables in `~/.bashrc`:

```
export MONGODB_CLOUD = ""
export APPLICATION_PORT = 3000 # By default (consider nginx configuration)
export JWT_EXPIRES=6h
export JWT_SECRET=""
```

- Module installation and inital setup:

```
npm install
npm install pm2 -g
pm2 start server.js
```

- Test Deployment:

```
curl localhost:3000
```

If you see html code that means your code runs in `APPLICATION_PORT` you specified! :)

- Nginx Installation & Configuration:

```
# Installation
sudo apt install nginx
sudo systemctl enable --now nginx
curl localhost # Health Check

# Configuration
sudo cp nginx.conf /etc/nginx/sites-available/site.conf
sudo ln -s /etc/nginx/sites-available/site.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx
sudo service nginx restart # If systemctl did not worked!
```

Do not forget to change `include <path to whitelist>` to current folder path
