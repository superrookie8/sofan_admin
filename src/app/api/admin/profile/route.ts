import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { name, team, position, number, height, nickname, features } =
			await req.json();
		const token = req.headers.get("authorization");

		if (!token) {
			throw new Error("Authorization header missing");
		}

		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/create_or_update/profile`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: token, // Add Authorization header
				},
				body: JSON.stringify({
					name,
					team,
					position,
					number,
					height,
					nickname,
					features,
				}),
			}
		);

		const backendData = await backendResponse.json();
		console.log("backendData", backendData);

		if (!backendResponse.ok) {
			throw new Error(backendData.message || "Failed to save profile.");
		}

		return NextResponse.json(
			{ message: "Profile saved successfully!" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
