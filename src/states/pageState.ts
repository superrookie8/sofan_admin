import { atom } from "recoil";

type PageState = "default" | "photoAndText";

export const pageState = atom<PageState>({
	key: "pageState",
	default: "default",
});
