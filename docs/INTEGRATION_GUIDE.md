# Integration Guide: Control Analytics Engine

This guide explains how to integrate the new `ControlAnalyticsEngine` into your main controller application.

### 1. Initialization

In your main `ProductionVPDController` class, import and instantiate the engine.

```javascript
// In src/controller.js (or similar)
const { ControlAnalyticsEngine } = require('./logic/ControlAnalyticsEngine');

class ProductionVPDController {
  constructor(dependencies) {
    // ... other dependencies
    this.config = dependencies.config;
    this.analyticsEngine = new ControlAnalyticsEngine(this.config);
    this.recommendations = [];
  }
}