import { MongoClient, Db } from "mongodb";

if (!process.env.MONGO_URI) {
	throw new Error("MONGO_URI 환경 변수가 설정되지 않았습니다.");
}

if (!process.env.MONGO_DATABASE) {
	throw new Error("MONGO_DATABASE 환경 변수가 설정되지 않았습니다.");
}

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DATABASE;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
	// 개발 환경: 전역 변수에 저장하여 핫 리로드 시 재사용
	let globalWithMongo = global as typeof globalThis & {
		_mongoClientPromise?: Promise<MongoClient>;
	};

	if (!globalWithMongo._mongoClientPromise) {
		client = new MongoClient(uri);
		globalWithMongo._mongoClientPromise = client.connect();
	}
	clientPromise = globalWithMongo._mongoClientPromise;
} else {
	// 프로덕션 환경: 새 클라이언트 생성
	client = new MongoClient(uri);
	clientPromise = client.connect();
}

/**
 * MongoDB 데이터베이스 인스턴스를 반환합니다.
 */
export async function getDatabase(): Promise<Db> {
	const client = await clientPromise;
	return client.db(dbName);
}

/**
 * MongoDB 클라이언트를 반환합니다.
 */
export async function getClient(): Promise<MongoClient> {
	return clientPromise;
}


