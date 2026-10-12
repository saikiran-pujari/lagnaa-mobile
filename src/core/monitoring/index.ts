import * as Sentry from '@sentry/react-native';

import type { Env, ReleaseInfo } from '@/core/env';
import { log, type LogSink } from '@/core/logger';
import { redact } from '@/core/logger/redact';

export interface Monitoring {
  init(): void;
  captureError(error: unknown, context?: Record<string, unknown>): void;
  setMember(memberId: string | null): void;
  setBundle(bundleId: string): void;
  readonly enabled: boolean;
}

export function createMonitoring(env: Env, release: ReleaseInfo): Monitoring {
  const enabled = env.sentry.enabled;
  const breadcrumbSink: LogSink = {
    write(level, event, fields) {
      if (level === 'debug') return;
      Sentry.addBreadcrumb({
        category: 'log',
        level: level === 'warn' ? 'warning' : level,
        message: event,
        data: fields,
      });
    },
  };
  return {
    enabled,
    init() {
      if (!enabled) {
        log.info('monitoring.disabled');
        return;
      }
      Sentry.init({
        dsn: env.sentry.dsn,
        environment: env.sentry.environment,
        release: `in.lagnaa.app@${release.appVersion}+${release.buildNumber}`,
        dist: 'embedded',
        sendDefaultPii: false,
        tracesSampleRate: env.isProduction ? 0.1 : 1.0,
        attachScreenshot: false,
        attachViewHierarchy: false,
        beforeSend(event) {
          if (event.request) {
            delete event.request.data;
            delete event.request.cookies;
            delete event.request.query_string;
          }
          if (event.extra) event.extra = redact(event.extra);
          if (event.exception?.values) {
            for (const v of event.exception.values) if (v.value) v.value = redact(v.value);
          }
          return event;
        },
        beforeBreadcrumb(breadcrumb) {
          if (
            breadcrumb.category === 'http' ||
            breadcrumb.category === 'fetch' ||
            breadcrumb.category === 'xhr'
          ) {
            if (breadcrumb.data?.url)
              breadcrumb.data.url = String(breadcrumb.data.url).split('?')[0];
            delete breadcrumb.data?.request_body_size;
            delete breadcrumb.data?.response_body_size;
          }
          if (breadcrumb.data) breadcrumb.data = redact(breadcrumb.data);
          return breadcrumb;
        },
      });
      Sentry.setTags({
        channel: release.channel,
        platform: release.platform,
        app_env: release.environment,
      });
      log.setSinks([...currentSinks(), breadcrumbSink]);
    },
    captureError(error, context) {
      log.error('monitoring.capture', {
        error: error instanceof Error ? error.message : String(error),
        ...context,
      });
      if (!enabled) return;
      Sentry.captureException(error, { extra: context ? redact(context) : undefined });
    },
    setMember(memberId) {
      if (!enabled) return;
      Sentry.setUser(memberId ? { id: memberId } : null);
    },
    setBundle(bundleId) {
      if (!enabled) return;
      Sentry.setTag('ota_bundle', bundleId);
    },
  };
}

function currentSinks(): LogSink[] {
  // The logger keeps console output in development; in release the console is stripped by Babel.
  return [
    {
      write(level, event, fields) {
        const line = fields ? `${event} ${JSON.stringify(fields)}` : event;
        if (level === 'error') console.error(line);
        else if (level === 'warn') console.warn(line);
        else console.log(line);
      },
    },
  ];
}
