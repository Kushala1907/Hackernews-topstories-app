import React, { useEffect, useState } from 'react';
import './App.css'
const App = () => {
  const [storyIds, setStoryIds] = useState([]);
  const [stories, setStories] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');

  useEffect(() => {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then((res) => res.json())
      .then((ids) => {
        setStoryIds(ids);
      });
  }, []);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      const currentIds = storyIds.slice(0, visibleCount);
      const storyData = await Promise.all(
        currentIds.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
            (res) => res.json()
          )
        )
      );
      setStories(storyData);
      setLoading(false);
    };

    if (storyIds.length) {
      loadStories();
    }
  }, [storyIds, visibleCount]);

  const loadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const filteredStories = stories.filter((story) => {
    const lower = searchTerm.toLowerCase();
    return (
      story.title?.toLowerCase().includes(lower) ||
      story.by?.toLowerCase().includes(lower)
    );
  });

  const sortedStories = [...filteredStories].sort((a, b) => {
    return sortBy === 'score' ? b.score - a.score : b.time - a.time;
  });

  return (
    <div className="app-container">
      <h1 className="app-title">
        Hacker News - Top Stories
      </h1>

      <div className="controls-wrapper">
        <input
          type="text"
          placeholder="Search by title or author"
          className="search-input border p-2 rounded w-full sm:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="time">Sort by Time</option>
          <option value="score">Sort by Score</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <ul className="story-list space-y-4">
          {sortedStories.map((story) => (
            <li key={story.id} className="story-card">
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="story-title"
              >
                {story.title}
              </a>
              <div className="story-meta">
                By: {story.by} | Score: {story.score} | Comments:{' '}
                {story.descendants || 0}
              </div>
              <div className="story-time">
                {new Date(story.time * 1000).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}

      {visibleCount < storyIds.length && (
        <div className="load-more-container">
          <button
            onClick={loadMore}
            className="load-more-btn"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default App;