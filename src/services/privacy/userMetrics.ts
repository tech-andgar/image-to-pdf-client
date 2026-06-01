import { analytics, detectUserProperties } from "../../core/analytics";
import "../../core/analytics/setup";

analytics.configure({
	debug: import.meta.env.DEV,
	globalParams: { app_version: __APP_VERSION__ },
});
analytics.init();

// --- bucketing helpers ---

function sizeRange(bytes: number): string {
	if (bytes < 1024 * 1024) return "small_<1mb";
	if (bytes < 5 * 1024 * 1024) return "medium_1-5mb";
	return "large_>5mb";
}

function countRange(n: number): string {
	if (n <= 3) return "1-3";
	if (n <= 10) return "4-10";
	return "10+";
}

function pageRange(n: number): string {
	if (n <= 5) return "1-5";
	if (n <= 20) return "6-20";
	return "20+";
}

function savingsTier(pct: number): string {
	if (pct > 50) return "high_>50%";
	if (pct > 20) return "medium_20-50%";
	return "low_<20%";
}

function toMb(bytes: number): number {
	return Math.round((bytes / (1024 * 1024)) * 100) / 100;
}

// --- service ---

class UserMetricsService {
	constructor() {
		const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
		analytics.configure({ globalParams: { session_id: sessionId } });
		analytics.identify(sessionId);
		analytics.setUserProperties(detectUserProperties());
	}

	trackFileUploaded(count: number, totalSize: number) {
		const range = sizeRange(totalSize);
		analytics.trackFunnel(1, "upload", {
			file_count: count,
			size_range: range,
		});
		analytics.track({
			action: "app_files_uploaded",
			category: "upload",
			value: count,
			params: {
				total_size_mb: toMb(totalSize),
				size_range: range,
				count_range: countRange(count),
			},
		});
	}

	trackCompressionUsed(preset: string, sizeReductionPercent: number) {
		analytics.trackFunnel(2, "compress", { preset });
		analytics.track({
			action: "app_compression_used",
			category: "interaction",
			params: {
				preset,
				size_reduction_percent: sizeReductionPercent,
				savings_tier: savingsTier(sizeReductionPercent),
			},
		});
	}

	trackImageReordered() {
		analytics.track({ action: "app_image_reordered", category: "interaction" });
	}

	trackImagePreviewed() {
		analytics.track({ action: "app_image_previewed", category: "interaction" });
	}

	trackImageRemoved() {
		analytics.track({ action: "app_image_removed", category: "interaction" });
	}

	trackPdfExported(pageCount: number, fileSize: number) {
		analytics.trackFunnel(3, "export", { method: "download" });
		analytics.track({
			action: "app_pdf_exported",
			category: "export",
			value: pageCount,
			params: {
				file_size_mb: toMb(fileSize),
				page_range: pageRange(pageCount),
			},
		});
	}

	trackPdfShared(pageCount: number) {
		analytics.trackFunnel(3, "export", { method: "share" });
		analytics.track({
			action: "app_pdf_shared",
			category: "export",
			value: pageCount,
		});
	}

	trackError(errorType: string, details?: string) {
		analytics.track({
			action: `app_error_${errorType}`,
			category: "error",
			params: { error_details: details },
		});
	}
}

export const userMetrics = new UserMetricsService();
