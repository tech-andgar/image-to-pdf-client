/**
 * User metrics collection service
 * Collects usage analytics and user behavior patterns
 */

// Add Google Analytics types
declare global {
	interface Window {
		gtag?: (
			command: "config" | "event" | "js",
			targetId: string | Date,
			config?: Record<string, unknown>,
		) => void;
		dataLayer?: unknown[];
	}
}

export interface UserMetric {
	timestamp: string;
	action: string;
	value?: number;
	category: "upload" | "interaction" | "export" | "error" | "performance";
	sessionId: string;
	userAgent: string;
}

import { MAX_METRIC_ENTRIES } from "../config/limits";

class UserMetricsService {
	private metrics: UserMetric[] = [];
	private readonly maxMetrics = MAX_METRIC_ENTRIES;
	private readonly sessionId: string;

	constructor() {
		this.sessionId = this.generateSessionId();
		this.loadMetricsFromStorage();

		// Track page visits
		this.trackMetric("page_visit", "interaction");

		// Track unload to estimate session duration
		window.addEventListener("beforeunload", () => {
			this.trackMetric("page_exit", "interaction", Date.now());
		});
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
	}

	private loadMetricsFromStorage() {
		try {
			const storedMetrics = localStorage.getItem("user_metrics");
			if (storedMetrics) {
				this.metrics = JSON.parse(storedMetrics);
			}
		} catch (error) {
			console.warn("Failed to load metrics from storage:", error);
		}
	}

	private saveMetricsToStorage() {
		try {
			localStorage.setItem("user_metrics", JSON.stringify(this.metrics));
		} catch (error) {
			console.warn("Failed to save metrics to storage:", error);
		}
	}

	trackMetric(
		action: string,
		category: UserMetric["category"],
		value?: number,
	) {
		const metric: UserMetric = {
			timestamp: new Date().toISOString(),
			action,
			value,
			category,
			sessionId: this.sessionId,
			userAgent: navigator.userAgent,
		};

		this.metrics.push(metric);

		// Keep only recent metrics
		if (this.metrics.length > this.maxMetrics) {
			this.metrics.shift();
		}

		// Save to storage
		this.saveMetricsToStorage();

		// Optional: Send to analytics service
		if (window.gtag) {
			window.gtag("event", action, {
				event_category: category,
				event_label: this.sessionId,
				value: value,
			});
		}

		console.log(`[METRICS] ${category}:${action}`, value || "");
	}

	// Upload metrics
	trackFileUploaded(count: number, totalSize: number) {
		this.trackMetric("files_uploaded", "upload", count);
		this.trackMetric("upload_size_mb", "upload", totalSize / (1024 * 1024));
	}

	trackCompressionUsed(preset: string, sizeReductionPercent: number) {
		this.trackMetric("compression_used", "interaction");
		this.trackMetric(`compression_preset_${preset}`, "interaction");
		this.trackMetric(
			"size_reduction_percent",
			"performance",
			sizeReductionPercent,
		);
	}

	// Interaction metrics
	trackImageReordered() {
		this.trackMetric("image_reordered", "interaction");
	}

	trackImagePreviewed() {
		this.trackMetric("image_previewed", "interaction");
	}

	trackImageRemoved() {
		this.trackMetric("image_removed", "interaction");
	}

	// Export metrics
	trackPdfExported(
		pageCount: number,
		fileSize: number,
		generationTime: number,
	) {
		this.trackMetric("pdf_exported", "export", pageCount);
		this.trackMetric("pdf_file_size_mb", "export", fileSize / (1024 * 1024));
		this.trackMetric("pdf_generation_time_ms", "performance", generationTime);
	}

	// Error metrics
	trackError(errorType: string, details?: string) {
		this.trackMetric("error_occurred", "error");
		this.trackMetric(`error_${errorType}`, "error");
		console.error(`[USER ERROR] ${errorType}:`, details);
	}

	// Get metrics for analysis
	getMetrics(): UserMetric[] {
		return [...this.metrics];
	}

	// Export metrics as JSON
	exportMetrics(): string {
		return JSON.stringify(this.metrics, null, 2);
	}

	// Clear all metrics
	clearMetrics() {
		this.metrics = [];
		this.saveMetricsToStorage();
		console.log("[METRICS] All metrics cleared");
	}
}

// Create singleton instance
export const userMetrics = new UserMetricsService();

// React hook for component usage
export function useUserMetrics() {
	return userMetrics;
}
