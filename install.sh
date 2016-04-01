#!/usr/bin/env bash
# Stop ggbot if it was running
systemctl stop ggbot
# Set permissions of file download directory
chmod -R 774 "./files/tmp/"
# Set up ggbot as a service
cp ggbot.service /etc/systemd/system
systemctl daemon-reload
# Start ggbot
systemctl start ggbot
