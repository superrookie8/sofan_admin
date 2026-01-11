/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "supersohee-images-all.92d40bb4fa2c6db4a006f8b35dcb1d11.r2.cloudflarestorage.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.r2.cloudflarestorage.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
