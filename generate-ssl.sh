#!/bin/bash

echo "🔐 Generating SSL certificates for local HTTPS development..."

# Create SSL directory
mkdir -p client/ssl

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out client/ssl/localhost.key 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key client/ssl/localhost.key -out client/ssl/localhost.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Generate self-signed certificate
echo "📝 Generating self-signed certificate..."
openssl x509 -req -in client/ssl/localhost.csr -signkey client/ssl/localhost.key -out client/ssl/localhost.crt -days 365

# Set permissions
chmod 600 client/ssl/localhost.key
chmod 644 client/ssl/localhost.crt

echo "✅ SSL certificates generated successfully!"
echo "📁 Location: client/ssl/"
echo "🔑 Key: localhost.key"
echo "📜 Certificate: localhost.crt"
echo ""
echo "⚠️  Note: Self-signed certificates will show browser warnings."
echo "   Accept the warning to proceed with local development."
