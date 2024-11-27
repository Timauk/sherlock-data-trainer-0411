export interface LogEntry {
  timestamp: Date;
  type: 'action' | 'prediction' | 'performance' | 'system' | 'lunar' | 'player' | 'checkpoint' | 'learning' | 'model';
  message: string;
  details?: any;
}

class SystemLogger {
  private static instance: SystemLogger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {}

  public static getInstance(): SystemLogger {
    if (!SystemLogger.instance) {
      SystemLogger.instance = new SystemLogger();
    }
    return SystemLogger.instance;
  }

  public log(type: LogEntry['type'], message: string, details?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      type,
      message,
      details
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Dispatch event for UI updates
    const event = new CustomEvent('systemLog', { detail: entry });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }

    // Console logging with colors
    const colorMap = {
      action: '\x1b[34m',
      prediction: '\x1b[32m',
      performance: '\x1b[33m',
      system: '\x1b[35m',
      lunar: '\x1b[36m',
      player: '\x1b[33m',
      checkpoint: '\x1b[31m',
      learning: '\x1b[32m',
      model: '\x1b[36m'
    };

    const color = colorMap[type] || '\x1b[37m';
    console.log(`${color}[${type.toUpperCase()}]\x1b[0m ${message}`, details);
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public getLogsByType(type: LogEntry['type']): LogEntry[] {
    return this.logs.filter(log => log.type === type);
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const systemLogger = SystemLogger.getInstance();