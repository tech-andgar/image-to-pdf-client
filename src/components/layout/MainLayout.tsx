import { useTheme } from "../../hooks/useTheme";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
	children: React.ReactNode;
}

export function MainLayout({ children }: Readonly<MainLayoutProps>) {
	useTheme();
	return (
		<div className="min-h-screen bg-background">
			<div className="flex flex-col">
				{/* Header - Fixed at top */}
				<Header />

				{/* Main Content - Centered */}
				<main className="flex-1 flex items-center justify-center p-4">
					{children}
				</main>

				{/* Footer - Fixed at bottom */}
				<Footer />
			</div>
		</div>
	);
}
