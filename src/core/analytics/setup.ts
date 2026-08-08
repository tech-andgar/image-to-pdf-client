import { analytics } from './index';
import { AmplitudeProvider } from './providers/amplitude';
import { DatadogProvider } from './providers/datadog';
import { FirebaseProvider } from './providers/firebase';
import { FullStoryProvider } from './providers/fullstory';
import { GoogleAnalyticsProvider } from './providers/ga';
import { HotjarProvider } from './providers/hotjar';
import { MixpanelProvider } from './providers/mixpanel';
import { PostHogProvider } from './providers/posthog';
import { SentryProvider } from './providers/sentry';

analytics.registerFactory(
  'google-analytics',
  () => new GoogleAnalyticsProvider(),
);
analytics.registerFactory('datadog', () => new DatadogProvider());
analytics.registerFactory('sentry', () => new SentryProvider());
analytics.registerFactory('fullstory', () => new FullStoryProvider());
analytics.registerFactory('mixpanel', () => new MixpanelProvider());
analytics.registerFactory('hotjar', () => new HotjarProvider());
analytics.registerFactory('posthog', () => new PostHogProvider());
analytics.registerFactory('amplitude', () => new AmplitudeProvider());
analytics.registerFactory('firebase', () => new FirebaseProvider());
