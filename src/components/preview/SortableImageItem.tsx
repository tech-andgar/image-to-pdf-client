import { AlertCircle, Grip, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ImageFile } from "../../types/image";

interface SortableImageItemProps {
	image: ImageFile;
	index: number;
	onRemoveImage: (imageId: string) => void;
	onPreviewImage: (imageIndex: number) => void;
}

export function SortableImageItem({
	image,
	index,
	onRemoveImage,
	onPreviewImage,
}: Readonly<SortableImageItemProps>) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.id, data: { index } });

	const style = { transform: CSS.Transform.toString(transform), transition };

	let itemClass =
		"relative group rounded-lg overflow-hidden bg-muted transition-all duration-200 touch-none border border-border";
	if (isDragging) itemClass += " opacity-50 scale-95 z-50";
	else if (image.error)
		itemClass =
			"relative group rounded-lg overflow-hidden transition-all duration-200 touch-none border bg-destructive/10 border-destructive/20";

	return (
		<div ref={setNodeRef} style={style} className={itemClass} {...attributes}>
			<div
				className={
					isDragging
						? "absolute top-2 left-2 z-10 bg-black/90 scale-110 rounded-md p-1 md:p-1.5 transition-all duration-200 touch-manipulation"
						: "absolute top-2 left-2 z-10 bg-black/70 hover:bg-black/90 rounded-md p-1 md:p-1.5 transition-all duration-200 touch-manipulation"
				}
				title="Arrastrar para reordenar"
				{...listeners}
			>
				<Grip className="h-4 w-4 md:h-3 md:w-3 text-white" />
			</div>

			<div className="absolute top-2 right-2 z-10">
				<Button
					variant="destructive"
					size="sm"
					className={
						isDragging
							? "w-6 h-6 md:w-5 md:h-5 p-0 opacity-0 pointer-events-none touch-manipulation"
							: "w-6 h-6 md:w-5 md:h-5 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity touch-manipulation"
					}
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						onRemoveImage(image.id);
					}}
				>
					<Trash2 className="h-4 w-4 md:h-3 md:w-3" />
				</Button>
			</div>

			{image.preview ? (
				<button
					type="button"
					className="w-full h-full p-0 border-0 bg-transparent cursor-pointer block"
					onClick={() => onPreviewImage(index)}
					onMouseDown={(e) => {
						if (!e.currentTarget.contains(e.target as Node)) return;
					}}
				>
					<div className="aspect-square relative">
						<img
							src={image.preview}
							alt={image.file.name}
							className="w-full h-full object-cover"
						/>
						{image.pdfSource && (
							<div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center">
								<span className="text-[9px] text-white/80 leading-none">
									vista previa aprox.
								</span>
							</div>
						)}
					</div>
				</button>
			) : (
				<div className="aspect-square flex flex-col items-center justify-center p-2 text-center">
					<AlertCircle className="h-6 w-6 text-destructive mx-auto mb-1.5 shrink-0" />
					<p className="text-[10px] text-destructive font-medium leading-tight line-clamp-2 break-all">
						{image.file.name}
					</p>
					<p className="text-[10px] text-destructive/70 mt-1 leading-tight line-clamp-2">
						Duplicada
					</p>
				</div>
			)}
		</div>
	);
}
