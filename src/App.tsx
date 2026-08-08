import { MainLayout } from "./components/layout/MainLayout";
import { ImageUploader } from "./components/ImageUploader";
import { LicenseProvider } from "./context/LicenseContext";
import { PaywallModal } from "./components/license/PaywallModal";

function App() {
	return (
		<LicenseProvider>
			<MainLayout>
				<ImageUploader />
				<PaywallModal />
			</MainLayout>
		</LicenseProvider>
	);
}

export default App;
