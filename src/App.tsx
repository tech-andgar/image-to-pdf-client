import { Head } from "./components/Head";
import { MainLayout } from "./components/MainLayout";
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
