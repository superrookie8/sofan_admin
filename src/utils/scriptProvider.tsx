import Script from "next/script";
import React from "react";

interface Props {}

const ScriptProvider: React.FC<Props> = (props) => {
	return (
		<>
			<Script
				src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`}
				strategy="afterInteractive"
				async
			/>
		</>
	);
};

export default ScriptProvider;
