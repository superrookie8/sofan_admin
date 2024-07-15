"use client";
import React, { useEffect, useState } from "react";
import AdminDeletePhotos from "../../components/AdminDeletePhotos";

interface Photo {
	_id: string;
	filename: string;
	base64: string;
	url: string;
}

interface PhotoData {
	admin_photos: Photo[];
	user_photos: Photo[];
}

async function fetchPhotos(token: string): Promise<PhotoData> {
	const response = await fetch(`/api/admin/getphoto`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
			Pragma: "no-cache",
			"Cache-Control": "no-cache, no-store, must-revalidate",
		},
		cache: "no-store",
	});

	if (!response.ok) {
		const data = await response.json();
		console.error("Error fetching photos:", data); // Error data 출력
		throw new Error(data.message || "Failed to fetch photos.");
	}

	const data = await response.json();
	console.log("Fetched photos data:", data); // Fetched data 출력
	return data;
}

export default function DeletePhotosPage() {
	const [data, setData] = useState<PhotoData>({
		admin_photos: [],
		user_photos: [],
	});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const token = sessionStorage.getItem("admin-token");
		if (token) {
			fetchPhotos(token)
				.then((data) => {
					console.log("Photos data set to state:", data); // State에 설정된 데이터 출력
					setData(data);
				})
				.catch((error) => {
					console.error("Error setting photos data to state:", error); // 오류 출력
					setError(error.message);
				});
		} else {
			setError("No authorization token found.");
		}
	}, []);

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<AdminDeletePhotos
			adminPhotos={data.admin_photos}
			userPhotos={data.user_photos}
		/>
	);
}
