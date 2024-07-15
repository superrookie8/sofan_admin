"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Admin: React.FC = () => {
	const router = useRouter();

	useEffect(() => {
		const token = sessionStorage.getItem("admin-token");
		if (!token) {
			router.push("/login");
		}
	}, [router]);

	return (
		<div>
			<h1>Admin Dashboard</h1>
			<ul>
				<li>
					<Link href="/profile">Manage Profiles</Link>
				</li>
				<li>
					<Link href="/stats">Manage Stats</Link>
				</li>
				<li>
					<Link href="/photos">Upload Photos</Link>
				</li>
				<li>
					<Link href="/deletephotos">Delete Photos</Link>
				</li>
				<li>
					<Link href="/news">Manage News</Link>
				</li>
				<li>
					<Link href="/schedule">Manage Schedule</Link>
				</li>
				<li>
					<Link href="/events">Manage Events</Link>
				</li>
				<li>
					<Link href="/guestbooks">Manage Guestbook</Link>
				</li>
			</ul>
		</div>
	);
};

export default Admin;
