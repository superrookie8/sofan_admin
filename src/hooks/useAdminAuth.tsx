import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useAdminAuth = () => {
	const router = useRouter();

	useEffect(() => {
		const token = localStorage.getItem("adminToken");
		if (!token) {
			router.push("/login");
		}
	}, [router]);
};

export default useAdminAuth;
