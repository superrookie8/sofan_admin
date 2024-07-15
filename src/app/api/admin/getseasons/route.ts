import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const token = req.headers.get("authorization");

		if (!token) {
			throw new Error("Authorization header missing");
		}

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get/seasons`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to fetch seasons.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching seasons:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to fetch seasons" },
			{ status: 500 }
		);
	}
}

export const dynamic = "force-dynamic";
