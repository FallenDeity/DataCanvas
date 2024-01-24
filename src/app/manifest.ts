import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Data Canvas",
		short_name: "Data Canvas",
		description:
			"Discovering the Endless Potential of Your Data. Explore a world of online tools, API access, and easy database development and management. Your canvas, your data, limitless possibilities.",
		start_url: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#9d57ff",
		icons: [
			{
				src: "/icons/icon-72x72.png",
				sizes: "72x72",
				type: "image/png",
			},
			{
				src: "/icons/icon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				src: "/icons/icon-128x128.png",
				sizes: "128x128",
				type: "image/png",
			},
			{
				src: "/icons/icon-144x144.png",
				sizes: "144x144",
				type: "image/png",
			},
			{
				src: "/icons/icon-152x152.png",
				sizes: "152x152",
				type: "image/png",
			},
			{
				src: "/icons/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icons/icon-384x384.png",
				sizes: "384x384",
				type: "image/png",
			},
			{
				src: "/icons/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
	};
}
