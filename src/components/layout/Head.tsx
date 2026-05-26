import { Partytown } from "@qwik.dev/partytown/react";

export function Head() {
	return (
		<>
			{/* Partytown Configuration for Google Analytics */}
			<Partytown
				debug={false}
				forward={["dataLayer.push", "gtag"]}
				lib="/image-to-pdf-client-public/~partytown/"
			/>
		</>
	);
}
