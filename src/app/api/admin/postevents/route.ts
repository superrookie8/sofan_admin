import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type") || "";
		if (!contentType.startsWith("multipart/form-data")) {
			return NextResponse.json(
				{ message: "Unsupported content type" },
				{ status: 400 }
			);
		}

		const formData = await req.formData();
		const token = req.headers.get("authorization") || "";

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/postevents`,
			{
				method: "POST",
				headers: {
					Authorization: token,
				},
				body: formData,
			}
		);

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Failed to upload event data to backend");
		}

		return NextResponse.json({
			message: "Event data uploaded successfully",
			data,
		});
	} catch (error: any) {
		console.error("Error uploading event data:", error);
		return NextResponse.json(
			{ message: error.message || "Failed to upload event data" },
			{ status: 500 }
		);
	}
}
