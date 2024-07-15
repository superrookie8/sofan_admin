import React from "react";

interface EyeIconProps {
	color?: string;
	size?: string;
	visible: boolean; // 비밀번호가 보이는지 여부를 결정하는 prop 추가
}

const EyeIcon: React.FC<EyeIconProps> = ({
	color = "currentColor",
	size = "24",
	visible,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		{visible ? (
			// 비밀번호 보이기 (열린 눈)
			<g>
				<path
					d="M12 5c-7 0-10 5-10 7s3 7 10 7 10-5 10-7-3-7-10-7z"
					fill="none"
					stroke={color}
					strokeWidth="2"
				/>
				<circle cx="12" cy="12" r="3" fill={color} />
			</g>
		) : (
			// 비밀번호 숨기기 (닫힌 눈)
			<g>
				<path
					d="M12 5c-7 0-10 5-10 7s3 7 10 7 10-5 10-7-3-7-10-7z"
					fill="none"
					stroke={color}
					strokeWidth="2"
				/>
				<circle cx="12" cy="12" r="3" fill={color} />
				<line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" />
			</g>
		)}
	</svg>
);

export default EyeIcon;
