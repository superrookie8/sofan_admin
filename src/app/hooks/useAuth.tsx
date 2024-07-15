"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const useAuth = () => {
	const router = useRouter();
	const [user, setUser] = useState<{ nickname: string } | null>(null);

	useEffect(() => {
		const token = sessionStorage.getItem("token");
		if (!token) {
			router.push("/login");
			return;
		}

		const fetchUser = async () => {
			try {
				const response = await fetch("/api/getuserinfo", {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error("Failed to fetch user info");
				}

				const userData = await response.json();
				setUser(userData);
			} catch (error) {
				console.error("Error fetching user info:", error);
				router.push("/login");
			}
		};

		fetchUser();
	}, [router]);

	return user;
};

export default useAuth;
