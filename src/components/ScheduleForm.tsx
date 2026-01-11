"use client";

import React, { useState, useEffect } from "react";
import { locations, GameSchedule } from "@/data/schedule";

interface ScheduleFormProps {
	selectedSeason: string;
	onScheduleUpdate: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
	selectedSeason,
	onScheduleUpdate,
}) => {
	const [form, setForm] = useState<GameSchedule>({
		_id: "",
		date: "",
		opponent: "",
		isHome: false,
		time: "",
		season: "",
		specialGame: "",
	});
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [customTime, setCustomTime] = useState<string>("");
	const [showCustomTimeInput, setShowCustomTimeInput] =
		useState<boolean>(false);
	const [showExtraHomeSelect, setShowExtraHomeSelect] =
		useState<boolean>(false);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, isHome: e.target.checked });
		setShowExtraHomeSelect(false);
	};

	const handleExtraHomeCheckboxChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		setShowExtraHomeSelect(e.target.checked);
		if (!e.target.checked) {
			setForm({ ...form, extraHome: "" });
		}
	};

	const handleExtraHomeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target;
		setForm({ ...form, extraHome: value });
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (value === "custom") {
			setShowCustomTimeInput(true);
			setForm({ ...form, time: "" });
		} else {
			setShowCustomTimeInput(false);
			setForm({ ...form, time: value });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 필수 필드 검증
		if (!form.opponent || !form.date || !form.time) {
			alert("상대팀, 날짜, 시간을 모두 입력해주세요.");
			return;
		}

		// 백엔드 형식으로 변환
		const dateTime = form.date ? new Date(form.date) : new Date();
		const [hours, minutes] = form.time.split(":");
		dateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);

		const startDateTime = dateTime.toISOString();
		const endDateTime = new Date(dateTime);
		endDateTime.setHours(endDateTime.getHours() + 2); // 기본 2시간 경기
		const endDateTimeStr = endDateTime.toISOString();

		// FormData로 변환 (백엔드 스펙에 맞춤)
		const formData = new FormData();
		formData.append("title", form.opponent);
		formData.append("startDateTime", startDateTime);
		formData.append("endDateTime", endDateTimeStr);
		if (form.specialGame) {
			formData.append("description", form.specialGame);
		}
		formData.append(
			"location",
			form.isHome ? form.extraHome || "Home" : form.opponent
		);
		formData.append("type", form.specialGame ? "specialGame" : "game");
		formData.append("color", form.isHome ? "#EF4444" : "#3B82F6"); // 홈: 빨강, 원정: 파랑
		if (form.url) {
			formData.append("url", form.url);
		}
		formData.append("isActive", "true");

		try {
			const token = localStorage.getItem("adminToken") || "";
			let response;

			if (isEditing && form._id) {
				// 수정: PUT /api/admin/schedules/{scheduleId}
				response = await fetch(`/api/admin/schedules/${form._id}`, {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});
			} else {
				// 등록: POST /api/admin/schedules
				response = await fetch("/api/admin/schedules", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});
			}

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || errorData.message || "Failed to save schedule."
				);
			}

			const data = await response.json();

			// 폼 초기화
			setForm({
				_id: "",
				date: "",
				opponent: "",
				isHome: false,
				time: "",
				season: selectedSeason,
				specialGame: "",
			});
			setIsEditing(false);
			setShowCustomTimeInput(false);
			setShowExtraHomeSelect(false);

			// 부모 컴포넌트에 업데이트 알림
			onScheduleUpdate();
		} catch (error) {
			console.error("Failed to save schedule:", error);
			alert("경기 일정 저장에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const resetForm = () => {
		setForm({
			_id: "",
			date: "",
			opponent: "",
			isHome: false,
			time: "",
			season: selectedSeason,
			specialGame: "",
		});
		setIsEditing(false);
		setShowCustomTimeInput(false);
		setShowExtraHomeSelect(false);
	};

	// 외부에서 폼 데이터를 설정할 수 있도록 props 추가
	useEffect(() => {
		if (selectedSeason) {
			setForm((prev) => ({ ...prev, season: selectedSeason }));
		}
	}, [selectedSeason]);

	return (
		<form onSubmit={handleSubmit} className="mb-4">
			<div className="mb-2">
				<label className="block mb-1">Date</label>
				<input
					type="date"
					name="date"
					value={form.date}
					onChange={handleInputChange}
					required
					className="border px-2 py-1 w-full"
				/>
			</div>
			<div className="mb-2">
				<label className="block mb-1">Opponent</label>
				<select
					name="opponent"
					value={form.opponent}
					onChange={handleInputChange}
					required
					className="border px-2 py-1 w-full"
				>
					<option value="">Select opponent</option>
					{Object.keys(locations).map((location) => (
						<option key={location} value={location}>
							{location}
						</option>
					))}
				</select>
			</div>
			<div className="mb-2">
				<label className="block mb-1">Is Home</label>
				<input
					type="checkbox"
					name="isHome"
					checked={form.isHome}
					onChange={handleCheckboxChange}
					className="border px-2 py-1"
				/>
			</div>
			{form.isHome && (
				<div className="mb-2">
					<label className="block mb-1">Extra Home Location</label>
					<input
						type="checkbox"
						name="showExtraHome"
						checked={showExtraHomeSelect}
						onChange={handleExtraHomeCheckboxChange}
						className="border px-2 py-1"
					/>
					{showExtraHomeSelect && (
						<select
							name="extraHome"
							value={form.extraHome}
							onChange={handleExtraHomeChange}
							className="border px-2 py-1 w-full"
						>
							<option value="">Select a location</option>
							<option value="창원 실내체육관">창원 실내체육관</option>
							<option value="마산 실내체육관">마산 실내체육관</option>
							<option value="울산 동천체육관">울산 동천체육관</option>
						</select>
					)}
				</div>
			)}
			<div className="mb-2">
				<label className="block mb-1">Time</label>
				<select
					name="time"
					value={form.time}
					onChange={handleTimeChange}
					required
					className="border px-2 py-1 w-full"
				>
					<option value="">Select time</option>
					<option value="14:00">14:00</option>
					<option value="16:00">16:00</option>
					<option value="18:00">18:00</option>
					<option value="19:00">19:00</option>
					<option value="custom">Add Custom Time</option>
				</select>
				{showCustomTimeInput && (
					<input
						type="time"
						name="customTime"
						value={customTime}
						onChange={(e) => setCustomTime(e.target.value)}
						className="border px-2 py-1 w-full mt-2"
						onBlur={() => setForm({ ...form, time: customTime })}
					/>
				)}
			</div>
			<div className="mb-2">
				<label className="block mb-1">Special Game</label>
				<input
					type="text"
					name="specialGame"
					value={form.specialGame}
					onChange={handleInputChange}
					placeholder="Enter special game details (if any)"
					className="border px-2 py-1 w-full"
				/>
			</div>
			<div className="flex gap-2">
				<button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-2">
					{isEditing ? "Update Schedule" : "Add Schedule"}
				</button>
				{isEditing && (
					<button
						type="button"
						onClick={resetForm}
						className="bg-gray-500 text-white px-4 py-2 mt-2"
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	);
};

export default ScheduleForm;
