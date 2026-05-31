import { useMemo } from "react";
import type { CompressionStats } from "../../types/image";
import { formatFileSize } from "../../lib/image/compression";

export function useCompressionStats(compressionStats: CompressionStats | null) {
	const formattedStats = useMemo(() => {
		if (!compressionStats) return null;
		return {
			originalSize: formatFileSize(compressionStats.originalSize),
			compressedSize: formatFileSize(compressionStats.compressedSize),
			savingsPercentage: (
				(1 - compressionStats.compressionRatio) *
				100
			).toFixed(1),
			timeElapsed: `${compressionStats.time_elapsed}ms`,
		};
	}, [compressionStats]);

	const hasSignificantSavings = useMemo(
		() => (compressionStats ? compressionStats.compressionRatio < 0.8 : false),
		[compressionStats],
	);

	return { formattedStats, hasSignificantSavings };
}
