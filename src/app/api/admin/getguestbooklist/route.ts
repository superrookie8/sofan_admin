import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const page = searchParams.get("page") || "1";
	const pageSize = searchParams.get("page_size") || "10";
	const name = searchParams.get("name") || ""; // 추가된 검색 파라미터

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get_guestbook_entries?page=${page}&page_size=${pageSize}&name=${name}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				cache: isDevelopment ? "no-store" : "default",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch guestbook entries");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
