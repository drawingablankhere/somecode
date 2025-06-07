# Production VPD Controller (v5.1.0)

An enterprise-grade system for monitoring and controlling Vapor Pressure Deficit in grow environments. This version includes a hardened deployment process and an intelligent analytics engine for system optimization.

## Getting Started

This guide will get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

This project requires several system-level tools. Our automated setup process will check your environment and list any missing dependencies.

Key dependencies include:
-   Node.js (v18+) & NPM (v9+)
-   Docker & Docker Compose
-   Trivy & Gitleaks (for security scanning)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/production-vpd-controller.git
    cd production-vpd-controller
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```
    This command will automatically run a validation script (`./scripts/validate-env.sh`) to ensure your environment is set up correctly. Follow any instructions it provides.

3.  **Configure Secrets:**
    Create a `secrets` directory and populate it with the required secret files (e.g., `api-key`, `jwt-secret`). Use `scripts/secrets-manager.js` for advanced management.

4.  **Run the Application:**
    ```bash
    npm run docker:run
    ```

## Key Scripts

-   `npm run dev`: Start the application in development mode with auto-reloading.
-   `npm test`: Run the full test suite.
-   `npm run lint`: Lint the codebase for style errors.
-   `npm run deploy:dry-run`: Validate the entire deployment process without making changes. This is also run automatically before you `git push`.

## Intelligent Analytics Engine

This version includes a `ControlAnalyticsEngine` that actively monitors the system's performance. It can detect inefficiencies (e.g., a heater running at 100% but failing to meet the target temperature) and recommend hardware or configuration changes. These recommendations are exposed via the controller's status API endpoint.