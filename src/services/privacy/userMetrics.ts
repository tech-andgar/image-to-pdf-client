import { analytics, detectUserProperties } from "../../core/analytics";
import "../../core/analytics/setup";

analytics.configure({
	debug: import.meta.env.DEV,
	globalParams: { app_version: "1.0.0" },
});
analytics.init();

class UserMetricsService {
	private readonly sessionId: string;

	constructor() {
		this.sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
		analytics.identify(this.sessionId);
		analytics.setUserProperties(detectUserProperties());
	}

	trackFileUploaded(count: number, totalSize: number) {
		const sizeRange =
			totalSize < 1024 * 1024
				? "small_<1mb"
				: totalSize < 5 * 1024 * 1024
					? "medium_1-5mb"
					: "large_>5mb";
		analytics.trackFunnel(1, "upload", {
			file_count: count,
			size_range: sizeRange,
		});
		analytics.track({
			action: "files_uploaded",
			category: "upload",
			label: this.sessionId,
			value: count,
			params: {
				total_size_mb: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
				size_range: sizeRange,
				count_range: count <= 3 ? "1-3" : count <= 10 ? "4-10" : "10+",
			},
		});
	}

	trackCompressionUsed(preset: string, sizeReductionPercent: number) {
		analytics.trackFunnel(2, "compress", { preset });
		analytics.track({
			action: "compression_used",
			category: "interaction",
			label: this.sessionId,
			params: {
				preset,
				size_reduction_percent: sizeReductionPercent,
				savings_tier:
					sizeReductionPercent > 50
						? "high_>50%"
						: sizeReductionPercent > 20
							? "medium_20-50%"
							: "low_<20%",
			},
		});
	}

	trackImageReordered() {
		analytics.track({
			action: "image_reordered",
			category: "interaction",
			label: this.sessionId,
		});
	}

	trackImagePreviewed() {
		analytics.track({
			action: "image_previewed",
			category: "interaction",
			label: this.sessionId,
		});
	}

	trackImageRemoved() {
		analytics.track({
			action: "image_removed",
			category: "interaction",
			label: this.sessionId,
		});
	}

	trackPdfExported(pageCount: number, fileSize: number) {
		analytics.trackFunnel(3, "export", { method: "download" });
		analytics.track({
			action: "pdf_exported",
			category: "export",
			label: this.sessionId,
			value: pageCount,
			params: {
				file_size_mb: Math.round((fileSize / (1024 * 1024)) * 100) / 100,
				page_range: pageCount <= 5 ? "1-5" : pageCount <= 20 ? "6-20" : "20+",
			},
		});
	}

	trackPdfShared(pageCount: number) {
		analytics.trackFunnel(3, "export", { method: "share" });
		analytics.track({
			action: "pdf_shared",
			category: "export",
			label: this.sessionId,
			value: pageCount,
		});
	}

	trackError(errorType: string, details?: string) {
		analytics.track({
			action: `error_${errorType}`,
			category: "error",
			label: this.sessionId,
			params: { error_details: details },
		});
	}
}

export const userMetrics = new UserMetricsService();
