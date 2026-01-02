import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
	return NextResponse.json(
		{},
		{
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		}
	);
}

export async function GET(req: NextRequest) {
	try {
		// const token = req.headers.get("Authorization") || "";

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get/photos`,
			{
				method: "GET",
				headers: {
					// Authorization: token,
					"Content-Type": "application/json",
					Pragma: "no-cache",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
				cache: "no-store",
			}
		);

		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || "Failed to fetch photos.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching photos:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to fetch photos" },
			{ status: 500 }
		);
	}
}

export const dynamic = "force-dynamic";
