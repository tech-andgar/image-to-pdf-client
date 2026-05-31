import { logger } from "./logger";

const DB_NAME = "ImgToPdfDB";
const STORE_NAME = "images";
const DB_VERSION = 1;

/**
 * Service to handle IndexedDB operations for storing image files.
 * This is crucial for Android PWA support where keeping File references
 * in memory can fail when the app is backgrounded.
 */
class StorageService {
	private db: IDBDatabase | null = null;
	private dbPromise: Promise<IDBDatabase> | null = null;

	private async getDB(): Promise<IDBDatabase> {
		if (this.db) return this.db;

		this.dbPromise ??= new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					db.createObjectStore(STORE_NAME);
				}
			};

			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				resolve(this.db);
			};

			request.onerror = (event) => {
				const error = (event.target as IDBOpenDBRequest).error;
				logger.error("Error opening IndexedDB", error);
				reject(error);
			};
		});

		return this.dbPromise;
	}

	/**
	 * Saves a file to IndexedDB and returns a unique ID
	 */
	async saveImage(file: File, id: string): Promise<void> {
		try {
			const db = await this.getDB();
			// Safari rejects Blob/File in IndexedDB — store as {buffer, type} instead
			const buffer = await file.arrayBuffer();
			const record = { buffer, type: file.type };
			return new Promise((resolve, reject) => {
				const transaction = db.transaction([STORE_NAME], "readwrite");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.put(record, id);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			logger.error("Failed to save image to storage", { id, error });
			throw error;
		}
	}

	/**
	 * Retrieves an image file from IndexedDB by ID
	 */
	async getImage(id: string): Promise<Blob | undefined> {
		try {
			const db = await this.getDB();
			const record = await new Promise<
				{ buffer: ArrayBuffer; type: string } | Blob | File | undefined
			>((resolve, reject) => {
				const transaction = db.transaction([STORE_NAME], "readonly");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.get(id);
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			if (!record) return undefined;
			// Handle legacy Blob/File records and new {buffer, type} records
			if (record instanceof Blob) return record;
			if ("buffer" in record)
				return new Blob([record.buffer], { type: record.type });
			return undefined;
		} catch (error) {
			logger.error("Failed to get image from storage", { id, error });
			return undefined;
		}
	}

	/**
	 * Removes an image from IndexedDB
	 */
	async removeImage(id: string): Promise<void> {
		try {
			const db = await this.getDB();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction([STORE_NAME], "readwrite");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.delete(id);

				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			logger.error("Failed to remove image from storage", { id, error });
		}
	}

	/**
	 * Clears all images from the store
	 */
	async clearAll(): Promise<void> {
		try {
			const db = await this.getDB();
			return new Promise((resolve, reject) => {
				const transaction = db.transaction([STORE_NAME], "readwrite");
				const store = transaction.objectStore(STORE_NAME);
				const request = store.clear();

				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		} catch (error) {
			logger.error("Failed to clear storage", error);
		}
	}
}

export const storageService = new StorageService();
