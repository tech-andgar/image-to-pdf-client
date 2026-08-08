import { useTheme } from '../../hooks/theme/useTheme';
import { CookieConsent } from '../privacy/CookieConsent';
import { FirefoxWasmBanner } from './FirefoxWasmBanner';
import { Footer } from './Footer';
import { Header } from './Header';
import { PwaRenameBanner } from './PwaRenameBanner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: Readonly<MainLayoutProps>) {
  useTheme();
  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <PwaRenameBanner />
      <FirefoxWasmBanner />
      <Header />
      <main className="flex-1">
        <div className="max-w-2xl w-full mx-auto px-4 py-6 sm:py-8">
          {children}
        </div>
      </main>
      <CookieConsent />
      <Footer />
    </div>
  );
}
