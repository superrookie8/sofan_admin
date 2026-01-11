import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/middleware";
import { getDatabase } from "@/lib/mongodb/client";

export async function GET(req: NextRequest) {
	try {
		// 인증 확인
		const isAuthenticated = await authenticateRequest(req);
		if (!isAuthenticated) {
			return NextResponse.json(
				{ message: "인증이 필요합니다." },
				{ status: 401 }
			);
		}

		// MongoDB에서 Player 정보 조회
		const db = await getDatabase();
		const player = await db.collection("players").findOne({});

		if (!player) {
			return NextResponse.json(
				{ message: "선수 정보를 찾을 수 없습니다." },
				{ status: 404 }
			);
		}

		// ObjectId를 문자열로 변환
		const { _id, ...playerData } = player;
		return NextResponse.json(
			{ ...playerData, id: _id.toString() },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
