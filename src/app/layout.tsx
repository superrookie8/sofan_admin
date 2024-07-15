// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import RecoilRootProvider from "@/utils/recoilRootProvider";
import ScriptProvider from "@/utils/scriptProvider";

export const metadata: Metadata = {
	title: { default: "BNK NO36.Lee Sohee", template: "%s | Lee Sohee" },
	description: "Welcome to the fan page of BNK NO36. Lee Sohee.",
	keywords: [
		"WKBL",
		"BNK SUM",
		"BNK썸",
		"슈퍼소닉",
		"여자농구",
		"농구선수 이소희",
		"한국여자프로농구",
		"듀얼가드",
		"발발이",
		"슈팅가드",
		"이소희선수",
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<ScriptProvider />
			<body>
				<RecoilRootProvider>{children}</RecoilRootProvider>
			</body>
		</html>
	);
}
