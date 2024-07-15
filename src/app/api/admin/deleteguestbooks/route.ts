import { NextRequest, NextResponse } from "next/server";

const isDevelopment = process.env.NODE_ENV === "development";

export async function DELETE(req: NextRequest) {
	const token = req.headers.get("Authorization")?.split(" ")[1];

	if (!token) {
		return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
	}

	const { searchParams } = new URL(req.url);
	const entryId = searchParams.get("entry_id");

	if (!entryId) {
		return NextResponse.json(
			{ message: "Entry ID is required" },
			{ status: 400 }
		);
	}

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/delete_guestbook_entry/${entryId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				cache: isDevelopment ? "no-store" : "default",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to delete guestbook entry");
		}

		return NextResponse.json(
			{ message: "Entry deleted successfully" },
			{ status: 200 }
		);
	} catch (error: any) {
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
