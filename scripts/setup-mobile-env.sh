#!/bin/bash

# Script to set up mobile development environment

echo "📱 MizanPro Mobile Environment Setup"
echo "====================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js version $NODE_VERSION detected. Version 18 or higher is recommended."
fi

echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing npm dependencies..."
npm install

# Check Ruby (for Fastlane)
if ! command -v ruby &> /dev/null; then
    echo "⚠️  Ruby is not installed. Fastlane requires Ruby."
    echo "   Install Ruby 2.7 or higher: https://www.ruby-lang.org/"
else
    echo "✅ Ruby $(ruby -v | cut -d' ' -f2)"

    # Check Bundler
    if ! command -v bundle &> /dev/null; then
        echo "📦 Installing Bundler..."
        gem install bundler
    fi

    echo "✅ Bundler $(bundle -v | cut -d' ' -f3)"

    # Install Fastlane dependencies for iOS
    if [ -d "ios" ]; then
        echo ""
        echo "📦 Installing iOS dependencies..."
        cd ios
        bundle install
        cd ..
    fi

    # Install Fastlane dependencies for Android
    if [ -d "android" ]; then
        echo ""
        echo "📦 Installing Android dependencies..."
        cd android
        bundle install
        cd ..
    fi
fi

# Check for macOS-specific tools (iOS development)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        echo "⚠️  Xcode is not installed. Required for iOS development."
        echo "   Install from: https://developer.apple.com/xcode/"
    else
        echo "✅ Xcode $(xcodebuild -version | head -n 1 | cut -d' ' -f2)"
    fi

    # Check CocoaPods
    if ! command -v pod &> /dev/null; then
        echo "📦 Installing CocoaPods..."
        sudo gem install cocoapods
    else
        echo "✅ CocoaPods $(pod --version)"
    fi

    # Install iOS pods
    if [ -d "ios/App" ]; then
        echo ""
        echo "📦 Installing iOS pods..."
        cd ios/App
        pod install
        cd ../..
    fi
fi

# Check Java (for Android development)
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    echo "✅ Java $JAVA_VERSION"
else
    echo "⚠️  Java is not installed. Required for Android development."
    echo "   Install Java JDK 17: https://adoptium.net/"
fi

# Check Android SDK
if [ -n "$ANDROID_HOME" ]; then
    echo "✅ Android SDK at $ANDROID_HOME"
else
    echo "⚠️  ANDROID_HOME not set. Android development requires Android SDK."
    echo "   Install Android Studio: https://developer.android.com/studio"
fi

echo ""
echo "================================="
echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Build the web app: npm run build:mobile"
echo "2. Sync platforms: npx cap sync"
echo "3. Open in IDE:"
echo "   - iOS: npx cap open ios"
echo "   - Android: npx cap open android"
echo ""
echo "For deployment:"
echo "- Configure Fastlane: see docs/DEPLOYMENT.md"
echo "- Set up signing: see docs/SIGNING.md"
