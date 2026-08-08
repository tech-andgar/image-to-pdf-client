import { MainLayout } from "./components/layout/MainLayout";
import { ImageUploader } from "./components/ImageUploader";
import { LicenseProvider, useLicenseContext } from "./context/LicenseContext";
import { PaywallModal } from "./components/license/PaywallModal";

function AppContent() {
	const license = useLicenseContext();
	return (
		<MainLayout>
			<ImageUploader />
			<PaywallModal license={license} />
		</MainLayout>
	);
}

function App() {
	return (
		<LicenseProvider>
			<AppContent />
		</LicenseProvider>
	);
}

export default App;
