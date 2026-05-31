import { analytics } from "./index";
import { GoogleAnalyticsProvider } from "./providers/ga";
import { DatadogProvider } from "./providers/datadog";
import { SentryProvider } from "./providers/sentry";
import { FullStoryProvider } from "./providers/fullstory";
import { MixpanelProvider } from "./providers/mixpanel";
import { HotjarProvider } from "./providers/hotjar";
import { PostHogProvider } from "./providers/posthog";
import { AmplitudeProvider } from "./providers/amplitude";
import { FirebaseProvider } from "./providers/firebase";

analytics.registerFactory(
	"google-analytics",
	() => new GoogleAnalyticsProvider(),
);
analytics.registerFactory("datadog", () => new DatadogProvider());
analytics.registerFactory("sentry", () => new SentryProvider());
analytics.registerFactory("fullstory", () => new FullStoryProvider());
analytics.registerFactory("mixpanel", () => new MixpanelProvider());
analytics.registerFactory("hotjar", () => new HotjarProvider());
analytics.registerFactory("posthog", () => new PostHogProvider());
analytics.registerFactory("amplitude", () => new AmplitudeProvider());
analytics.registerFactory("firebase", () => new FirebaseProvider());
