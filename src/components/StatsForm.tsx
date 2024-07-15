"use client";

import useAdminAuth from "../hooks/useAdminAuth";
import React, { useState, useEffect } from "react";

interface AverageData {
	G: number;
	MPG: string;
	"2P%": number;
	"3P%": number;
	FT: number;
	OFF: number;
	DEF: number;
	TOT: number;
	APG: number;
	SPG: number;
	BPG: number;
	TO: number;
	PF: number;
	PPG: number;
}

interface TotalData {
	MIN: string;
	"FGM-A": string;
	"3PM-A": string;
	"FTM-A": string;
	OFF: number;
	DEF: number;
	TOT: number;
	AST: number;
	STL: number;
	BLK: number;
	TO: number;
	PF: number;
	PTS: number;
}

interface StatsData {
	_id?: string;
	season: string;
	average: AverageData;
	total: TotalData;
}

const StatsForm: React.FC = () => {
	useAdminAuth();
	const [stats, setStats] = useState<StatsData[]>([]);
	const [currentStat, setCurrentStat] = useState<StatsData>({
		season: "",
		average: {
			G: 0,
			MPG: "00:00",
			"2P%": 0,
			"3P%": 0,
			FT: 0,
			OFF: 0,
			DEF: 0,
			TOT: 0,
			APG: 0,
			SPG: 0,
			BPG: 0,
			TO: 0,
			PF: 0,
			PPG: 0,
		},
		total: {
			MIN: "00:00",
			"FGM-A": "0-0",
			"3PM-A": "0-0",
			"FTM-A": "0-0",
			OFF: 0,
			DEF: 0,
			TOT: 0,
			AST: 0,
			STL: 0,
			BLK: 0,
			TO: 0,
			PF: 0,
			PTS: 0,
		},
	});
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/admin/getstats");
			if (!response.ok) {
				throw new Error("Failed to fetch stats from backend");
			}
			const data = await response.json();
			console.log("Fetched data:", data); // 데이터 확인을 위한 로그
			setStats(data);
		} catch (error) {
			console.error("Error fetching stats:", error);
			setError("An error occurred while fetching the stats.");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const token = sessionStorage.getItem("admin-token");

			if (!token) {
				setError("You are not authorized to perform this action.");
				return;
			}

			const response = await fetch("/api/admin/stats", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(currentStat),
			});

			const data = await response.json();
			if (response.ok) {
				fetchStats();
				setCurrentStat({
					season: "",
					average: {
						G: 0,
						MPG: "00:00",
						"2P%": 0,
						"3P%": 0,
						FT: 0,
						OFF: 0,
						DEF: 0,
						TOT: 0,
						APG: 0,
						SPG: 0,
						BPG: 0,
						TO: 0,
						PF: 0,
						PPG: 0,
					},
					total: {
						MIN: "00:00",
						"FGM-A": "0-0",
						"3PM-A": "0-0",
						"FTM-A": "0-0",
						OFF: 0,
						DEF: 0,
						TOT: 0,
						AST: 0,
						STL: 0,
						BLK: 0,
						TO: 0,
						PF: 0,
						PTS: 0,
					},
				});
				setMessage("Stats saved successfully!");
			} else {
				setMessage(data.message || "Failed to save stats.");
			}
		} catch (error) {
			console.error("Error saving stats:", error);
			setMessage("An error occurred while saving the stats.");
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const [category, key] = name.split(".");

		setCurrentStat((prevState) => {
			const updatedStat = { ...prevState };

			if (category === "average" || category === "total") {
				if (
					key === "MPG" ||
					key === "MIN" ||
					key === "FGM-A" ||
					key === "3PM-A" ||
					key === "FTM-A"
				) {
					(updatedStat[category as keyof StatsData] as any)[key] = value;
				} else {
					const parsedValue = value === "" ? 0 : parseFloat(value);
					(updatedStat[category as keyof StatsData] as any)[key] = isNaN(
						parsedValue
					)
						? 0
						: parsedValue;
				}
			} else {
				(updatedStat as any)[key] = value;
			}

			return updatedStat;
		});
	};

	const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedSeason = e.target.value;
		const selectedStat = stats.find((stat) => stat.season === selectedSeason);
		if (selectedStat) {
			setCurrentStat(selectedStat);
		}
	};

	return (
		<div>
			<h1>Manage Stats</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<select onChange={handleSeasonChange} value={currentStat.season}>
						<option value="">Select a season</option>
						{stats.map((stat) => (
							<option key={stat._id} value={stat.season}>
								{stat.season}
							</option>
						))}
					</select>
				</div>
				<div>
					<label>Season:</label>
					<input
						name="season"
						value={currentStat.season}
						onChange={(e) =>
							setCurrentStat({ ...currentStat, season: e.target.value })
						}
					/>
				</div>
				<h2>Average Records</h2>
				{Object.entries(currentStat.average).map(([key, value]) => (
					<div key={key}>
						<label>{key}:</label>
						<input
							type={typeof value === "number" ? "number" : "text"}
							step="any"
							name={`average.${key}`}
							value={value}
							onChange={handleChange}
						/>
					</div>
				))}
				<h2>Total Records</h2>
				{Object.entries(currentStat.total).map(([key, value]) => (
					<div key={key}>
						<label>{key}:</label>
						<input
							type={typeof value === "number" ? "number" : "text"}
							step="any"
							name={`total.${key}`}
							value={value}
							onChange={handleChange}
						/>
					</div>
				))}
				<button type="submit">Save Stats</button>
				{message && <p>{message}</p>}
				{error && <p>{error}</p>}
			</form>
			<h2>Existing Stats</h2>
			<ul>
				{stats.map((stat) => (
					<li key={stat._id} onClick={() => setCurrentStat(stat)}>
						{stat.season}
					</li>
				))}
			</ul>
		</div>
	);
};

export default StatsForm;
