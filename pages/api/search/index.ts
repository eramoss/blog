import { Searcher } from "fast-fuzzy";
import type { NextApiRequest, NextApiResponse } from "next";
import { getAllPosts } from "../../../lib/api";
import { getMDExcerpt } from "../../../lib/markdownToHtml";

const allPosts = getAllPosts(["slug", "title", "content", "author", "date", "tags"]);
const searchIndex = allPosts.map((p) => {
	return {
		slug: p.slug,
		title: p.title,
		excerpt: getMDExcerpt(p.content),
		date: p.date,
		author: p.author,
		tags: p.tags || [],
	};
});

const searcher = new Searcher(searchIndex, {
	keySelector: (obj) => `${obj.title}\n${obj.excerpt}`,
});

export default function postHandler(req: NextApiRequest, res: NextApiResponse) {
	const {
		query: { q },
		method,
	} = req;

	if (method != "GET") {
		res.setHeader("Allow", ["GET"]);
		return res.status(405).send(`Method ${method} Not Allowed`);
	}

	const pass = process.env.SKETCH_VIEW_PASS;
	const cookie = req.cookies['sketch_view'];
	const hasAccess = cookie === pass;

	const searchedPosts = searcher.search(q.toString(), { returnMatchData: true });

	const filteredResults = searchedPosts
		.filter((match) => {
			const isSketch = match.item.tags?.includes("sketch");
			const isHome = match.item.slug == "home";
			if (isSketch) {
				return hasAccess;
			}
			if (isHome) return false;
			return true;
		})
		.slice(0, 10);

	res.status(200).json(filteredResults);
}
