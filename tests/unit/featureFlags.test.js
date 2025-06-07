// This is a representative test file based on the original prompt's structure.
// It requires a mock or partial implementation of the FeatureFlagManager to run.

// Mock FeatureFlagManager for testing purposes
class MockFeatureFlagManager {
  constructor(flags) {
    this.flags = flags || {};
  }
  isEnabled(flagName) {
    return this.flags[flagName] ? this.flags[flagName].enabled : false;
  }
}

describe('Feature Flag Logic', () => {
  it('should return true for an enabled feature', () => {
    const flags = {
      'test-feature': { enabled: true, rollout: 100 }
    };
    const featureManager = new MockFeatureFlagManager(flags);
    expect(featureManager.isEnabled('test-feature')).toBe(true);
  });

  it('should return false for a disabled feature', () => {
    const flags = {
      'test-feature': { enabled: false, rollout: 100 }
    };
    const featureManager = new MockFeatureFlagManager(flags);
    expect(featureManager.isEnabled('test-feature')).toBe(false);
  });

  it('should return false for a nonexistent feature', () => {
    const featureManager = new MockFeatureFlagManager({});
    expect(featureManager.isEnabled('nonexistent-feature')).toBe(false);
  });
});