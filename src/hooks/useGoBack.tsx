import { useRouter } from "next/navigation";

export default function useGoBack() {
	const router = useRouter();

	const handlerGoBack = () => {
		router.back();
	};

	return handlerGoBack;
}
