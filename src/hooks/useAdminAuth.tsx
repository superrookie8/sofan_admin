import { useRouter } from "next/navigation";
import { useEffect } from "react";

const useAdminAuth = () => {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("admin-token");
		if (!token) {
			router.push("/admin/login");
		}
	}, [router]);
};

export default useAdminAuth;
