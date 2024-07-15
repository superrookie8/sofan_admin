// data/events.ts
export interface Event {
	_id: string;
	title: string;
}

export interface EventDetails extends Event {
	url: string;
	description: string;
	checkFields: {
		check_1: string;
		check_2: string;
		check_3: string;
	};
	photos: string[];
}

export interface PhotosResponse {
	photos: string[];
	total_pages: number;
	page: number;
	page_size: number;
}
