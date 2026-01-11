import { NextRequest } from "next/server";
import { getDatabase } from "../mongodb/client";

/**
 * 어드민 토큰을 검증합니다.
 * @param token Authorization 헤더에서 추출한 토큰
 * @returns 검증 성공 시 true, 실패 시 false
 */
export async function verifyAdminToken(token: string | null): Promise<boolean> {
	if (!token) {
		return false;
	}

	try {
		// Bearer 토큰 형식 처리
		const cleanToken = token.replace(/^Bearer\s+/i, "");

		// MongoDB에서 어드민 토큰 검증
		// TODO: 실제 토큰 검증 로직 구현 필요
		// 예: JWT 검증 또는 MongoDB에 저장된 세션 토큰 확인
		const db = await getDatabase();
		const adminSession = await db.collection("admin_sessions").findOne({
			token: cleanToken,
			expiresAt: { $gt: new Date() }, // 만료되지 않은 토큰만
		});

		return !!adminSession;
	} catch (error) {
		console.error("토큰 검증 오류:", error);
		return false;
	}
}

/**
 * API 요청에서 Authorization 헤더를 추출하고 검증합니다.
 * @param req NextRequest 객체
 * @returns 검증 성공 시 true, 실패 시 false
 */
export async function authenticateRequest(
	req: NextRequest
): Promise<boolean> {
	const authHeader = req.headers.get("authorization");
	return await verifyAdminToken(authHeader);
}

/**
 * 간단한 하드코딩된 어드민 인증 (임시)
 * 실제로는 JWT 또는 MongoDB 세션을 사용해야 합니다.
 */
export async function verifySimpleAuth(
	username: string,
	password: string
): Promise<boolean> {
	// TODO: MongoDB에서 어드민 계정 확인
	// 임시로 환경 변수에서 확인
	const adminUsername = process.env.ADMIN_USERNAME;
	const adminPassword = process.env.ADMIN_PASSWORD;

	if (!adminUsername || !adminPassword) {
		console.warn("어드민 계정 정보가 환경 변수에 설정되지 않았습니다.");
		return false;
	}

	return username === adminUsername && password === adminPassword;
}


