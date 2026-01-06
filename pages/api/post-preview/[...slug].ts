import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { getPostBySlug } from "../../../lib/api";

export default function postHandler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { slug },
		method,
	} = req;

	if (method != "GET") {
		res.setHeader("Allow", ["GET"]);
		return res.status(405).send(`Method ${method} Not Allowed`);
	}

	const post = getPostBySlug(path.join(...(slug as string[])), [
		"title",
		"excerpt",
		"tags"
	]);

	const isSketch = post.tags?.includes("sketch");
	if (isSketch) {
		const pass = process.env.SKETCH_VIEW_PASS;
		const cookie = req.cookies['sketch_view'];

		if (cookie !== pass) {
			return res.status(404).json({ message: "Post not found" });
		}
	}

	const { tags, ...sanitizedPost } = post;

	res.status(200).json(sanitizedPost);
}
