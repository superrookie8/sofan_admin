import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/schedules - 경기일정 등록
export async function POST(req: NextRequest) {
	try {
		const token = req.headers.get("authorization");

		if (!token) {
			return NextResponse.json(
				{ error: "어드민 권한이 필요합니다" },
				{ status: 403 }
			);
		}

		// Content-Type 확인
		const contentType = req.headers.get("content-type") || "";
		console.log("[POST /api/admin/schedules] Content-Type:", contentType);

		let requestParams: URLSearchParams;

		if (
			contentType.includes("multipart/form-data") ||
			contentType.includes("application/x-www-form-urlencoded")
		) {
			// form-data 처리
			const formData = await req.formData();
			requestParams = new URLSearchParams();

			console.log("[POST /api/admin/schedules] FormData entries:");
			for (const [key, value] of formData.entries()) {
				if (value instanceof File) {
					// 파일은 제외 (스케줄에는 파일이 없음)
					console.log(`  ${key}: [File]`);
					continue;
				}
				const valueStr = value.toString();
				console.log(`  ${key}: ${valueStr}`);
				requestParams.append(key, valueStr);
			}
		} else if (contentType.includes("application/json")) {
			// JSON body를 받은 경우 query string으로 변환
			const body = await req.json();
			console.log("[POST /api/admin/schedules] JSON body:", body);
			requestParams = new URLSearchParams();

			// 필수 파라미터
			if (body.title) requestParams.append("title", body.title);
			if (body.startDateTime)
				requestParams.append("startDateTime", body.startDateTime);

			// 선택 파라미터
			if (body.description)
				requestParams.append("description", body.description);
			if (body.endDateTime)
				requestParams.append("endDateTime", body.endDateTime);
			if (body.location) requestParams.append("location", body.location);
			if (body.type) requestParams.append("type", body.type);
			if (body.color) requestParams.append("color", body.color);
			if (body.url) requestParams.append("url", body.url);
			if (body.isActive !== undefined)
				requestParams.append("isActive", String(body.isActive));
		} else {
			// query string으로 받은 경우
			const { searchParams } = new URL(req.url);
			requestParams = searchParams;
			console.log(
				"[POST /api/admin/schedules] Query params:",
				requestParams.toString()
			);
		}

		// 필수 파라미터 검증 (빈 문자열도 체크)
		const title = requestParams.get("title");
		const startDateTime = requestParams.get("startDateTime");
		console.log(
			"[POST /api/admin/schedules] Required params - title:",
			title,
			"startDateTime:",
			startDateTime
		);

		if (
			!title ||
			title.trim() === "" ||
			!startDateTime ||
			startDateTime.trim() === ""
		) {
			console.error("[POST /api/admin/schedules] Missing required params");
			return NextResponse.json(
				{
					error: `title과 startDateTime은 필수입니다. title: ${
						title || "없음"
					}, startDateTime: ${startDateTime || "없음"}`,
					receivedParams: Object.fromEntries(requestParams.entries()),
				},
				{ status: 400 }
			);
		}

		// 백엔드로 전달 (query string 형식)
		const backendUrl = `${
			process.env.NEXT_PUBLIC_BACKAPI_URL
		}/api/admin/schedules?${requestParams.toString()}`;
		console.log("[POST /api/admin/schedules] Backend URL:", backendUrl);

		const backendResponse = await fetch(backendUrl, {
			method: "POST",
			headers: {
				Authorization: token,
			},
		});

		const backendData = await backendResponse.json();
		console.log(
			"[POST /api/admin/schedules] Backend response status:",
			backendResponse.status
		);
		console.log(
			"[POST /api/admin/schedules] Backend response data:",
			backendData
		);

		if (!backendResponse.ok) {
			return NextResponse.json(
				{
					error:
						backendData.error ||
						backendData.message ||
						"Failed to create schedule.",
				},
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to create schedule" },
			{ status: 500 }
		);
	}
}

// GET /api/admin/schedules - 전체 스케줄 조회
export async function GET(req: NextRequest) {
	try {
		const token = req.headers.get("authorization");

		if (!token) {
			return NextResponse.json(
				{ error: "어드민 권한이 필요합니다" },
				{ status: 403 }
			);
		}

		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/schedules`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				cache: "no-store",
			}
		);

		const backendData = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ error: backendData.error || "Failed to fetch schedules." },
				{ status: backendResponse.status }
			);
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch schedules" },
			{ status: 500 }
		);
	}
}

export const dynamic = "force-dynamic";
