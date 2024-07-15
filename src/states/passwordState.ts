import { atom } from "recoil";

export const passwordState = atom<string>({
	key: "passwordState",
	default: "",
});
