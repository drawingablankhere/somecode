declare module 'production-vpd-controller' {
  export interface VPDReading {
    temperature: number;
    humidity: number;
    vpd: number;
    timestamp: Date;
    sensorId: string;
    status: 'success' | 'error' | 'stale';
  }

  export interface ControllerConfig {
    target: {
      vpd: { min: number; max: number; ideal: number };
      temperature: { min: number; max: number; ideal: number };
      humidity: { min: number; max: number; ideal: number };
    };
    // ... other config properties
  }

  // ... (other original types) ...

  export type RecommendationCode =
    | 'INSUFFICIENT_COOLING'
    | 'INSUFFICIENT_HEATING'
    | 'INSUFFICIENT_HUMIDIFICATION'
    | 'INSUFFICIENT_DEHUMIDIFICATION'
    | 'SYSTEM_OSCILLATING'
    | 'SENSORS_INCONSISTENT';

  export interface SystemRecommendation {
    code: RecommendationCode;
    severity: 'warning' | 'critical';
    message: string;
    details: {
      target: number;
      actual: number;
      actuatorDutyCycle: number;
      [key: string]: any;
    };
    timestamp: Date;
  }

  export interface ControllerStatus {
    isRunning: boolean;
    emergencyMode: boolean;
    lastCycleTime: number | null;
    uptime: number;
    recommendations: SystemRecommendation[]; // Added
    // ... other status properties
  }
}