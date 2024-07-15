// states/photoPreviewState.js
import { atom } from "recoil";

export const photoPreviewState = atom<null | string>({
	key: "photoPreviewState", // 고유한 key 값
	default: null, // 기본값은 null
});
