import { useEffect } from 'react';

interface ErrorReport {
  message: string;
  stack?: string;
  componentName?: string;
  timestamp: number;
}

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

class ApplicationMonitor {
  private static instance: ApplicationMonitor;
  private errorLogs: ErrorReport[] = [];
  private performanceMetrics: PerformanceMetrics[] = [];
  private readonly MAX_LOGS = 1000;
  private isInitialized = false;

  private constructor() {
    // Event listeners will be added in initialize()
  }

  public initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
    this.isInitialized = true;
  }

  public static getInstance(): ApplicationMonitor {
    if (!ApplicationMonitor.instance) {
      ApplicationMonitor.instance = new ApplicationMonitor();
    }
    return ApplicationMonitor.instance;
  }

  public logError(error: Error, componentName?: string) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentName,
      timestamp: Date.now()
    };

    this.errorLogs.push(errorReport);
    this.trimLogs();
    
    if (typeof window !== 'undefined') {
      console.error('Application Error:', errorReport);
    }
  }

  public logPerformance(componentName: string, renderTime: number) {
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      timestamp: Date.now()
    };

    this.performanceMetrics.push(metrics);
    this.trimLogs();
    
    // Log slow renders only in browser environment
    if (typeof window !== 'undefined' && renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
    }
  }

  private handleGlobalError = (event: ErrorEvent) => {
    this.logError(event.error);
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.logError(new Error(String(event.reason)));
  };

  private trimLogs() {
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs = this.errorLogs.slice(-this.MAX_LOGS);
    }
    if (this.performanceMetrics.length > this.MAX_LOGS) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.MAX_LOGS);
    }
  }

  public getErrorLogs(): ErrorReport[] {
    return [...this.errorLogs];
  }

  public getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  public clearLogs() {
    this.errorLogs = [];
    this.performanceMetrics = [];
  }
}

export const useMonitoring = (componentName: string) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const monitor = ApplicationMonitor.getInstance();
    monitor.initialize();
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      monitor.logPerformance(componentName, endTime - startTime);
    };
  }, [componentName]);

  return {
    logError: (error: Error) => {
      ApplicationMonitor.getInstance().logError(error, componentName);
    }
  };
};

export const monitor = ApplicationMonitor.getInstance(); 