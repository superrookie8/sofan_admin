// components/AdminHomeButton.tsx

import React from "react";
import { useRouter } from "next/navigation";

const AdminHomeButton: React.FC = () => {
	const router = useRouter();

	const GoHome = () => {
		router.push("/");
	};

	return (
		<button
			className="mt-4 py-2 px-4 bg-green-500 text-white rounded"
			onClick={GoHome}
		>
			Admin Home
		</button>
	);
};

export default AdminHomeButton;
