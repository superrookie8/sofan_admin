"use client";

import { useRouter, usePathname } from "next/navigation";

export default function useGoPage() {
	const router = useRouter();
	const pathname = usePathname();
	const goBackPage = () => {
		const pathParts = pathname.split("/");
		const newPath = pathParts.slice(0, 2).join("/");
		router.push(newPath);
	};
	return goBackPage;
}
