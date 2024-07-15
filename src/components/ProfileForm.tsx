"use client";

import React, { useEffect, useState } from "react";

interface ProfileData {
	name: string;
	team: string;
	position: string;
	number: string;
	height: string;
	nickname: string;
	features: string;
}

const ProfileForm: React.FC = () => {
	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const token = sessionStorage.getItem("admin-token");

				if (!token) {
					setError("You are not authorized to perform this action.");
					return;
				}

				const response = await fetch("/api/admin/getprofile", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error("Failed to fetch profile data");
				}

				const data = await response.json();
				setProfile(data);
				console.log("Profile data:", data);
			} catch (error) {
				console.error("Error fetching profile:", error);
				setError("An error occurred while fetching the profile.");
			}
		};

		fetchProfile();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const token = sessionStorage.getItem("admin-token");

			if (!token) {
				setError("You are not authorized to perform this action.");
				return;
			}

			const response = await fetch("/api/admin/profile", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(profile),
			});

			if (!response.ok) {
				throw new Error("Failed to save profile data");
			}

			const data = await response.json();
			setMessage("Profile saved successfully!");
		} catch (error) {
			console.error("Error saving profile:", error);
			setMessage("An error occurred while saving the profile.");
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		setProfile({ ...profile, [e.target.name]: e.target.value } as ProfileData);
	};

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>Loading...</div>;
	}

	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label>Name:</label>
				<input name="name" value={profile.name} onChange={handleChange} />
			</div>
			<div>
				<label>Team:</label>
				<input name="team" value={profile.team || ""} onChange={handleChange} />
			</div>
			<div>
				<label>Position:</label>
				<input
					name="position"
					value={profile.position}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Number:</label>
				<input name="number" value={profile.number} onChange={handleChange} />
			</div>
			<div>
				<label>Height:</label>
				<input name="height" value={profile.height} onChange={handleChange} />
			</div>
			<div>
				<label>Nickname:</label>
				<input
					name="nickname"
					value={profile.nickname}
					onChange={handleChange}
				/>
			</div>
			<div>
				<label>Features:</label>
				<textarea
					name="features"
					value={profile.features}
					onChange={handleChange}
				/>
			</div>
			<button type="submit">Save Profile</button>
			{message && <p>{message}</p>}
		</form>
	);
};

export default ProfileForm;
