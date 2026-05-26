import { useTheme } from "../../hooks/useTheme";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
	children: React.ReactNode;
}

export function MainLayout({ children }: Readonly<MainLayoutProps>) {
	useTheme();
	return (
		<div className="min-h-screen w-full bg-background flex flex-col">
			<Header />
			<main className="flex-1">
				<div className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8">
					{children}
				</div>
			</main>
			<Footer />
		</div>
	);
}
