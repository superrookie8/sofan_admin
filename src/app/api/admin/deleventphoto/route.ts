import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
	try {
		const { eventId, photoIndex } = await req.json(); // 수정된 부분
		const token = req.headers.get("authorization") || "";

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/delete/eventphoto`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
				body: JSON.stringify({ eventId, photoIndex }), // 수정된 부분
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || "Failed to delete photo.");
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error("Error deleting photo:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to delete photo" },
			{ status: 500 }
		);
	}
}
