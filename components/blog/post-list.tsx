import React from 'react';
import PostPreview from './post-preview'
import type Post from '../../interfaces/post';

type Props = {
  posts: Post[]
}

function PostList({ posts }: Props) {
  posts = posts.sort((a, b) => new Date(b.date || "2000-10-10").getTime() - new Date(a.date || "2000-10-10").getTime());
  posts = posts.filter((post) => post.slug !== 'home');
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">

          {/* Page header */}
          <div className="max-w-3xl pb-12 md:pb-20 text-center md:text-left">
            <h1 className="h1 mb-4">Explore my thoughts</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">I write about things that interest me, and sometimes I even finish them.</p>
          </div>

          {/* Main content */}
          <div className="md:flex md:justify-between">

            {/* Articles container */}
            <div className="md:grow -mt-4">
              {posts.map((post) => (
                <PostPreview
                  key={post.slug}
                  title={post.title}
                  date={post.date}
                  excerpt={post.excerpt}
                  author={post.author}
                  slug={post.slug}
                />
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

export default PostList;