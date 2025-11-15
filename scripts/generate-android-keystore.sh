#!/bin/bash

# Script to generate Android keystore for app signing
# This should be run once and the keystore should be kept secure

echo "🔐 Android Keystore Generator"
echo "================================"
echo ""

# Check if keytool is available
if ! command -v keytool &> /dev/null; then
    echo "❌ Error: keytool not found. Please install Java JDK."
    exit 1
fi

# Prompt for details
read -p "Enter key alias (default: mizanpro): " KEY_ALIAS
KEY_ALIAS=${KEY_ALIAS:-mizanpro}

read -p "Enter keystore password: " -s KEYSTORE_PASSWORD
echo ""
read -p "Confirm keystore password: " -s KEYSTORE_PASSWORD_CONFIRM
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

read -p "Enter key password (press Enter to use same as keystore password): " -s KEY_PASSWORD
echo ""
KEY_PASSWORD=${KEY_PASSWORD:-$KEYSTORE_PASSWORD}

read -p "Enter your full name: " FULL_NAME
read -p "Enter your organization: " ORGANIZATION
read -p "Enter your city: " CITY
read -p "Enter your state/province: " STATE
read -p "Enter your country code (e.g., US, FR, MA): " COUNTRY

# Create keystores directory
mkdir -p android/app/keystores

# Generate keystore
echo ""
echo "🔨 Generating keystore..."

keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore android/app/keystores/release.keystore \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=$FULL_NAME, OU=$ORGANIZATION, O=$ORGANIZATION, L=$CITY, ST=$STATE, C=$COUNTRY"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "📝 Save these credentials securely:"
    echo "   Keystore file: android/app/keystores/release.keystore"
    echo "   Key alias: $KEY_ALIAS"
    echo "   Keystore password: $KEYSTORE_PASSWORD"
    echo "   Key password: $KEY_PASSWORD"
    echo ""
    echo "⚠️  IMPORTANT: Keep this keystore safe and never commit it to version control!"
    echo ""
    echo "To configure signing, create android/keystore.properties:"
    echo "   storeFile=keystores/release.keystore"
    echo "   storePassword=$KEYSTORE_PASSWORD"
    echo "   keyAlias=$KEY_ALIAS"
    echo "   keyPassword=$KEY_PASSWORD"
else
    echo "❌ Failed to generate keystore"
    exit 1
fi
