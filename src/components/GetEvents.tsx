import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface Event {
	id?: string;
	_id?: string;
	title: string;
	url?: string;
	description: string;
	checkFields?: { [key: string]: string };
	photos?: string[]; // presigned URL 배열
	photoKeys?: string[]; // R2 키 배열
}

const EventList: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [eventToDelete, setEventToDelete] = useState<string | null>(null);
	const [photoToDelete, setPhotoToDelete] = useState<{
		eventId: string;
		photoKey: string;
	} | null>(null);

	const fetchEvents = useCallback(async () => {
		try {
			const token = localStorage.getItem("adminToken") || "";
			const backendUrl =
				process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";

			const response = await fetch(`${backendUrl}/api/admin/events`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				cache: "no-store",
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

			const data = await response.json();
			if (response.ok) {
				// 백엔드에서 배열로 반환하거나, { events: [...] } 형식일 수 있음
				const eventsList = Array.isArray(data) ? data : data.events || [];
				setEvents(eventsList);
			} else {
				// 에러 응답: { "error": "..." } 또는 { "message": "..." }
				const errorMessage =
					data.error || data.message || "Failed to fetch events";
				console.error("Failed to fetch events:", data);
				alert(errorMessage);
			}
		} catch (error) {
			console.error("Error fetching events:", error);
		}
	}, []);

	const deletePhoto = useCallback(async () => {
		if (!photoToDelete) return;

		const { eventId, photoKey } = photoToDelete;
		try {
			const token = localStorage.getItem("adminToken") || "";

			// URLSearchParams를 사용하여 자동 인코딩
			const params = new URLSearchParams({
				eventId: eventId,
				photoKey: photoKey,
			});

			// Next.js API 라우트를 통해 프록시 (CORS 문제 해결)
			const response = await fetch(
				`/api/admin/deleventphoto?${params.toString()}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
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
				const result = await response.json();
				// 백엔드가 업데이트된 이벤트 정보를 반환하면 UI 갱신
				if (result.event) {
					setEvents((prevEvents) =>
						prevEvents.map((event) =>
							(event.id || event._id) === eventId ? result.event : event
						)
					);
				} else {
					// 전체 목록 다시 불러오기
					fetchEvents();
				}
			} else {
				const error = await response
					.json()
					.catch(() => ({ error: "Failed to delete photo" }));
				const errorMessage =
					error.error || error.message || "Failed to delete photo";
				console.error("Failed to delete photo:", error);
				alert(errorMessage);
			}
		} catch (error) {
			console.error("Error deleting photo:", error);
			alert("사진 삭제 중 오류가 발생했습니다.");
		} finally {
			setPhotoToDelete(null);
		}
	}, [photoToDelete, fetchEvents]);

	const deleteEvent = useCallback(async () => {
		if (!eventToDelete) return;

		try {
			const token = localStorage.getItem("adminToken") || "";
			const backendUrl =
				process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";

			const response = await fetch(
				`${backendUrl}/api/admin/events/${eventToDelete}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
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
				fetchEvents(); // 이벤트 삭제 후 이벤트 목록을 다시 불러옵니다.
			} else {
				const error = await response
					.json()
					.catch(() => ({ error: "Failed to delete event" }));
				const errorMessage =
					error.error || error.message || "Failed to delete event";
				console.error("Failed to delete event:", error);
				alert(errorMessage);
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
			{events.map((event) => {
				const eventId = event.id || event._id || "";
				const photoKeys = event.photoKeys || [];

				return (
					<div key={eventId} className="mb-4 p-4 border rounded">
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
									<li key={i}>{event.checkFields?.[field]}</li>
								))}
						</ul>
						{event.photos && event.photos.length > 0 && (
							<div className="w-full mt-2 flex overflow-x-auto space-x-2">
								{event.photos.map((photo, photoIndex) => {
									// photoKeys 배열에서 해당 인덱스의 키 가져오기
									const photoKey = photoKeys[photoIndex];

									// photoKey가 없으면 삭제 버튼 표시 안 함
									if (!photoKey) {
										return (
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
											</div>
										);
									}

									return (
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
												onClick={() => setPhotoToDelete({ eventId, photoKey })}
												className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
											>
												&times;
											</button>
										</div>
									);
								})}
							</div>
						)}
						<button
							onClick={() => setEventToDelete(eventId)}
							className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
						>
							Delete Event
						</button>
					</div>
				);
			})}

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
