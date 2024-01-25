/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		serverActions: true,
		serverActionsBodySizeLimit: "10mb",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	output: process.env.BUILD_STANDALONE ? "standalone" : undefined,
	reactStrictMode: true,
	distDir: "dist",
};

module.exports = nextConfig;
