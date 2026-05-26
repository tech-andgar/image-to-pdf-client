import { Head } from "./components/layout/Head";
import { MainLayout } from "./components/layout/MainLayout";
import { ImageUploader } from "./components/ImageUploader";

function App() {
	return (
		<>
			<Head />
			<MainLayout>
				<ImageUploader />
			</MainLayout>
		</>
	);
}

export default App;
