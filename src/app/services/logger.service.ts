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

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private level: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;
  
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
  
  private log(level: LogLevel, message: string, data: any[]): void {
    if (level >= this.level) {
      const timestamp = new Date().toISOString();
      const logPrefix = `[${timestamp}] [${LogLevel[level]}]`;
      
      // Color coding for better visibility
      const styles = {
        [LogLevel.DEBUG]: 'color: #6c757d',
        [LogLevel.INFO]: 'color: #17a2b8',
        [LogLevel.WARN]: 'color: #ffc107',
        [LogLevel.ERROR]: 'color: #dc3545; font-weight: bold'
      };
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(`%c${logPrefix}: ${message}`, styles[level], ...data);
          break;
        case LogLevel.INFO:
          console.info(`%c${logPrefix}: ${message}`, styles[level], ...data);
          break;
        case LogLevel.WARN:
          console.warn(`%c${logPrefix}: ${message}`, styles[level], ...data);
          break;
        case LogLevel.ERROR:
          console.error(`%c${logPrefix}: ${message}`, styles[level], ...data);
          break;
      }
    }
  }
}