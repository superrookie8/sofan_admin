"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminLogin: React.FC = () => {
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("adminToken");
		if (token) {
			router.push("/");
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const backendUrl = process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";
			
			const response = await fetch(`${backendUrl}/api/admin/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// JWT 토큰 검증
				const token = data.token;
				if (!token) {
					setMessage("토큰을 받지 못했습니다.");
					return;
				}

				const tokenParts = token.split('.');
				if (tokenParts.length !== 3) {
					console.error("잘못된 JWT 형식:", token);
					setMessage("인증 토큰이 유효하지 않습니다.");
					return;
				}

				// localStorage에 adminToken으로 저장
				localStorage.setItem("adminToken", token);
				console.log("로그인 성공, 토큰 저장됨");
				router.push("/");
			} else {
				// 백엔드 에러 형식: { "error": "아이디 또는 비밀번호가 올바르지 않습니다" }
				setMessage(data.error || data.message || "로그인에 실패했습니다.");
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
