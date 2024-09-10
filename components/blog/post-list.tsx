import React from 'react';
import PostPreview from './post-preview';
import type Post from '../../interfaces/post';

type Props = {
  posts: Post[];
}

function PostList({ posts }: Props) {
  const [filterTags, setFilterTags] = React.useState<string[]>([]);
  const [filterDates, setFilterDates] = React.useState<[string, string] | null>([null, new Date().toISOString().split('T')[0]]);

  const handleTagFilter = (tag: string) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter(t => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  const handleDateFilter = (start: string, end: string) => {
    setFilterDates([start, end]);
  };

  let filteredPosts = posts.filter(post =>
    filterTags.length === 0 || post.tags?.some(tag => filterTags.includes(tag))
  );

  filteredPosts = filteredPosts.filter(post =>
    !filterDates || (
      (!filterDates[0] || new Date(post.date || '2000-10-10').getTime() >= new Date(filterDates[0]).getTime()) &&
      (!filterDates[1] || new Date(post.date || '2000-10-10').getTime() <= new Date(filterDates[1]).getTime())
    )
  );

  filteredPosts = filteredPosts.sort((a, b) =>
    new Date(b.date || '2000-10-10').getTime() - new Date(a.date || '2000-10-10').getTime()
  );
  filteredPosts = filteredPosts.filter(post => !post.slug.includes('home'));

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">

          {/* Page header */}
          <div className="max-w-3xl pb-12 md:pb-20 text-center md:text-left">
            <h1 className="h1 mb-4">Explore my thoughts</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">I write about things that interest me, and sometimes I even finish them.</p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            {/* tags */}
            <div className="mb-4">
              <label className="block text-lg mb-2">Filter by Tags:</label>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(posts.flatMap(post => post.tags || []))).map(tag => (
                  <button
                    key={tag}
                    className={`px-4 py-2 rounded-md ${filterTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleTagFilter(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* dates */}
            <div className="mb-4">
              <label className="block text-lg mb-2">Filter by Date:</label>
              <div className="flex items-center gap-4">
                <input
                  type="date"
                  className="border px-3 py-2"
                  onChange={(e) => handleDateFilter(e.target.value, filterDates ? filterDates[1] : '')}
                  placeholder="Start date"
                />
                <span>to</span>
                <input
                  type="date"
                  className="border px-3 py-2"
                  onChange={(e) => handleDateFilter(filterDates ? filterDates[0] : '', e.target.value)}
                  placeholder="End date"
                  value={filterDates ? filterDates[1] : ''}
                />
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:flex md:justify-between">
            {/* Articles container */}
            <div className="md:grow -mt-4">
              {filteredPosts.map((post) => (
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
