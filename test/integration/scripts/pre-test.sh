#!/usr/bin/env bash
CONFIG_FILE="${HOME}/.contentfulrc.json"
if [[ -f $CONFIG_FILE ]]; then
    echo "Backing up config file..."
    mv $CONFIG_FILE ~/.contentfulrc.json.backup
fi
