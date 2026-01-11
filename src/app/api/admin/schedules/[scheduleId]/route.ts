import { NextRequest, NextResponse } from "next/server";

// PUT /api/admin/schedules/{scheduleId} - 경기일정 수정
export async function PUT(
	req: NextRequest,
	{ params }: { params: { scheduleId: string } }
) {
	try {
		const token = req.headers.get("authorization");
		const { scheduleId } = params;

		if (!token) {
			return NextResponse.json(
				{ error: "어드민 권한이 필요합니다" },
				{ status: 403 }
			);
		}

		if (!scheduleId) {
			return NextResponse.json(
				{ error: "Schedule ID is required" },
				{ status: 400 }
			);
		}

		// Content-Type 확인
		const contentType = req.headers.get("content-type") || "";
		
		let requestParams: URLSearchParams;
		
		if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
			// form-data 처리
			const formData = await req.formData();
			requestParams = new URLSearchParams();
			
			for (const [key, value] of formData.entries()) {
				if (value instanceof File) {
					continue;
				}
				requestParams.append(key, value.toString());
			}
		} else if (contentType.includes("application/json")) {
			// JSON body를 받은 경우 query string으로 변환
			const body = await req.json();
			requestParams = new URLSearchParams();
			
			// 선택 파라미터들
			if (body.title) requestParams.append("title", body.title);
			if (body.description) requestParams.append("description", body.description);
			if (body.startDateTime) requestParams.append("startDateTime", body.startDateTime);
			if (body.endDateTime) requestParams.append("endDateTime", body.endDateTime);
			if (body.location) requestParams.append("location", body.location);
			if (body.type) requestParams.append("type", body.type);
			if (body.color) requestParams.append("color", body.color);
			if (body.url) requestParams.append("url", body.url);
			if (body.isActive !== undefined) requestParams.append("isActive", String(body.isActive));
		} else {
			// query string으로 받은 경우
			const { searchParams } = new URL(req.url);
			requestParams = searchParams;
		}

		// 백엔드로 전달 (query string 형식)
		const backendUrl = `${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/schedules/${scheduleId}?${requestParams.toString()}`;
		
		const backendResponse = await fetch(backendUrl, {
			method: "PUT",
			headers: {
				Authorization: token,
			},
		});

		const backendData = await backendResponse.json();
		
		if (!backendResponse.ok) {
			return NextResponse.json(
				{ error: backendData.error || "Failed to update schedule." },
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to update schedule" },
			{ status: 500 }
		);
	}
}

// DELETE /api/admin/schedules/{scheduleId} - 경기일정 삭제
export async function DELETE(
	req: NextRequest,
	{ params }: { params: { scheduleId: string } }
) {
	try {
		const token = req.headers.get("authorization");
		const { scheduleId } = params;

		if (!token) {
			return NextResponse.json(
				{ error: "어드민 권한이 필요합니다" },
				{ status: 403 }
			);
		}

		if (!scheduleId) {
			return NextResponse.json(
				{ error: "Schedule ID is required" },
				{ status: 400 }
			);
		}

		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/schedules/${scheduleId}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			}
		);

		const backendData = await backendResponse.json();
		
		if (!backendResponse.ok) {
			return NextResponse.json(
				{ error: backendData.error || "Failed to delete schedule." },
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to delete schedule" },
			{ status: 500 }
		);
	}
}

export const dynamic = "force-dynamic";
