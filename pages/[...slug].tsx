import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getPostBySlug, getAllPosts, getLinksMapping } from "../lib/api";
import { markdownToHtml } from "../lib/markdownToHtml";
import type PostType from "../interfaces/post";
import path from "path";
import PostSingle from "../components/blog/post-single";
import Layout from "../components/misc/layout";
import { NextSeo } from "next-seo";
import PostList from "../components/blog/post-list";
import ImageModalProvider from "../components/misc/image-modal-provider";
import { useEffect, useState } from "react";

type Items = {
	title: string;
	excerpt: string;
	tags?: string[];
};

type Props = {
	post: PostType;
	slug: string;
	backlinks: { [k: string]: Items };
	allPosts: PostType[];
};

export default function Post({ post, backlinks, allPosts }: Props) {
	const router = useRouter();
	const [authorized, setAuthorized] = useState<boolean | null>(null);
	const [visiblePosts, setVisiblePosts] = useState<PostType[]>([]);
	const [visibleBacklinks, setVisibleBacklinks] = useState<{ [k: string]: Items }>({});

	useEffect(() => {
		const getCookie = (name: string) => {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop()?.split(";").shift();
		};

		const pass = process.env.NEXT_PUBLIC_SKETCH_VIEW_PASS;
		const cookie = getCookie("sketch_view");
		const hasAccess = cookie === pass && cookie != undefined;

		if (post.tags?.includes("sketch") && !hasAccess) {
			setAuthorized(false);
		} else {
			setAuthorized(true);
		}

		const filteredPosts = (allPosts || []).filter((p) => {
			if (p.tags?.includes("sketch")) {
				return hasAccess;
			}
			return true;
		});
		setVisiblePosts(filteredPosts);

		const filteredBacklinks = Object.fromEntries(
			Object.entries(backlinks).filter(([_, item]) => {
				if (item.tags?.includes("sketch")) {
					return hasAccess;
				}
				return true;
			})
		);
		setVisibleBacklinks(filteredBacklinks);
	}, [post, allPosts, backlinks]);

	if (authorized === null) {
		return null;
	}

	if (!router.isFallback && (!post?.slug || !authorized)) {
		return <ErrorPage statusCode={404} />;
	}

	const description = post.excerpt.slice(0, 155);

	return (
		<>
			{router.isFallback ? (
				<h1>Loading…</h1>
			) : (
				<Layout>
					<NextSeo
						title={post.title}
						description={description}
						openGraph={{
							title: post.title,
							description,
							type: "article",
							images: [
								{
									url: post.ogImage?.url
										? post.ogImage.url
										: "https://fleetingnotes.app/favicon/512.png",
									width: post.ogImage?.url ? undefined : 512,
									height: post.ogImage?.url ? undefined : 512,
								},
							],
						}}
					/>
					{router.asPath.includes("home") ? (
						<>
							<PostList posts={visiblePosts} />
							<footer className="mt-2 py-8 ">
								<p className="text-center text-xs text-gray-400 italic leading-relaxed max-w-2xl mx-auto px-4">
									**Disclaimer:** O site está inglês porque não tenho nenhum
									compromisso de escrever em português, eu vou sempre que
									possivel, mas se o assunto conver melhor em inglês vai ser
									inglês.
								</p>
							</footer>
						</>
					) : (
						<PostSingle
							title={post.title}
							content={post.content}
							date={post.date}
							author={post.author}
							backlinks={visibleBacklinks}
						/>
					)}
					<ImageModalProvider />
				</Layout>
			)}
		</>
	);
}

type Params = {
	params: {
		slug: string[];
		backlinks: string[];
	};
};

export async function getStaticProps({ params }: Params) {
	const slug = path.join(...params.slug);
	const post = getPostBySlug(slug, [
		"title",
		"excerpt",
		"date",
		"slug",
		"author",
		"content",
		"ogImage",
		"tags",
	]);

	const allPosts = getAllPosts([
		"title",
		"excerpt",
		"date",
		"slug",
		"author",
		"content",
		"ogImage",
		"tags",
	]);

	const content = await markdownToHtml(post.content || "", slug);

	const linkMapping = getLinksMapping();
	const backlinksSlugs = Object.keys(linkMapping).filter(
		(k) => linkMapping[k].includes(post.slug) && k !== post.slug,
	);
	const backlinkNodes = Object.fromEntries(
		await Promise.all(
			backlinksSlugs.map(async (s) => {
				const bPost = getPostBySlug(s, ["title", "excerpt", "tags"]);
				if (bPost.tags?.includes("sketch")) {
					return [s, {
						...bPost,
						title: "[Protected]",
						excerpt: "coming soon fella :)"
					}];
				}
				return [s, bPost];
			}),
		),
	);

	return {
		props: {
			post: {
				...post,
				content,
			},
			backlinks: backlinkNodes,
			allPosts: allPosts,
		},
	};
}

export function getStaticPaths() {
	const posts = getAllPosts(["slug"]);
	return {
		paths: posts.map((post) => {
			return {
				params: {
					slug: post.slug.split(path.sep),
				},
			};
		}),
		fallback: false,
	};
}
