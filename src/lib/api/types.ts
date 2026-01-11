/**
 * Player (선수 정보) 타입
 */
export interface Player {
	id?: string;
	name: string;
	team: string;
	jerseyNumber?: number;
	position?: string;
	height?: string;
	nickname?: string[];
	features?: string;
	profileImageUrl?: string | null;
}

/**
 * PlayerStat (선수 통계) 타입
 */
export interface PlayerStat {
	id?: string;
	season: string;
	team: string;
	gamesPlayed?: number;
	minutesPerGame?: string;
	twoPointPercent?: number;
	threePointPercent?: number;
	freeThrowPercent?: number;
	offensiveRebounds?: number;
	defensiveRebounds?: number;
	totalRebounds?: number;
	ppg?: number; // points per game
	apg?: number; // assists per game
	spg?: number; // steals per game
	bpg?: number; // blocks per game
	turnovers?: number;
	fouls?: number;
	totalMinutes?: string;
	twoPointMade?: number;
	twoPointAttempted?: number;
	threePointMade?: number;
	threePointAttempted?: number;
	freeThrowMade?: number;
	freeThrowAttempted?: number;
	totalOffensiveRebounds?: number;
	totalDefensiveRebounds?: number;
	totalTotalRebounds?: number;
	totalAssists?: number;
	totalSteals?: number;
	totalBlocks?: number;
	totalTurnovers?: number;
	totalFouls?: number;
	totalPoints?: number;
}

/**
 * Stadium (경기장 정보) 타입
 */
export interface Stadium {
	id?: string;
	name: string;
	address: string;
	capacity?: number;
	latitude?: number | null;
	longitude?: number | null;
	imageUrl?: string | null;
	subwayInfo?: string[];
	busInfo?: string[];
	intercityRoute?: string;
}

/**
 * Game (경기 일정) 타입
 */
export interface Game {
	id?: string;
	season: string;
	league: string;
	homeTeam: string;
	awayTeam: string;
	gameDateTime: string; // ISO 8601 형식
	stadiumId: string;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Event (이벤트) 타입
 */
export interface Event {
	id?: string;
	title: string;
	url?: string;
	description?: string;
	check1?: string;
	check2?: string;
	check3?: string;
	photoKeys?: string[]; // R2 이미지 키 배열
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * User (사용자 정보) 타입
 */
export interface User {
	id?: string;
	provider?: string;
	providerId?: string;
	email?: string;
	nickname?: string;
	profileImageUrl?: string;
	points?: number;
	level?: number;
	createdAt?: string;
	updatedAt?: string;
}


