#!/bin/bash
set -euo pipefail

# Default configuration
DRY_RUN=false
VERBOSE=false
SKIP_HEALTH_CHECK=false
ROLLBACK_ON_FAILURE=true
DEPLOY_TIMEOUT=600

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --verbose) VERBOSE=true; shift ;;
    --skip-health-check) SKIP_HEALTH_CHECK=true; shift ;;
    --no-rollback) ROLLBACK_ON_FAILURE=false; shift ;;
    --timeout) DEPLOY_TIMEOUT="$2"; shift; shift ;;
    --help)
      cat << EOF
Usage: $0 [OPTIONS]
Options:
  --dry-run              Validate deployment without making changes
  --verbose              Enable verbose output
  --skip-health-check    Skip post-deployment health checks
  --no-rollback          Don't rollback on deployment failure
  --timeout SECONDS      Deployment timeout (default: 600)
EOF
      exit 0
      ;;
    *) echo "Unknown option $1"; exit 1 ;;
  esac
done

# Colors for output
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m';
log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_debug() { if [[ "$VERBOSE" == "true" ]]; then echo -e "${BLUE}[DEBUG]${NC} $1"; fi; }

# Helper to check for a command and fail if not found
require_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "Required command '$1' is not installed."
        log_error "Please run 'npm run validate:env' to check your setup."
        if [[ "$DRY_RUN" == "false" ]]; then
            exit 1
        fi
        return 1
    fi
    return 0
}

run_security_scan() {
    log_info "Running security scans..."
    
    if require_command "trivy"; then
        log_info "Scanning Docker image for vulnerabilities..."
        if [[ "$DRY_RUN" == "true" ]]; then
            log_debug "DRY RUN: Would scan image with trivy"
        else
            docker-compose build vpd-controller
            local image_name=$(docker-compose config | grep "image:" | head -1 | awk '{print $2}')
            if [[ -n "$image_name" ]]; then
                trivy image --severity HIGH,CRITICAL --exit-code 1 "$image_name" || { log_error "Security vulnerabilities found in Docker image"; return 1; }
                log_debug "✓ No critical vulnerabilities found"
            fi
        fi
    else
        log_warn "Trivy not found. Skipping image vulnerability scan."
    fi
    
    if [[ -f "package.json" ]]; then
        log_info "Running NPM security audit..."
        if [[ "$DRY_RUN" == "true" ]]; then
            log_debug "DRY RUN: Would run npm audit"
        else
            npm audit --audit-level=high --production || { log_error "NPM security audit failed"; return 1; }
            log_debug "✓ NPM audit passed"
        fi
    fi
    
    if require_command "gitleaks"; then
        log_info "Scanning for potential secrets with Gitleaks..."
        if [[ "$DR