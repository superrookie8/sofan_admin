import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function GET(req: NextRequest) {
	try {
		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/get/profile`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: isDevelopment ? "no-store" : "default",
			}
		);

		const backendData = await backendResponse.json();
		console.log("backendData", backendData);

		if (!backendResponse.ok) {
			throw new Error(backendData.message || "Failed to get profile.");
		}

		return NextResponse.json(backendData, { status: 200 });
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
