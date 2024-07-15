import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface Event {
	_id: string;
	title: string;
	url: string;
	description: string;
	checkFields: { [key: string]: string };
	photos: string[];
}

const EventList: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [eventToDelete, setEventToDelete] = useState<string | null>(null);
	const [photoToDelete, setPhotoToDelete] = useState<{
		eventId: string;
		photoIndex: number;
	} | null>(null);

	const fetchEvents = useCallback(async () => {
		try {
			const token = sessionStorage.getItem("admin-token") || "";
			const response = await fetch("/api/admin/getevents", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				cache: "no-store",
			});
			const data = await response.json();
			if (response.ok) {
				setEvents(data.events);
			} else {
				console.error("Failed to fetch events", data);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	}, []);

	const deletePhoto = useCallback(async () => {
		if (!photoToDelete) return;

		const { eventId, photoIndex } = photoToDelete;
		try {
			const token = sessionStorage.getItem("admin-token") || "";
			const response = await fetch(`/api/admin/deleventphoto`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ eventId, photoIndex }),
			});

			if (response.ok) {
				fetchEvents(); // 사진 삭제 후 이벤트 목록을 다시 불러옵니다.
			} else {
				console.error("Failed to delete photo");
			}
		} catch (error) {
			console.error("Error deleting photo:", error);
		} finally {
			setPhotoToDelete(null);
		}
	}, [photoToDelete, fetchEvents]);

	const deleteEvent = useCallback(async () => {
		if (!eventToDelete) return;

		try {
			const token = sessionStorage.getItem("admin-token") || "";
			const response = await fetch(`/api/admin/deleteevents`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ eventId: eventToDelete }),
			});

			if (response.ok) {
				fetchEvents(); // 이벤트 삭제 후 이벤트 목록을 다시 불러옵니다.
			} else {
				console.error("Failed to delete event");
			}
		} catch (error) {
			console.error("Error deleting event:", error);
		} finally {
			setEventToDelete(null);
		}
	}, [eventToDelete, fetchEvents]);

	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);

	return (
		<div>
			<h2 className="text-xl mb-4">Events List</h2>
			{events.map((event) => (
				<div key={event._id} className="mb-4 p-4 border rounded">
					<h3 className="text-lg font-bold">{event.title}</h3>
					<p className="text-gray-700">{event.description}</p>
					{event.url && (
						<a href={event.url} className="text-blue-500">
							{event.url}
						</a>
					)}
					<ul className="list-disc list-inside">
						{event.checkFields &&
							Object.keys(event.checkFields).map((field, i) => (
								<li key={i}>{event.checkFields[field]}</li>
							))}
					</ul>
					{event.photos && event.photos.length > 0 && (
						<div className="w-full mt-2 flex overflow-x-auto space-x-2">
							{event.photos.map((photo, photoIndex) => (
								<div
									key={photoIndex}
									className="relative flex-shrink-0"
									style={{ width: "200px", height: "200px" }}
								>
									<div
										className="relative w-full h-full"
										style={{ maxWidth: "100%", maxHeight: "100%" }}
									>
										<Image
											src={photo}
											alt={event.title}
											fill
											style={{ objectFit: "contain" }}
											className="object-cover"
										/>
									</div>
									<button
										onClick={() =>
											setPhotoToDelete({ eventId: event._id, photoIndex })
										}
										className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
									>
										&times;
									</button>
								</div>
							))}
						</div>
					)}
					<button
						onClick={() => setEventToDelete(event._id)}
						className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
					>
						Delete Event
					</button>
				</div>
			))}

			{/* 사진 삭제 확인 모달 */}
			{photoToDelete && (
				<ConfirmationModal
					message="Are you sure you want to delete this photo?"
					onCancel={() => setPhotoToDelete(null)}
					onConfirm={deletePhoto}
				/>
			)}

			{/* 이벤트 삭제 확인 모달 */}
			{eventToDelete && (
				<ConfirmationModal
					message="Are you sure you want to delete this event and all its photos?"
					onCancel={() => setEventToDelete(null)}
					onConfirm={deleteEvent}
				/>
			)}
		</div>
	);
};

interface ConfirmationModalProps {
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	message,
	onCancel,
	onConfirm,
}) => {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
			<div className="bg-white p-4 rounded">
				<p>{message}</p>
				<div className="mt-4 flex justify-end space-x-2">
					<button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 bg-red-500 text-white rounded"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default EventList;
