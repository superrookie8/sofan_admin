import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCOUNT_ID) {
	throw new Error("R2_ACCOUNT_ID 환경 변수가 설정되지 않았습니다.");
}

if (!process.env.R2_ACCESS_KEY_ID) {
	throw new Error("R2_ACCESS_KEY_ID 환경 변수가 설정되지 않았습니다.");
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
	throw new Error("R2_SECRET_ACCESS_KEY 환경 변수가 설정되지 않았습니다.");
}

if (!process.env.R2_BUCKET_NAME) {
	throw new Error("R2_BUCKET_NAME 환경 변수가 설정되지 않았습니다.");
}

// R2는 S3 호환 API를 사용합니다
const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: process.env.R2_ACCESS_KEY_ID,
		secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
	},
});

/**
 * 파일을 R2에 업로드합니다.
 * @param file 업로드할 파일 (File 또는 Buffer)
 * @param key R2에 저장될 키 (경로 포함, 예: "event/abc123.jpg")
 * @param contentType 파일의 MIME 타입
 * @returns 업로드된 파일의 공개 URL
 */
export async function uploadToR2(
	file: File | Buffer,
	key: string,
	contentType?: string
): Promise<string> {
	try {
		const fileBuffer =
			file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

		const command = new PutObjectCommand({
			Bucket: process.env.R2_BUCKET_NAME,
			Key: key,
			Body: fileBuffer,
			ContentType: contentType || "application/octet-stream",
		});

		await s3Client.send(command);

		// 공개 URL 반환
		const publicUrl = process.env.R2_PUBLIC_URL || "";
		if (!publicUrl) {
			throw new Error("R2_PUBLIC_URL 환경 변수가 설정되지 않았습니다.");
		}

		// URL 끝에 슬래시가 없으면 추가
		const baseUrl = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
		return `${baseUrl}${key}`;
	} catch (error) {
		console.error("R2 업로드 오류:", error);
		throw new Error(`R2 업로드 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
	}
}

/**
 * 이벤트 이미지를 업로드합니다.
 * @param file 업로드할 이미지 파일
 * @param filename 파일명 (확장자 포함)
 * @returns 업로드된 이미지의 키 (photoKeys 배열에 사용)
 */
export async function uploadEventImage(
	file: File | Buffer,
	filename: string
): Promise<string> {
	const timestamp = Date.now();
	const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
	const key = `event/${timestamp}-${sanitizedFilename}`;

	await uploadToR2(file, key, "image/jpeg");
	return key;
}


