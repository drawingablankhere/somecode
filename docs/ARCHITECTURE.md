# VPD Controller System Architecture

## Overview

The Production VPD Controller is an enterprise-grade system for monitoring and controlling Vapor Pressure Deficit in grow environments. This document outlines the system architecture, component interactions, and operational patterns.

## System Diagram

```mermaid
graph TB
    User[👤 Operator] --> API[🌐 REST API]
    API --> App[🛄 VPD Controller Application]
    App --> Controller[🧠 Core Controller Logic]
    Controller --> Hardware[🔧 Hardware Interface]
    Hardware --> Sensors[🌡️ Temp/Humidity Sensors]
    Hardware --> Actuators[⚙️ Fans/Humidifiers]
    Controller --> StateStore[💾 State Store (Redis)]
    App --> HealthCheck[❤️ Health Check System]