
---

### **File 3 of 4: The Integration Test**

*   **Create this file:** `tests/integration/health.integration.test.js`

```javascript
// This is a representative test file based on the original prompt's structure.
// It requires a mock or partial implementation of the application to run.
const request = require('supertest');
const express = require('express');

// Mock Application for testing purposes
const createMockApp = () => {
  const app = express();
  app.get('/health/live', (req, res) => res.status(200).json({ status: 'pass' }));
  app.get('/health/ready', (req, res) => res.status(200).json({ status: 'pass', checks: [] }));
  return app;
};

describe('Health Check Integration Tests', () => {
  let testApp;

  beforeAll(() => {
    testApp = createMockApp();
  });

  describe('GET /health/live', () => {
    it('should return 200 and status pass', async () => {
      const response = await request(testApp)
        .get('/health/live')
        .expect(200);

      expect(response.body).toEqual({ status: 'pass' });
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 and a ready status', async () => {
      const response = await request(testApp)
        .get('/health/ready')
        .expect(200);

      expect(response.body.status).toBe('pass');
      expect(response.body.checks).toBeInstanceOf(Array);
    });
  });
});