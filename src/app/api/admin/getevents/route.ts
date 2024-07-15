import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const token = req.headers.get("authorization");
		if (!token) {
			throw new Error("Authorization header missing");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get/events`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
					Pragma: "no-cache",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
				cache: isDevelopment ? "no-store" : "default",
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch events.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching events:", error.message);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}

export const dynamic = "force-dynamic";
