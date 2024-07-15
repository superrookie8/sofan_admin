"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import AdminHomeButton from "./AdminHomeButton";

interface Photo {
	_id: string;
	filename: string;
	base64: string;
	url: string;
}

interface Props {
	adminPhotos: Photo[];
	userPhotos: Photo[];
}

const AdminDeletePhotos: React.FC<Props> = ({ adminPhotos, userPhotos }) => {
	const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
	const [adminPhotosState, setAdminPhotos] = useState<Photo[]>(adminPhotos);
	const [userPhotosState, setUserPhotos] = useState<Photo[]>(userPhotos);

	useEffect(() => {
		setAdminPhotos(adminPhotos);
		setUserPhotos(userPhotos);
	}, [adminPhotos, userPhotos]);

	const handleSelectPhoto = (id: string) => {
		setSelectedPhotos((prev) => {
			const newSelectedPhotos = new Set(prev);
			if (newSelectedPhotos.has(id)) {
				newSelectedPhotos.delete(id);
			} else {
				newSelectedPhotos.add(id);
			}
			return newSelectedPhotos;
		});
	};

	const handleDeletePhotos = async () => {
		const confirmDelete = confirm("삭제하시겠습니까?");
		if (!confirmDelete) return;

		try {
			const token = sessionStorage.getItem("admin-token");
			const response = await fetch("/api/admin/deletephoto", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ photoIds: Array.from(selectedPhotos) }),
			});

			if (response.ok) {
				// 삭제된 사진을 state에서 제거
				setAdminPhotos((prev) =>
					prev.filter((photo) => !selectedPhotos.has(photo._id))
				);
				setUserPhotos((prev) =>
					prev.filter((photo) => !selectedPhotos.has(photo._id))
				);
				setSelectedPhotos(new Set());
			} else {
				const data = await response.json();
				console.error("Failed to delete photos", data);
			}
		} catch (error) {
			console.error("Error deleting photos:", error);
		}
	};

	return (
		<div className="container mx-auto">
			<h1 className="text-2xl mb-4">Delete Photos</h1>
			<h2 className="text-xl mb-2">Admin Photos</h2>
			<div className="grid grid-cols-6 gap-2">
				{adminPhotosState.map((photo) => (
					<div
						key={photo._id}
						className="relative"
						style={{ width: "200px", height: "200px" }}
					>
						<Image
							src={photo.base64}
							alt={photo.filename}
							layout="fill"
							objectFit="contain"
							priority
						/>
						<input
							type="checkbox"
							className="absolute top-2 left-2"
							checked={selectedPhotos.has(photo._id)}
							onChange={() => handleSelectPhoto(photo._id)}
						/>
					</div>
				))}
			</div>
			<h2 className="text-xl mb-2 mt-4">User Photos</h2>
			<div className="grid grid-cols-3 gap-4">
				{userPhotosState.map((photo) => (
					<div
						key={photo._id}
						className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh]"
					>
						<Image
							src={photo.base64}
							alt={photo.filename}
							fill
							style={{ objectFit: "contain" }}
							priority
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
						/>
						<input
							type="checkbox"
							className="absolute top-2 left-2"
							checked={selectedPhotos.has(photo._id)}
							onChange={() => handleSelectPhoto(photo._id)}
						/>
					</div>
				))}
			</div>
			{selectedPhotos.size > 0 && (
				<button
					onClick={handleDeletePhotos}
					className="mt-4 py-2 px-4 bg-red-500 text-white rounded"
				>
					Delete Selected Photos
				</button>
			)}
			<AdminHomeButton />
		</div>
	);
};

export default AdminDeletePhotos;
