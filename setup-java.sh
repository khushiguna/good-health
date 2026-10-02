#!/usr/bin/env bash
# ==============================================================================
# Java Environment Setup Helper for macOS
# Good Health and Well-Being Web Application
# ==============================================================================

echo "=================================================================="
echo " ☕ Java Environment Setup Assistant"
echo "=================================================================="

# Check if a functioning Java runtime is installed
if java -version >/dev/null 2>&1; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✅ Java is installed and active:"
    echo "   $JAVA_VERSION"
    echo ""
    echo "🚀 You can run the Java server directly with:"
    echo "   java HealthAppServer.java"
    exit 0
fi

echo "ℹ️  Java runtime is not yet installed on this Mac."
echo "   Choose one of the recommended methods below to install Java:"
echo ""
echo "------------------------------------------------------------------"
echo " Method 1: Download Official OpenJDK .pkg Installer (Easiest GUI)"
echo "------------------------------------------------------------------"
echo " 1. Download the macOS Apple Silicon (.pkg) installer from Adoptium:"
echo "    https://adoptium.net/temurin/releases/?os=mac&arch=aarch64&version=17"
echo " 2. Double-click the downloaded .pkg file and follow the installer steps."
echo " 3. Restart your terminal and run: java HealthAppServer.java"
echo ""
echo "------------------------------------------------------------------"
echo " Method 2: Install via Homebrew (If Homebrew is installed)"
echo "------------------------------------------------------------------"
echo " Run in your Terminal:"
echo "   brew install openjdk@17"
echo "   sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk"
echo ""
echo "------------------------------------------------------------------"
echo " Method 3: Run without installing Java right now"
echo "------------------------------------------------------------------"
echo " Node.js (v24) is already installed on your system! You can run immediately:"
echo "   npm start"
echo "   or:"
echo "   ./run.sh"
echo "   or:"
echo "   open index.html"
echo "=================================================================="
