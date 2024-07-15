"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useAdminAuth from "@/hooks/useAdminAuth";
import EventList from "@/components/admin/GetEvents";

interface Event {
	title: string;
	url: string;
	description: string;
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
		checkFields: { check_1: "" },
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
		if (showUrlField) {
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

		const token = sessionStorage.getItem("admin-token") || "";

		try {
			const response = await fetch("/api/admin/postevents", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const data = await response.text();
			console.log("Response data:", data);

			if (response.ok) {
				alert("Event and photos uploaded successfully");
				setNewEvent({
					title: "",
					url: "",
					description: "",
					checkFields: { check_1: "" },
					photos: [],
				});
				setCheckFields(["check_one"]);
				setShowUrlField(false);
				// EventList가 업데이트되도록 트리거
			} else {
				console.error("Failed to upload event and photos:", data);
				alert(`Failed to upload event and photos: ${data}`);
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
		if (Object.keys(newEvent.checkFields).length > 1) {
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
				<button
					type="button"
					onClick={toggleUrlField}
					className="mb-4 bg-green-500 text-white px-4 py-2 rounded"
				>
					{showUrlField ? "Remove URL" : "Add URL"}
				</button>
				{showUrlField && (
					<div className="mb-4">
						<label className="block text-gray-700">URL</label>
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
