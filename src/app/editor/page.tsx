"use client";

import ImageEditor from "@/components/ImageEditor";
import React from "react";

// JavaScript 파일을 동적으로 불러옵니다.

interface Props {}

const ImageEditorPage: React.FC<Props> = (props) => {
	return (
		<div>
			<ImageEditor />
		</div>
	);
};

export default ImageEditorPage;
