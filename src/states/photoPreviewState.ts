import { atom } from "recoil";
export interface PhotoData {
	id: string;
	preview: string;
	originalFile: File;
	compressedFile: File;
	uploadTime: string;
}

export const photoPreviewState = atom<PhotoData[]>({
	key: "photoPreviewState",
	default: [],
});
