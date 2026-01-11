"use client";
import React, { useState, useEffect } from "react";
import { locations, GameSchedule } from "@/data/schedule";
import useAdminAuth from "@/hooks/useAdminAuth";

const AdminSchedule: React.FC = () => {
	useAdminAuth();
	const [scheduleList, setScheduleList] = useState<GameSchedule[]>([]);
	const [filteredScheduleList, setFilteredScheduleList] = useState<
		GameSchedule[]
	>([]);
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
	const [showCustomOpponentInput, setShowCustomOpponentInput] =
		useState<boolean>(false);
	const [seasons, setSeasons] = useState<string[]>([]);
	const [selectedSeason, setSelectedSeason] = useState<string>("");
	const [homeFilter, setHomeFilter] = useState<string>("all");

	useEffect(() => {
		const fetchSeasons = async () => {
			try {
				const response = await fetch("/api/admin/getseasons", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch seasons.");
				}

				const data = await response.json();
				setSeasons(data);
				if (data.length > 0) {
					setSelectedSeason(data[data.length - 1]);
				} else {
					setSelectedSeason("2025-2026");
					setSeasons(["2025-2026"]);
				}
			} catch (error) {
				console.error("Failed to fetch seasons:", error);
			}
		};

		fetchSeasons();
	}, []);

	const fetchSchedules = React.useCallback(async () => {
		try {
			const response = await fetch(`/api/admin/schedules`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || errorData.message || "Failed to fetch schedules."
				);
			}

			const data = await response.json();
			// 백엔드에서 반환하는 스케줄 배열을 GameSchedule 형식으로 변환
			// 시즌별 필터링은 프론트엔드에서 처리 (백엔드가 전체 조회만 제공)
			const convertedSchedules = Array.isArray(data)
				? data
						.filter((schedule: any) => {
							// 시즌별 필터링 로직 (startDateTime 기준으로 시즌 판단)
							if (!selectedSeason) return true;
							const startDate = new Date(schedule.startDateTime);
							const year = startDate.getFullYear();
							const [startYear] = selectedSeason.split("-").map(Number);
							return year === startYear || year === startYear + 1;
						})
						.map((schedule: any) => {
							const startDate = new Date(schedule.startDateTime);
							const timeStr = startDate.toTimeString().slice(0, 5); // HH:mm 형식

							return {
								_id: schedule.id || schedule._id || "",
								date: startDate.toISOString().split("T")[0], // YYYY-MM-DD
								opponent: schedule.title || "",
								isHome:
									schedule.location?.includes("Home") ||
									schedule.type === "home",
								time: timeStr,
								season: selectedSeason,
								specialGame: schedule.description || "",
								extraHome:
									schedule.location && !schedule.location.includes("Home")
										? schedule.location
										: undefined,
							};
						})
				: [];
			setScheduleList(convertedSchedules);
			setFilteredScheduleList(convertedSchedules);
		} catch (error) {
			console.error("Failed to fetch schedules:", error);
		}
	}, [selectedSeason]);

	useEffect(() => {
		if (selectedSeason) {
			fetchSchedules();
		}
	}, [selectedSeason, fetchSchedules]);

	useEffect(() => {
		let filteredList = scheduleList;
		if (homeFilter === "home") {
			filteredList = scheduleList.filter((schedule) => schedule.isHome);
		} else if (homeFilter === "away") {
			filteredList = scheduleList.filter((schedule) => !schedule.isHome);
		} else if (homeFilter === "specialGame") {
			filteredList = scheduleList.filter((schedule) => schedule.specialGame);
		}
		setFilteredScheduleList(filteredList);
	}, [homeFilter, scheduleList]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isHome = e.target.checked;
		setForm({
			...form,
			isHome,
			extraHome: isHome ? form.extraHome : undefined,
		});
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

	const handleOpponentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		if (value === "custom") {
			setShowCustomOpponentInput(true);
			setForm({ ...form, opponent: "" });
		} else {
			setShowCustomOpponentInput(false);
			setForm({ ...form, opponent: value });
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// 필수 필드 검증
		if (!form.opponent || !form.date || !form.time) {
			alert("상대팀, 날짜, 시간을 모두 입력해주세요.");
			return;
		}

		// 백엔드 형식으로 변환 (한국 시간대, ISO 8601 형식)
		const [hours, minutes] = form.time.split(":");
		const dateStr = form.date || new Date().toISOString().split("T")[0];
		// 시간대 정보 없이 직접 조합 (한국 시간으로 간주)
		const startDateTime = `${dateStr}T${hours}:${minutes}:00`; // 'YYYY-MM-DDTHH:mm:ss' 형식

		// FormData로 변환 (백엔드 스펙에 맞춤)
		const formData = new FormData();
		formData.append("title", form.opponent);
		formData.append("startDateTime", startDateTime);
		// endDateTime은 백엔드에서 자동으로 시작시간 + 2시간으로 설정됨
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

		// 디버깅: FormData 내용 확인
		console.log("FormData 내용:");
		Array.from(formData.entries()).forEach(([key, value]) => {
			console.log(key, ":", value);
		});

		try {
			const token = localStorage.getItem("adminToken") || "";
			let response;

			if (isEditing) {
				if (!form._id) {
					alert("수정할 스케줄 ID가 없습니다.");
					return;
				}
				// 수정: PUT /api/admin/schedules/{scheduleId}
				console.log("수정 요청:", form._id, form);
				response = await fetch(`/api/admin/schedules/${form._id}`, {
					method: "PUT",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});
			} else {
				// 등록: POST /api/admin/schedules
				console.log("등록 요청:", form);
				response = await fetch("/api/admin/schedules", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				});
			}

			if (!response.ok) {
				const errorData = await response
					.json()
					.catch(() => ({ error: "Unknown error" }));
				console.error("요청 실패:", response.status, errorData);
				const errorMessage =
					errorData.error || errorData.message || "Failed to save schedule.";
				alert(`오류: ${errorMessage} (상태 코드: ${response.status})`);
				throw new Error(errorMessage);
			}

			const data = await response.json();
			console.log("응답 데이터:", data);

			// 수정/등록 성공 후 서버에서 최신 데이터 다시 불러오기
			await fetchSchedules();
			alert(
				isEditing
					? "경기 일정이 수정되었습니다."
					: "경기 일정이 등록되었습니다."
			);

			// 폼 초기화
			setForm({
				_id: "",
				date: "",
				opponent: "",
				isHome: false,
				time: "",
				season: selectedSeason,
				specialGame: "",
				extraHome: undefined,
			});
			setIsEditing(false);
			setShowCustomTimeInput(false);
			setShowExtraHomeSelect(false);
			setShowCustomOpponentInput(false);
			setCustomTime("");
		} catch (error) {
			console.error("Failed to save schedule:", error);
			alert("경기 일정 저장에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleEdit = (schedule: GameSchedule) => {
		setForm(schedule);
		setIsEditing(true);

		// Time 처리: 기본 시간인지 커스텀 시간인지 확인
		const isCustomTime =
			schedule.time !== "14:00" &&
			schedule.time !== "16:00" &&
			schedule.time !== "18:00" &&
			schedule.time !== "19:00";

		setShowCustomTimeInput(isCustomTime);
		if (isCustomTime) {
			setCustomTime(schedule.time);
		} else {
			setCustomTime("");
		}

		// ExtraHome 처리: isHome이 true이고 extraHome이 실제로 값이 있을 때만 체크
		const hasExtraHome = !!(
			schedule.isHome &&
			schedule.extraHome &&
			schedule.extraHome !== ""
		);
		setShowExtraHomeSelect(hasExtraHome);

		// Opponent 처리: 커스텀 상대팀인지 확인
		const isCustomOpponent = !Object.keys(locations).includes(
			schedule.opponent
		);
		setShowCustomOpponentInput(isCustomOpponent);
	};

	const handleDelete = async (scheduleId: string) => {
		try {
			const response = await fetch(`/api/admin/schedules/${scheduleId}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || errorData.message || "Failed to delete schedule."
				);
			}

			// 삭제 성공 후 서버에서 최신 데이터 다시 불러오기
			await fetchSchedules();
		} catch (error) {
			console.error("Failed to delete schedule:", error);
			alert("경기 일정 삭제에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const addNewSeason = () => {
		if (seasons.length > 0) {
			const lastSeason = seasons[seasons.length - 1];
			const [startYear, endYear] = lastSeason.split("-").map(Number);
			const newSeason = `${startYear + 1}-${endYear + 1}`;
			setSelectedSeason(newSeason);
			setSeasons([...seasons, newSeason]);
		} else {
			setSelectedSeason("2025-2026");
			setSeasons(["2025-2026"]);
		}
	};

	const handleHomeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setHomeFilter(e.target.value);
	};

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Manage Game Schedules</h1>
			<div className="mb-4">
				{seasons.map((season) => (
					<button
						key={season}
						onClick={() => setSelectedSeason(season)}
						className={`px-4 py-2 mr-2 ${
							selectedSeason === season
								? "bg-blue-500 text-white"
								: "bg-gray-300"
						}`}
					>
						{season}
					</button>
				))}
				<button
					onClick={addNewSeason}
					className="px-4 py-2 bg-green-500 text-white"
				>
					New Season
				</button>
			</div>
			{selectedSeason && (
				<>
					<h2 className="text-xl font-bold mb-4">{selectedSeason} Schedule</h2>
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
								value={showCustomOpponentInput ? "custom" : form.opponent}
								onChange={handleOpponentChange}
								required
								className="border px-2 py-1 w-full"
							>
								{Object.keys(locations).map((location) => (
									<option key={location} value={location}>
										{location}
									</option>
								))}
								<option value="custom">기타 (직접 입력)</option>
							</select>
							{showCustomOpponentInput && (
								<input
									type="text"
									name="opponent"
									value={form.opponent}
									onChange={handleInputChange}
									placeholder="상대팀 이름을 입력하세요"
									required
									className="border px-2 py-1 w-full mt-2"
								/>
							)}
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
								value={showCustomTimeInput ? "custom" : form.time}
								onChange={handleTimeChange}
								required
								className="border px-2 py-1 w-full"
							>
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
									onChange={(e) => {
										const newTime = e.target.value;
										setCustomTime(newTime);
										setForm({ ...form, time: newTime });
									}}
									className="border px-2 py-1 w-full mt-2"
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
						<button
							type="submit"
							className="bg-blue-500 text-white px-4 py-2 mt-2"
						>
							{isEditing ? "Update Schedule" : "Add Schedule"}
						</button>
					</form>

					<div>
						<div className="flex">
							<h2 className="text-xl font-bold mb-2 mr-4">Schedule List</h2>
							<div className="mb-4">
								<select
									value={homeFilter}
									onChange={handleHomeFilterChange}
									className="border px-2 py-1 w-full"
								>
									<option value="all">All</option>
									<option value="home">Home</option>
									<option value="away">Away</option>
									<option value="specialGame">Special Game</option>
								</select>
							</div>
						</div>
						<div className="h-64 overflow-y-auto">
							<ul>
								{filteredScheduleList.map((schedule) => (
									<li
										key={schedule._id}
										className="border p-2 mb-2 flex justify-between"
									>
										<div>
											<span>
												{schedule.date} - {schedule.opponent} -{" "}
												{schedule.isHome
													? `Home ${
															schedule.extraHome
																? `(${schedule.extraHome})`
																: ""
													  }`
													: "Away"}{" "}
												- {schedule.time}{" "}
												{schedule.specialGame &&
													`- Special: ${schedule.specialGame}`}
											</span>
										</div>
										<div>
											<button
												onClick={() => handleEdit(schedule)}
												className="bg-yellow-500 text-white px-2 py-1 mr-2"
											>
												Edit
											</button>
											<button
												onClick={() => handleDelete(schedule._id)}
												className="bg-red-500 text-white px-2 py-1"
											>
												Delete
											</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default AdminSchedule;
