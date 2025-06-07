/**
 * @typedef {import('production-vpd-controller').ControllerConfig} ControllerConfig
 * @typedef {import('production-vpd-controller').SystemRecommendation} SystemRecommendation
 */

/**
 * Analyzes control loop performance to identify inefficiencies and recommend improvements.
 */
class ControlAnalyticsEngine {
  /**
   * @param {ControllerConfig} config The main application configuration.
   */
  constructor(config) {
    this.config = config;
    this.history = {
      temperature: [],
      humidity: [],
    };
  }

  /**
   * Analyzes the current state of the system against its targets and recent history.
   * @param {object} currentState The current state from the controller.
   * @returns {SystemRecommendation[]} An array of recommendations.
   */
  analyze(currentState) {
    /** @type {SystemRecommendation[]} */
    const recommendations = [];
    const { target } = this.config;
    const { avgTemp, avgHumidity, actuators } = currentState;

    // --- Temperature Analysis ---
    if (avgTemp > target.temperature.max && actuators.fan >= 99) {
      recommendations.push(this.createRecommendation('INSUFFICIENT_COOLING', 'critical', `Temperature (${avgTemp}°C) exceeds target maximum, but the cooling system is at 100%. A more powerful fan or cooling unit may be required.`, { target: target.temperature.max, actual: avgTemp, actuatorDutyCycle: actuators.fan }));
    }
    if (avgTemp < target.temperature.min && actuators.heater >= 99) {
       recommendations.push(this.createRecommendation('INSUFFICIENT_HEATING', 'critical', `Temperature (${avgTemp}°C) is below target minimum, but the heater is at 100%. A more powerful heating element may be required.`, { target: target.temperature.min, actual: avgTemp, actuatorDutyCycle: actuators.heater }));
    }

    // --- Humidity Analysis ---
    if (avgHumidity > target.humidity.max && actuators.fan >= 99) {
       recommendations.push(this.createRecommendation('INSUFFICIENT_DEHUMIDIFICATION', 'warning', `Humidity (${avgHumidity}%) exceeds target, but the dehumidification system is at 100%. A dedicated dehumidifier may be required.`, { target: target.humidity.max, actual: avgHumidity, actuatorDutyCycle: actuators.fan }));
    }
    if (avgHumidity < target.humidity.min && actuators.humidifier >= 99) {
       recommendations.push(this.createRecommendation('INSUFFICIENT_HUMIDIFICATION', 'warning', `Humidity (${avgHumidity}%) is below target, but the humidifier is at 100%. A more powerful device may be required.`, { target: target.humidity.min, actual: avgHumidity, actuatorDutyCycle: actuators.humidifier }));
    }
    
    // --- Oscillation Analysis ---
    this.history.temperature.push(avgTemp);
    if (this.history.temperature.length > 10) this.history.temperature.shift();
    if (this.isOscillating(this.history.temperature, target.temperature.ideal)) {
        recommendations.push(this.createRecommendation('SYSTEM_OSCILLATING', 'warning', `Temperature is frequently overshooting and undershooting the target. Consider adjusting controller (PID) settings or reducing actuator power.`, { target: target.temperature.ideal, history: this.history.temperature }));
    }

    return recommendations;
  }

  isOscillating(history, target) {
    if (history.length < 5) return false;
    let crossings = 0;
    for (let i = 1; i < history.length; i++) {
        if ((history[i-1] < target && history[i] > target) || (history[i-1] > target && history[i] < target)) {
            crossings++;
        }
    }
    return crossings > 3;
  }

  createRecommendation(code, severity, message, details) {
    return { code, severity, message, details, timestamp: new Date() };
  }
}

module.exports = { ControlAnalyticsEngine };