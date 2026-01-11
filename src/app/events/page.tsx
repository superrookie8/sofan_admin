"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useAdminAuth from "@/hooks/useAdminAuth";
import EventList from "@/components/GetEvents";

interface Event {
	title: string;
	url: string;
	description: string;
	date: string;
	checkFields: { [key: string]: string };
	photos: string[];
}

const ManageEvents: React.FC = () => {
	useAdminAuth();
	const router = useRouter();
	const [newEvent, setNewEvent] = useState<Event>({
		title: "",
		url: "",
		description: "",
		date: "",
		checkFields: { check_1: "", check_2: "", check_3: "" },
		photos: [],
	});
	const [checkFields, setCheckFields] = useState<string[]>(["check_one"]);
	const [showUrlField, setShowUrlField] = useState<boolean>(false);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		if (name.startsWith("check_")) {
			setNewEvent((prevState) => ({
				...prevState,
				checkFields: { ...prevState.checkFields, [name]: value },
			}));
		} else {
			setNewEvent((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const fileArray = Array.from(e.target.files);
			setNewEvent((prevState) => ({
				...prevState,
				photos: fileArray.map((file) => URL.createObjectURL(file)),
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("title", newEvent.title || "");
		
		// date를 ISO 8601 형식으로 변환
		if (newEvent.date) {
			const dateObj = new Date(newEvent.date);
			formData.append("date", dateObj.toISOString());
		}
		
		if (showUrlField && newEvent.url) {
			formData.append("url", newEvent.url || "");
		}
		formData.append("description", newEvent.description || "");

		Object.keys(newEvent.checkFields).forEach((key) => {
			formData.append(key, newEvent.checkFields[key] || "");
		});

		const photosInput = document.getElementById("photos") as HTMLInputElement;
		if (photosInput && photosInput.files) {
			Array.from(photosInput.files).forEach((file) => {
				formData.append("photos", file);
			});
		}

		const token = localStorage.getItem("adminToken") || "";
		
		// 토큰 검증
		if (!token) {
			alert("로그인이 필요합니다");
			router.push("/login");
			return;
		}
		
		// JWT 형식 확인
		const tokenParts = token.split('.');
		if (tokenParts.length !== 3) {
			console.error("잘못된 토큰 형식:", token);
			alert("인증 토큰이 유효하지 않습니다. 다시 로그인해주세요.");
			localStorage.removeItem("adminToken");
			router.push("/login");
			return;
		}

		try {
			const backendUrl = process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";
			
			const response = await fetch(`${backendUrl}/api/admin/events`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			if (response.status === 401) {
				const error = await response.json().catch(() => ({ error: "인증 실패" }));
				console.error("인증 실패:", error);
				alert(error.error || error.message || "인증이 만료되었습니다. 다시 로그인해주세요.");
				localStorage.removeItem("adminToken");
				router.push("/login");
				return;
			}

			const data = await response.json().catch(async (err) => {
				// JSON 파싱 실패 시 텍스트로 읽기
				const text = await response.text();
				console.error("Response parsing error:", err);
				console.error("Response text:", text);
				return { error: text || "알 수 없는 오류가 발생했습니다." };
			});
			
			console.log("Response data:", data);

			if (response.ok) {
				// 성공 응답: { "message": "이벤트가 생성되었습니다", "event": {...} }
				alert(data.message || "Event and photos uploaded successfully");
				setNewEvent({
					title: "",
					url: "",
					description: "",
					date: "",
					checkFields: { check_1: "", check_2: "", check_3: "" },
					photos: [],
				});
				setCheckFields(["check_one"]);
				setShowUrlField(false);
				// EventList가 업데이트되도록 트리거
				window.location.reload();
			} else {
				// 에러 응답: { "error": "..." } 또는 { "message": "..." }
				const errorMessage = data.error || data.message || JSON.stringify(data);
				console.error("Failed to upload event and photos:", data);
				alert(`Failed to upload event and photos: ${errorMessage}`);
			}
		} catch (error) {
			console.error("Error uploading event and photos:", error);
			alert("Error uploading event and photos");
		}
	};

	const addCheckField = () => {
		const newField = `check_${Object.keys(newEvent.checkFields).length + 1}`;
		setNewEvent((prevState) => ({
			...prevState,
			checkFields: { ...prevState.checkFields, [newField]: "" },
		}));
	};

	const removeCheckField = () => {
		if (Object.keys(newEvent.checkFields).length > 3) {
			const newCheckFields = { ...newEvent.checkFields };
			delete newCheckFields[
				`check_${Object.keys(newEvent.checkFields).length}`
			];
			setNewEvent((prevState) => ({
				...prevState,
				checkFields: newCheckFields,
			}));
		}
	};

	const toggleUrlField = () => {
		setShowUrlField(!showUrlField);
	};

	return (
		<div className="container mx-auto">
			<h1 className="text-2xl mb-4">Manage Events</h1>
			<form onSubmit={handleSubmit} className="mb-8">
				<div className="mb-4">
					<label className="block text-gray-700">Title</label>
					<input
						type="text"
						name="title"
						value={newEvent.title}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>
				<div className="mb-4">
					<label className="block text-gray-700">Date</label>
					<input
						type="date"
						name="date"
						value={newEvent.date}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>
				<button
					type="button"
					onClick={toggleUrlField}
					className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
				>
					{showUrlField ? "Remove URL" : "Add URL"}
				</button>
				{showUrlField && (
					<div className="mb-4">
						<label className="block text-gray-700">Event Page URL</label>
						<input
							type="text"
							name="url"
							value={newEvent.url}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2"
						/>
					</div>
				)}
				<div className="mb-4">
					<label className="block text-gray-700">Description</label>
					<textarea
						name="description"
						value={newEvent.description}
						onChange={handleChange}
						className="w-full border rounded px-3 py-2"
						required
					/>
				</div>
				{Object.keys(newEvent.checkFields).map((field, index) => (
					<div key={index} className="mb-4">
						<label className="block text-gray-700">Check {index + 1}</label>
						<input
							type="text"
							name={field}
							value={(newEvent.checkFields as any)[field] || ""}
							onChange={handleChange}
							className="w-full border rounded px-3 py-2"
						/>
					</div>
				))}
				<div className="flex mb-4">
					<button
						type="button"
						onClick={addCheckField}
						className="mr-4 bg-green-500 text-white px-4 py-2 rounded"
					>
						Add Check Field
					</button>
					<button
						type="button"
						onClick={removeCheckField}
						className="bg-red-500 text-white px-4 py-2 rounded"
					>
						Delete Check Field
					</button>
				</div>
				<div className="mb-4">
					<label className="block text-gray-700">Image</label>
					<input
						type="file"
						name="image"
						onChange={handleImageChange}
						multiple
						id="photos"
						className="w-full border rounded px-3 py-2"
					/>
				</div>
				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					Add Event
				</button>
			</form>
			<EventList />
		</div>
	);
};

export default ManageEvents;
