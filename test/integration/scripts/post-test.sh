#!/usr/bin/env bash
BACKUP_CONFIG_FILE="${HOME}/.contentfulrc.json.backup"
if [[ -f $BACKUP_CONFIG_FILE ]]; then
    echo "Restoring config file..."
    mv $BACKUP_CONFIG_FILE ~/.contentfulrc.json
fi
