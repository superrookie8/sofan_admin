"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminLogin: React.FC = () => {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const token = sessionStorage.getItem("admin-token");
		if (token) {
			router.push("/admin");
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const response = await fetch("/api/auth/admin-login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok) {
				sessionStorage.setItem("admin-token", data.access_token);
				router.push("/");
			} else {
				setMessage(data.message);
			}
		} catch (error: any) {
			console.error("Login error:", error);
			setMessage("로그인 중 오류가 발생했습니다.");
		}
	};

	return (
		<div className="w-full h-screen flex flex-col justify-center items-center">
			<h1 className="text-2xl mb-4">Admin Login</h1>
			<form
				onSubmit={handleSubmit}
				className="w-[300px] p-4 bg-white rounded shadow-md"
			>
				{message && <p className="text-red-500">{message}</p>}
				<div className="mb-4">
					<label className="block mb-1">Username</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="w-full px-3 py-2 border rounded"
						autoComplete="username"
					/>
				</div>
				<div className="mb-4">
					<label className="block mb-1">Password</label>
					<input
						type="password"
						value={password}
						autoComplete="current-password"
						onChange={(e) => setPassword(e.target.value)}
						className="w-full px-3 py-2 border rounded"
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 rounded"
				>
					Login
				</button>
			</form>
		</div>
	);
};

export default AdminLogin;
