import crypto from "crypto";

/**
 * 간단한 토큰 생성 (임시)
 * 프로덕션에서는 JWT를 사용하는 것을 권장합니다.
 */
export function generateToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

/**
 * 토큰을 MongoDB에 저장합니다.
 */
export async function saveAdminSession(
	username: string,
	token: string
): Promise<void> {
	const { getDatabase } = await import("../mongodb/client");
	const db = await getDatabase();

	// 세션 만료 시간: 24시간
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 24);

	await db.collection("admin_sessions").insertOne({
		username,
		token,
		expiresAt,
		createdAt: new Date(),
	});
}

/**
 * 토큰을 삭제합니다 (로그아웃 시 사용).
 */
export async function deleteAdminSession(token: string): Promise<void> {
	const { getDatabase } = await import("../mongodb/client");
	const db = await getDatabase();

	await db.collection("admin_sessions").deleteOne({ token });
}


