"use client";
import GuestBookLists from "../../components/GuestbookManager";
import React, { useEffect, useState } from "react";
import useAdminAuth from "../hooks/useAdminAuth";

const ManageGuestBooks: React.FC = () => {
	useAdminAuth();
	return (
		<div>
			<GuestBookLists />
		</div>
	);
};

export default ManageGuestBooks;
