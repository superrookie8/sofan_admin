"use client";

import useAdminAuth from "../hooks/useAdminAuth";
import React, { useState, useEffect } from "react";
import { PlayerStat } from "../lib/api/types";

const StatsForm: React.FC = () => {
	useAdminAuth();
	const [stats, setStats] = useState<PlayerStat[]>([]);
	const [currentStat, setCurrentStat] = useState<PlayerStat>({
		season: "",
		team: "",
		gamesPlayed: undefined,
		minutesPerGame: undefined,
		twoPointPercent: undefined,
		threePointPercent: undefined,
		freeThrowPercent: undefined,
		offensiveRebounds: undefined,
		defensiveRebounds: undefined,
		totalRebounds: undefined,
		ppg: undefined,
		apg: undefined,
		spg: undefined,
		bpg: undefined,
		turnovers: undefined,
		fouls: undefined,
		totalMinutes: undefined,
		twoPointMade: undefined,
		twoPointAttempted: undefined,
		threePointMade: undefined,
		threePointAttempted: undefined,
		freeThrowMade: undefined,
		freeThrowAttempted: undefined,
		totalOffensiveRebounds: undefined,
		totalDefensiveRebounds: undefined,
		totalTotalRebounds: undefined,
		totalAssists: undefined,
		totalSteals: undefined,
		totalBlocks: undefined,
		totalTurnovers: undefined,
		totalFouls: undefined,
		totalPoints: undefined,
	});
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const fetchStats = async () => {
		try {
			const token = localStorage.getItem("adminToken");
			if (!token) {
				setError("인증 토큰이 없습니다.");
				return;
			}

			const backendUrl =
				process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";

			const response = await fetch(`${backendUrl}/api/admin/playerstat`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 401) {
				const error = await response
					.json()
					.catch(() => ({ error: "인증 실패" }));
				console.error("인증 실패:", error);
				localStorage.removeItem("adminToken");
				window.location.href = "/login";
				return;
			}

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to fetch stats from backend"
				);
			}

			const data = await response.json();
			console.log("Fetched data:", data);
			setStats(Array.isArray(data) ? data : []);
		} catch (error) {
			console.error("Error fetching stats:", error);
			setError("스탯을 불러오는 중 오류가 발생했습니다.");
		}
	};

	const resetForm = () => {
		setCurrentStat({
			season: "",
			team: "",
			gamesPlayed: undefined,
			minutesPerGame: undefined,
			twoPointPercent: undefined,
			threePointPercent: undefined,
			freeThrowPercent: undefined,
			offensiveRebounds: undefined,
			defensiveRebounds: undefined,
			totalRebounds: undefined,
			ppg: undefined,
			apg: undefined,
			spg: undefined,
			bpg: undefined,
			turnovers: undefined,
			fouls: undefined,
			totalMinutes: undefined,
			twoPointMade: undefined,
			twoPointAttempted: undefined,
			threePointMade: undefined,
			threePointAttempted: undefined,
			freeThrowMade: undefined,
			freeThrowAttempted: undefined,
			totalOffensiveRebounds: undefined,
			totalDefensiveRebounds: undefined,
			totalTotalRebounds: undefined,
			totalAssists: undefined,
			totalSteals: undefined,
			totalBlocks: undefined,
			totalTurnovers: undefined,
			totalFouls: undefined,
			totalPoints: undefined,
		});
		setIsEditing(false);
		setMessage(null);
		setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const token = localStorage.getItem("adminToken");

			if (!token) {
				setError("인증 토큰이 없습니다.");
				return;
			}

			const backendUrl =
				process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";

			// 빈 값 제거 (undefined, null, 빈 문자열)
			const cleanedStat = Object.fromEntries(
				Object.entries(currentStat).filter(
					([_, value]) => value !== undefined && value !== null && value !== ""
				)
			) as PlayerStat;

			let response;
			if (isEditing && currentStat.id) {
				// 수정: PUT /api/admin/playerstat/{statId}
				response = await fetch(
					`${backendUrl}/api/admin/playerstat/${currentStat.id}`,
					{
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(cleanedStat),
					}
				);
			} else {
				// 생성: POST /api/admin/playerstat
				response = await fetch(`${backendUrl}/api/admin/playerstat`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(cleanedStat),
				});
			}

			if (response.status === 401) {
				const error = await response
					.json()
					.catch(() => ({ error: "인증 실패" }));
				console.error("인증 실패:", error);
				localStorage.removeItem("adminToken");
				window.location.href = "/login";
				return;
			}

			const data = await response.json();
			if (response.ok) {
				await fetchStats();
				resetForm();
				setMessage(
					isEditing ? "스탯이 수정되었습니다." : "스탯이 생성되었습니다."
				);
			} else {
				setError(data.error || data.message || "스탯 저장에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error saving stats:", error);
			setError("스탯 저장 중 오류가 발생했습니다.");
		}
	};

	const handleDelete = async (statId: string) => {
		if (!confirm("정말로 이 스탯을 삭제하시겠습니까?")) {
			return;
		}

		try {
			const token = localStorage.getItem("adminToken");
			if (!token) {
				setError("인증 토큰이 없습니다.");
				return;
			}

			const backendUrl =
				process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";

			const response = await fetch(
				`${backendUrl}/api/admin/playerstat/${statId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.status === 401) {
				const error = await response
					.json()
					.catch(() => ({ error: "인증 실패" }));
				console.error("인증 실패:", error);
				localStorage.removeItem("adminToken");
				window.location.href = "/login";
				return;
			}

			if (response.ok) {
				await fetchStats();
				resetForm();
				setMessage("스탯이 삭제되었습니다.");
			} else {
				const data = await response.json();
				setError(data.error || data.message || "스탯 삭제에 실패했습니다.");
			}
		} catch (error) {
			console.error("Error deleting stats:", error);
			setError("스탯 삭제 중 오류가 발생했습니다.");
		}
	};

	const handleEdit = (stat: PlayerStat) => {
		setCurrentStat(stat);
		setIsEditing(true);
		setMessage(null);
		setError(null);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		const input = e.target as HTMLInputElement;

		setCurrentStat((prev) => {
			if (type === "number") {
				const numValue = value === "" ? undefined : parseFloat(value);
				return {
					...prev,
					[name]: isNaN(numValue as number) ? undefined : numValue,
				};
			}
			return {
				...prev,
				[name]: value,
			};
		});
	};

	useEffect(() => {
		fetchStats();
	}, []);

	// 필드 그룹 정의
	const averageFields = [
		{ key: "gamesPlayed", label: "경기 수", type: "number" },
		{
			key: "minutesPerGame",
			label: "경기당 출전시간 (예: 33:52)",
			type: "text",
		},
		{
			key: "twoPointPercent",
			label: "2점슛 성공률 (%)",
			type: "number",
			step: "0.1",
		},
		{
			key: "threePointPercent",
			label: "3점슛 성공률 (%)",
			type: "number",
			step: "0.1",
		},
		{
			key: "freeThrowPercent",
			label: "자유투 성공률 (%)",
			type: "number",
			step: "0.1",
		},
		{
			key: "offensiveRebounds",
			label: "공격 리바운드 (평균)",
			type: "number",
			step: "0.1",
		},
		{
			key: "defensiveRebounds",
			label: "수비 리바운드 (평균)",
			type: "number",
			step: "0.1",
		},
		{
			key: "totalRebounds",
			label: "총 리바운드 (평균)",
			type: "number",
			step: "0.1",
		},
		{ key: "ppg", label: "경기당 득점 (PPG)", type: "number", step: "0.1" },
		{ key: "apg", label: "경기당 어시스트 (APG)", type: "number", step: "0.1" },
		{ key: "spg", label: "경기당 스틸 (SPG)", type: "number", step: "0.1" },
		{ key: "bpg", label: "경기당 블락 (BPG)", type: "number", step: "0.1" },
		{ key: "turnovers", label: "경기당 턴오버", type: "number", step: "0.1" },
		{ key: "fouls", label: "경기당 파울", type: "number", step: "0.1" },
	];

	const totalFields = [
		{ key: "totalMinutes", label: "총 출전시간 (예: 440:28)", type: "text" },
		{ key: "twoPointMade", label: "2점슛 성공", type: "number" },
		{ key: "twoPointAttempted", label: "2점슛 시도", type: "number" },
		{ key: "threePointMade", label: "3점슛 성공", type: "number" },
		{ key: "threePointAttempted", label: "3점슛 시도", type: "number" },
		{ key: "freeThrowMade", label: "자유투 성공", type: "number" },
		{ key: "freeThrowAttempted", label: "자유투 시도", type: "number" },
		{
			key: "totalOffensiveRebounds",
			label: "공격 리바운드 총합",
			type: "number",
		},
		{
			key: "totalDefensiveRebounds",
			label: "수비 리바운드 총합",
			type: "number",
		},
		{ key: "totalTotalRebounds", label: "총 리바운드 총합", type: "number" },
		{ key: "totalAssists", label: "어시스트 총합", type: "number" },
		{ key: "totalSteals", label: "스틸 총합", type: "number" },
		{ key: "totalBlocks", label: "블락 총합", type: "number" },
		{ key: "totalTurnovers", label: "턴오버 총합", type: "number" },
		{ key: "totalFouls", label: "파울 총합", type: "number" },
		{ key: "totalPoints", label: "득점 총합", type: "number" },
	];

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Manage Stats</h1>

			{message && (
				<div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
					{message}
				</div>
			)}
			{error && (
				<div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
			)}

			<form onSubmit={handleSubmit} className="mb-6">
				<div className="mb-4">
					<label className="block mb-1 font-semibold">시즌</label>
					<input
						type="text"
						name="season"
						value={currentStat.season || ""}
						onChange={handleChange}
						placeholder="예: 2025-2026"
						className="border px-2 py-1 w-full"
						required
					/>
				</div>

				<div className="mb-4">
					<label className="block mb-1 font-semibold">팀명</label>
					<input
						type="text"
						name="team"
						value={currentStat.team || ""}
						onChange={handleChange}
						placeholder="예: BNK 썸"
						className="border px-2 py-1 w-full"
					/>
				</div>

				<h2 className="text-xl font-bold mt-6 mb-4">통산평균기록</h2>
				<div className="grid grid-cols-2 gap-4 mb-6">
					{averageFields.map((field) => (
						<div key={field.key}>
							<label className="block mb-1">{field.label}</label>
							<input
								type={field.type}
								name={field.key}
								value={currentStat[field.key as keyof PlayerStat] || ""}
								onChange={handleChange}
								step={field.step}
								className="border px-2 py-1 w-full"
							/>
						</div>
					))}
				</div>

				<h2 className="text-xl font-bold mt-6 mb-4">통산합계기록</h2>
				<div className="grid grid-cols-2 gap-4 mb-6">
					{totalFields.map((field) => (
						<div key={field.key}>
							<label className="block mb-1">{field.label}</label>
							<input
								type={field.type}
								name={field.key}
								value={currentStat[field.key as keyof PlayerStat] || ""}
								onChange={handleChange}
								step={field.step}
								className="border px-2 py-1 w-full"
							/>
						</div>
					))}
				</div>

				<div className="flex gap-2">
					<button
						type="submit"
						className="bg-blue-500 text-white px-4 py-2 rounded"
					>
						{isEditing ? "수정" : "생성"}
					</button>
					{isEditing && (
						<button
							type="button"
							onClick={resetForm}
							className="bg-gray-500 text-white px-4 py-2 rounded"
						>
							취소
						</button>
					)}
				</div>
			</form>

			<h2 className="text-xl font-bold mt-6 mb-4">기존 스탯 목록</h2>
			<div className="overflow-x-auto">
				<table className="min-w-full border-collapse border border-gray-300">
					<thead>
						<tr className="bg-gray-100">
							<th className="border px-4 py-2">시즌</th>
							<th className="border px-4 py-2">팀</th>
							<th className="border px-4 py-2">경기 수</th>
							<th className="border px-4 py-2">PPG</th>
							<th className="border px-4 py-2">작업</th>
						</tr>
					</thead>
					<tbody>
						{stats.map((stat) => (
							<tr key={stat.id || stat.season}>
								<td className="border px-4 py-2">{stat.season}</td>
								<td className="border px-4 py-2">{stat.team || "-"}</td>
								<td className="border px-4 py-2">{stat.gamesPlayed || "-"}</td>
								<td className="border px-4 py-2">{stat.ppg || "-"}</td>
								<td className="border px-4 py-2">
									<button
										onClick={() => handleEdit(stat)}
										className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
									>
										수정
									</button>
									<button
										onClick={() => stat.id && handleDelete(stat.id)}
										className="bg-red-500 text-white px-2 py-1 rounded"
									>
										삭제
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default StatsForm;
