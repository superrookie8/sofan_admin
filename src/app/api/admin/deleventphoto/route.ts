import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const eventId = searchParams.get("eventId");
		const photoKey = searchParams.get("photoKey");

		console.log("Delete photo request:", { eventId, photoKey });
		console.log("Full URL:", req.url);
		console.log("All search params:", Object.fromEntries(searchParams.entries()));

		if (!eventId || !photoKey) {
			console.error("Missing parameters:", { eventId, photoKey });
			return NextResponse.json(
				{ error: "Event ID and Photo Key are required" },
				{ status: 400 }
			);
		}

		const token = req.headers.get("authorization") || "";

		if (!token) {
			return NextResponse.json(
				{ error: "Authorization header missing" },
				{ status: 401 }
			);
		}

		const backendUrl = process.env.NEXT_PUBLIC_BACKAPI_URL || "http://localhost:8080";
		// photoKey를 쿼리 파라미터로 전달 (Tomcat의 인코딩된 슬래시 제한 회피)
		// 경로 파라미터에 인코딩된 슬래시(%2F)가 있으면 Tomcat이 400 에러 발생
		const encodedPhotoKey = encodeURIComponent(photoKey);
		const backendRequestUrl = `${backendUrl}/api/admin/events/${eventId}/photos?photoKey=${encodedPhotoKey}`;
		
		console.log("Backend request URL:", backendRequestUrl);
		console.log("Token present:", !!token);

		const response = await fetch(backendRequestUrl, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});

		console.log("Backend response status:", response.status);

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Backend error response:", errorText);
			
			let errorData;
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = { error: errorText || "Failed to delete photo" };
			}
			
			return NextResponse.json(
				{ error: errorData.error || errorData.message || "Failed to delete photo" },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting photo:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to delete photo" },
			{ status: 500 }
		);
	}
}
