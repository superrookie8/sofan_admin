import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { username, password } = await req.json();

		const backendResponse = await fetch(
			`${process.env.NEXT_PUBLIC_BACKAPI_URL}/api/admin/login`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			}
		);

		const backendData = await backendResponse.json();

		if (!backendResponse.ok) {
			return NextResponse.json(
				{ message: backendData.msg || "로그인에 실패했습니다." },
				{ status: backendResponse.status }
			);
		}

		const token = backendData.access_token;
		if (!token) {
			return NextResponse.json(
				{ message: "서버로부터 토큰을 받지 못했습니다." },
				{ status: 500 }
			);
		}

		return NextResponse.json({ access_token: token }, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: error.message || "로그인 중 오류가 발생했습니다." },
			{ status: 500 }
		);
	}
}
