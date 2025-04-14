// src/app/services/logger.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  OFF = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  data?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private level: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;
  
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  debug(message: string, ...data: any[]): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  info(message: string, ...data: any[]): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  warn(message: string, ...data: any[]): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  error(message: string, ...data: any[]): void {
    this.log(LogLevel.ERROR, message, data);
  }
  
  getLogHistory(): LogEntry[] {
    return [...this.logHistory];
  }
  
  clearHistory(): void {
    this.logHistory = [];
  }
  
  private log(level: LogLevel, message: string, data: any[], source?: string): void {
    if (level >= this.level) {
      const timestamp = new Date().toISOString();
      
      // Store log in history
      const logEntry: LogEntry = {
        timestamp,
        level,
        message,
        source,
        data: data.length > 0 ? [...data] : undefined
      };
      
      this.addToHistory(logEntry);
      
      // Format message for console
      const logPrefix = `[${timestamp.split('T')[1].split('.')[0]}] [${LogLevel[level]}]`;
      const component = source ? ` [${source}]` : '';
      const formattedMessage = `${logPrefix}${component}: ${message}`;
      
      // Color coding for better visibility
      const styles = {
        [LogLevel.DEBUG]: 'color: #6c757d',
        [LogLevel.INFO]: 'color: #17a2b8',
        [LogLevel.WARN]: 'color: #ffc107; font-weight: bold',
        [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold'
      };
      
      // Add box for clearer separation
      const boxStyle = 'background: #f8f9fa; border: 1px solid #ddd; border-radius: 3px; padding: 2px 4px;';
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`%c${formattedMessage}`, `${styles[level]}; ${boxStyle}`, ...data);
          break;
        case LogLevel.INFO:
          console.info(`%c${formattedMessage}`, `${styles[level]}; ${boxStyle}`, ...data);
          break;
        case LogLevel.WARN:
          console.warn(`%c${formattedMessage}`, `${styles[level]}; ${boxStyle}`, ...data);
          break;
        case LogLevel.ERROR:
          console.error(`%c${formattedMessage}`, `${styles[level]}; ${boxStyle}`, ...data);
          break;
      }
    }
  }
  
  private addToHistory(entry: LogEntry): void {
    this.logHistory.unshift(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.pop();
    }
  }
}