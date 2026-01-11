import { NextRequest, NextResponse } from "next/server";
import { verifySimpleAuth } from "@/lib/auth/middleware";
import { generateToken, saveAdminSession } from "@/lib/auth/token";

export async function POST(req: NextRequest) {
	try {
		const { username, password } = await req.json();

		if (!username || !password) {
			return NextResponse.json(
				{ message: "사용자명과 비밀번호를 입력해주세요." },
				{ status: 400 }
			);
		}

		// 인증 확인
		const isValid = await verifySimpleAuth(username, password);

		if (!isValid) {
			return NextResponse.json(
				{ message: "사용자명 또는 비밀번호가 올바르지 않습니다." },
				{ status: 401 }
			);
		}

		// 토큰 생성 및 저장
		const token = generateToken();
		await saveAdminSession(username, token);

		return NextResponse.json({ access_token: token }, { status: 200 });
	} catch (error: any) {
		console.error("로그인 오류:", error);
		return NextResponse.json(
			{ message: error.message || "로그인 중 오류가 발생했습니다." },
			{ status: 500 }
		);
	}
}
