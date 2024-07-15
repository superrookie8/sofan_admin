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
	});
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [customTime, setCustomTime] = useState<string>("");
	const [showCustomTimeInput, setShowCustomTimeInput] =
		useState<boolean>(false);
	const [showExtraHomeSelect, setShowExtraHomeSelect] =
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
						Authorization: `Bearer ${sessionStorage.getItem("admin-token")}`,
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch seasons.");
				}

				const data = await response.json();
				setSeasons(data);
				// 기존에 저장된 시즌이 있을 경우 가장 최근 시즌을 초기 선택 시즌으로 설정
				if (data.length > 0) {
					setSelectedSeason(data[data.length - 1]);
				}
			} catch (error) {
				console.error("Failed to fetch seasons:", error);
			}
		};

		fetchSeasons();
	}, []);

	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				const response = await fetch(
					`/api/admin/getschedule?season=${selectedSeason}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${sessionStorage.getItem("admin-token")}`,
						},
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to fetch schedules.");
				}

				const data = await response.json();
				setScheduleList(data);
				setFilteredScheduleList(data); // Set the filtered list initially
			} catch (error) {
				console.error("Failed to fetch schedules:", error);
			}
		};

		if (selectedSeason) {
			fetchSchedules();
		}
	}, [selectedSeason]);

	useEffect(() => {
		let filteredList = scheduleList;
		if (homeFilter === "home") {
			filteredList = scheduleList.filter((schedule) => schedule.isHome);
		} else if (homeFilter === "away") {
			filteredList = scheduleList.filter((schedule) => !schedule.isHome);
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
		const updatedForm = { ...form, season: selectedSeason };

		if (!showExtraHomeSelect) {
			delete updatedForm.extraHome;
		}

		try {
			const response = await fetch("/api/admin/postschedule", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("admin-token")}`,
				},
				body: JSON.stringify(updatedForm),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to create or update schedule."
				);
			}

			const data = await response.json();
			const updatedList = isEditing
				? scheduleList.map((schedule) =>
						schedule._id === form._id
							? { ...form, _id: schedule._id }
							: schedule
				  )
				: [...scheduleList, { ...form, _id: data._id }];

			updatedList.sort(
				(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
			);

			setScheduleList(updatedList);
			setFilteredScheduleList(updatedList); // Update the filtered list
			setForm({
				_id: "",
				date: "",
				opponent: "",
				isHome: false,
				time: "",
				season: selectedSeason,
			});
			setIsEditing(false);
			setShowCustomTimeInput(false);
			setShowExtraHomeSelect(false);
		} catch (error) {
			console.error("Failed to save schedule:", error);
		}
	};

	const handleEdit = (schedule: GameSchedule) => {
		setForm(schedule);
		setIsEditing(true);
		setShowCustomTimeInput(
			schedule.time !== "14:00" &&
				schedule.time !== "18:00" &&
				schedule.time !== "19:00"
		);
		if (
			schedule.time !== "14:00" &&
			schedule.time !== "18:00" &&
			schedule.time !== "19:00"
		) {
			setCustomTime(schedule.time);
		} else {
			setCustomTime("");
		}
		setShowExtraHomeSelect(schedule.isHome && schedule.extraHome !== "");
	};

	const handleDelete = async (scheduleId: string) => {
		try {
			const response = await fetch("/api/admin/deleteschedule", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${sessionStorage.getItem("admin-token")}`,
				},
				body: JSON.stringify({ _id: scheduleId }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete schedule.");
			}

			const updatedList = scheduleList.filter(
				(schedule) => schedule._id !== scheduleId
			);
			setScheduleList(updatedList);
			setFilteredScheduleList(updatedList); // Update the filtered list
		} catch (error) {
			console.error("Failed to delete schedule:", error);
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
			setSelectedSeason("2023-2024");
			setSeasons(["2023-2024"]);
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
								value={form.opponent}
								onChange={handleInputChange}
								required
								className="border px-2 py-1 w-full"
							>
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
								<option value="14:00">14:00</option>
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
												- {schedule.time}
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
