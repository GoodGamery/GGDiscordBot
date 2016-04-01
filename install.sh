#!/usr/bin/env bash
cp ggbot.service /etc/systemd/system
chmod 774 "./startup.sh"
chmod 774 "./watch.sh"
