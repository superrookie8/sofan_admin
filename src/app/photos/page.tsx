import React from "react";
import AdminPhotoUpload from "../../components/PhotoUpload";

interface Props {}

const AdminPhotos: React.FC<Props> = (props) => {
	return (
		<div>
			<AdminPhotoUpload />
		</div>
	);
};

export default AdminPhotos;
