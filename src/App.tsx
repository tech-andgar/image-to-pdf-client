import { ImageUploader } from './components/ImageUploader';
import { MainLayout } from './components/layout/MainLayout';
import { PaywallModal } from './components/license/PaywallModal';
import { LicenseProvider } from './context/LicenseContext';

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
