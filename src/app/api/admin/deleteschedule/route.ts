import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const scheduleId = searchParams.get("scheduleId");
		
		if (!scheduleId) {
			return NextResponse.json(
				{ message: "Schedule ID is required" },
				{ status: 400 }
			);
		}

		const token = req.headers.get("authorization") || "";

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/schedules/${scheduleId}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to delete event.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting event:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to delete event" },
			{ status: 500 }
		);
	}
}
