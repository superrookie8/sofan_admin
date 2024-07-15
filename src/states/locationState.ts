import { atom } from "recoil";
import { GameLocation, locations } from "../data/schedule";

export const selectedLocationState = atom<GameLocation | null>({
	key: "selectedLocationState",
	default: locations["부산 사직실내체육관"],
});
