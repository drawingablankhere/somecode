const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecretsManager {
  constructor(options = {}) {
    this.secretsPath = options.secretsPath || './secrets';
    this.configPath = options.configPath || './config';
    this.dryRun = options.dryRun || false;
    this.logger = options.logger || console;
  }

  async validateSecrets() {
    this.logger.info('🔐 Validating secrets configuration...');
    const errors = [];
    const warnings = [];

    // ... (logic before the loop is unchanged) ...

    for (const secret of expectedSecrets) {
      const secretPath = path.join(this.secretsPath, secret.name);

      try {
        const stats = await fs.stat(secretPath);
        // REFINED: Check file permissions. Warn if group or other has any permissions.
        if ((stats.mode & 0o077) !== 0) {
          warnings.push(`Insecure permissions for secret: ${secret.name}. Recommended: 'chmod 600 ${secretPath}'`);
        }

        const content = await fs.readFile(secretPath, 'utf8');
        const trimmedContent = content.trim();

        // ... (rest of the original validation logic for content is unchanged) ...

      } catch (error) {
        if (secret.required) {
          errors.push(`Required secret missing: ${secret.name}`);
        } else {
          warnings.push(`Optional secret missing: ${secret.name}`);
        }
      }
    }

    // ... (rest of the function is unchanged) ...
    return { errors, warnings };
  }
  // ... (rest of the file is unchanged) ...
}

// ... (CLI interface is unchanged) ...