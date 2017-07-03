# Proxy Test Utilities

## Generate localhost certs

```sh
openssl req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 \
-keyout test/proxy/certs/localhost.key -out test/proxy/certs/localhost.crt
```

## Start the Proxy

```sh
# HTTP proxy
$ node run-server.js

# HTTPS proxy
$ node run-server.js --ssl
```

## Issue a CMA call through the started proxy

```sh
$ node client.js [--ssl] --token 'CFPAT-123...789' --space 'cfexample'
```
