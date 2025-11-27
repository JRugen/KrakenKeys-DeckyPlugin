#!/bin/bash

# Deployment script for KrakenKeys Decky Plugin
# 
# Usage:
#   1. Update STEAM_DECK_IP with your Steam Deck's IP address
#   2. Update PLUGIN_NAME if different from "krakenkeys"
#   3. Run: ./deploy.sh

STEAM_DECK_IP="192.168.0.188"  # ⚠️ REPLACE WITH YOUR STEAM DECK'S IP ADDRESS
PLUGIN_NAME="krakenkeys"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building plugin...${NC}"
pnpm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating plugin directory structure on Steam Deck...${NC}"
ssh deck@$STEAM_DECK_IP "mkdir -p ~/homebrew/plugins/$PLUGIN_NAME/dist"

echo -e "${YELLOW}Copying files to Steam Deck...${NC}"
scp dist/index.js deck@$STEAM_DECK_IP:~/homebrew/plugins/$PLUGIN_NAME/dist/
scp main.py plugin.json package.json deck@$STEAM_DECK_IP:~/homebrew/plugins/$PLUGIN_NAME/

if [ $? -ne 0 ]; then
    echo -e "${RED}File copy failed! Check your SSH connection.${NC}"
    exit 1
fi

echo -e "${YELLOW}Restarting Decky Loader...${NC}"
ssh deck@$STEAM_DECK_IP "systemctl --user restart plugin_loader.service"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployment complete!${NC}"
    echo -e "${GREEN}Your plugin should now be available in Game Mode.${NC}"
else
    echo -e "${RED}Failed to restart Decky Loader. You may need to restart it manually.${NC}"
fi

