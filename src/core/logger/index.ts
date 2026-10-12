import { redact } from './redact';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogFields = Record<string, unknown>;
export interface LogSink {
  write(level: LogLevel, event: string, fields: LogFields | undefined): void;
}

const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const consoleSink: LogSink = {
  write(level, event, fields) {
    const line = fields ? `${event} ${JSON.stringify(fields)}` : event;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  },
};

export interface Logger {
  debug(event: string, fields?: LogFields): void;
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
  /** Replaces sinks (monitoring adds a breadcrumb sink at init). */
  setSinks(sinks: LogSink[]): void;
  setLevel(level: LogLevel): void;
}

export function createLogger(level: LogLevel = 'info', sinks: LogSink[] = [consoleSink]): Logger {
  let current = level;
  let targets = sinks;
  const emit = (l: LogLevel, event: string, fields?: LogFields) => {
    if (ORDER[l] < ORDER[current]) return;
    const safe = fields ? redact(fields) : undefined;
    for (const s of targets) {
      try {
        s.write(l, event, safe);
      } catch {
        /* a failing sink must never break the app */
      }
    }
  };
  return {
    debug: (e, f) => emit('debug', e, f),
    info: (e, f) => emit('info', e, f),
    warn: (e, f) => emit('warn', e, f),
    error: (e, f) => emit('error', e, f),
    setSinks: (s) => {
      targets = s;
    },
    setLevel: (l) => {
      current = l;
    },
  };
}

export const log: Logger = createLogger();
export { consoleSink };
