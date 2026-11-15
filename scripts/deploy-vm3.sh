#!/usr/bin/env bash
set -e

VM_HOST="vm3"
REMOTE_DIR="/home/esv2/breakout-backend"

echo "=========================================="
echo " [VM3 Deploy] Deploying Breakout Backend  "
echo "=========================================="

echo "1. Checking SSH connection to $VM_HOST..."
ssh -o BatchMode=yes -o ConnectTimeout=8 "$VM_HOST" "echo 'SSH Connected to $(hostname)'"

echo "2. Preparing remote directory: $REMOTE_DIR"
ssh "$VM_HOST" "mkdir -p $REMOTE_DIR/data $REMOTE_DIR/src"

echo "3. Rsyncing backend files to $VM_HOST..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
  server/package.json \
  server/ecosystem.config.cjs \
  server/data/breakout.db \
  "$VM_HOST:$REMOTE_DIR/"

rsync -avz server/src/ "$VM_HOST:$REMOTE_DIR/src/"

echo "4. Installing dependencies and restarting PM2 process..."
ssh "$VM_HOST" "
  cd $REMOTE_DIR
  npm install --omit=dev --silent
  pm2 describe breakout-backend > /dev/null 2>&1 && pm2 reload breakout-backend || pm2 start ecosystem.config.cjs
  pm2 save
"

echo "5. Verifying remote health check..."
ssh "$VM_HOST" "curl -s http://localhost:4000/api/health"

echo ""
echo "=========================================="
echo " [VM3 Deploy] Deployment Complete!       "
echo "=========================================="
