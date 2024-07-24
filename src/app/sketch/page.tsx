import CanvasDraw from "@/components/CanvasDraw";
import React from "react";

interface Props {}

const Sketchbook: React.FC<Props> = (props) => {
	return (
		<div>
			<CanvasDraw />
		</div>
	);
};

export default Sketchbook;
