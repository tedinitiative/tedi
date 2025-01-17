// import { getCldImageUrl, getCldOgImageUrl } from "next-cloudinary";
import { env } from "@/env";
import { getPost } from "@/lib/serverActions";
import { getPostAuthor } from "@/lib/utils";
import { ImageResponse } from "next/og";

// Route segment config
// export const runtime = "edge";

// Image metadata
export const alt = "The TEDI Homepage";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image({ params }: { params: { slug: string } }) {
	const article = await getPost(params?.slug);
	console.log(params?.slug, article);

	return new ImageResponse(
		(
			<div
				style={{
					fontSize: 128,
					backgroundImage: `url(${article?.image.replace(/\.webp$/, ".png") ?? `https://res.cloudinary.com/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_limit/f_auto/q_auto/${"nature/tallForest"}`})`,
					width: "100%",
					height: "100%",
					display: "flex",
					// "object-fit": "cover",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div tw="flex">
					<div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
						<div tw="mt-8 flex md:mt-0">
							<img
								src={`https://res.cloudinary.com/${env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_limit/f_auto/q_auto/logo`}
								tw="max-h-full"
								width={300}
								height={300}
							/>
						</div>
						<h2 tw="flex flex-col grow text-3xl sm:text-4xl font-bold tracking-tight text-gray-100 text-left bg-gray-800/80 rounded-lg p-4">
							<div tw="max-w-xl">{article?.title ?? "Blog Not Found"}</div>
							<div tw="text-green-300">{article?.author ? `By ${getPostAuthor(article).name}` : ""}</div>
						</h2>
					</div>
				</div>
			</div>
		),
		{
			...size,
			// debug: true,
		},
	);
}
