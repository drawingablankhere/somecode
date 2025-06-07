#!/bin/bash
#
# This script validates that all required system-level dependencies are installed.
# It is intended to be run by developers setting up the project for the first time.

echo "🔍 Validating development environment..."
echo "-------------------------------------"

has_error=false

# Helper function to check for a command and provide installation hints.
check_command() {
    printf "Checking for %-15s... " "$1"
    if ! command -v "$1" &> /dev/null; then
        printf "❌ Not Found\n"
        printf "   ➡️  %s\n" "$2"
        has_error=true
    else
        local version_cmd="$3"
        local version=""
        if [[ -n "$version_cmd" ]]; then
            version=$(eval "$version_cmd" 2>/dev/null | head -n 1)
        fi
        printf "✅ Found %s\n" "$version"
    fi
}

# --- Dependency Checks ---
check_command "node" "Please install Node.js v18 or higher." "node -v"
check_command "npm" "Please install npm v9 or higher." "npm -v"
check_command "docker" "Please install Docker (e.g., via Docker Desktop)." "'docker --version'"
check_command "docker-compose" "Please install Docker Compose (usually included with Docker Desktop)." "'docker-compose --version'"
check_command "trivy" "Please install Trivy for security scanning. See: https://github.com/aquasecurity/trivy" "'trivy --version'"
check_command "gitleaks" "Please install Gitleaks for secret scanning. See: https://github.com/gitleaks/gitleaks" "'gitleaks version'"
check_command "python3" "Please install Python 3." "'python3 --version'"

echo "-------------------------------------"

if [[ "$has_error" == "true" ]]; then
    echo "❌ Validation failed. Please install the missing dependencies listed above."
    exit 1
fi

echo "✅ Your environment has all the required dependencies!"
exit 0