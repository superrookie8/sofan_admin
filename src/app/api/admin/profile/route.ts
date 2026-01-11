import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/middleware";
import { getDatabase } from "@/lib/mongodb/client";

export async function POST(req: NextRequest) {
	try {
		// 인증 확인
		const isAuthenticated = await authenticateRequest(req);
		if (!isAuthenticated) {
			return NextResponse.json(
				{ message: "인증이 필요합니다." },
				{ status: 401 }
			);
		}

		const { name, team, position, jerseyNumber, height, nickname, features, profileImageUrl } =
			await req.json();

		if (!name || !team) {
			return NextResponse.json(
				{ message: "이름과 팀명은 필수입니다." },
				{ status: 400 }
			);
		}

		// MongoDB에 Player 정보 저장/업데이트
		const db = await getDatabase();
		
		// 기존 Player가 있으면 업데이트, 없으면 생성
		const result = await db.collection("players").findOneAndUpdate(
			{}, // 빈 필터 = 첫 번째 문서
			{
				$set: {
					name,
					team,
					...(position && { position }),
					...(jerseyNumber !== undefined && { jerseyNumber: parseInt(jerseyNumber) }),
					...(height && { height }),
					...(nickname && { nickname: Array.isArray(nickname) ? nickname : [nickname] }),
					...(features && { features }),
					...(profileImageUrl && { profileImageUrl }),
				},
			},
			{
				upsert: true, // 없으면 생성
				returnDocument: "after", // 업데이트 후 문서 반환
			}
		);

		return NextResponse.json(
			{ message: "Profile saved successfully!", data: result },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error:", error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}
}
