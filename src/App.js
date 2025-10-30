import React, { useState } from "react";
import "./App.css";

function App() {
  const [comments, setComments] = useState([]);
  const [sortType, setSortType] = useState("newest");

  // Add a new comment or reply
  const addComment = (text, parentId = null) => {
    const newComment = {
      id: Date.now(),
      text,
      score: 0,
      time: new Date(),
      replies: [],
    };

    if (parentId === null) {
      setComments([newComment, ...comments]);
    } else {
      const updated = comments.map((c) => addReplyToTree(c, parentId, newComment));
      setComments(updated);
    }
  };

  // Helper to insert reply recursively
  const addReplyToTree = (comment, parentId, newReply) => {
    if (comment.id === parentId) {
      return { ...comment, replies: [newReply, ...comment.replies] };
    }
    return { ...comment, replies: comment.replies.map((r) => addReplyToTree(r, parentId, newReply)) };
  };

  // Handle voting
  const vote = (id, delta) => {
    const updated = comments.map((c) => updateVote(c, id, delta));
    setComments(updated);
  };

  const updateVote = (comment, id, delta) => {
    if (comment.id === id) {
      return { ...comment, score: comment.score + delta };
    }
    return { ...comment, replies: comment.replies.map((r) => updateVote(r, id, delta)) };
  };

  // Sort comments
  const sortComments = (list) => {
    let sorted = [...list];
    if (sortType === "newest") sorted.sort((a, b) => b.time - a.time);
    else if (sortType === "oldest") sorted.sort((a, b) => a.time - b.time);
    else if (sortType === "most") sorted.sort((a, b) => b.score - a.score);
    else if (sortType === "least") sorted.sort((a, b) => a.score - b.score);

    return sorted.map((c) => ({ ...c, replies: sortComments(c.replies) }));
  };

  const sortedComments = sortComments(comments);

  return (
    <div className="container">
      <h2>💬 Simple Comment Section</h2>

      <CommentInput onSubmit={addComment} />

      <div className="sort">
        <label>Sort by: </label>
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most">Most Score</option>
          <option value="least">Least Score</option>
        </select>
      </div>

      <CommentList comments={sortedComments} onReply={addComment} onVote={vote} />
    </div>
  );
}

function CommentList({ comments, onReply, onVote }) {
  return (
    <ul className="comment-list">
      {comments.map((c) => (
        <Comment key={c.id} comment={c} onReply={onReply} onVote={onVote} />
      ))}
    </ul>
  );
}

function Comment({ comment, onReply, onVote }) {
  const [showReply, setShowReply] = useState(false);

  return (
    <li className="comment">
      <div className="comment-body">
        <p>{comment.text}</p>
        <div className="actions">
          <span>Score: {comment.score}</span>
          <button onClick={() => onVote(comment.id, 1)}>👍</button>
          <button onClick={() => onVote(comment.id, -1)}>👎</button>
          <button onClick={() => setShowReply(!showReply)}>↩️ Reply</button>
        </div>
      </div>

      {showReply && (
        <div className="reply-box">
          <CommentInput
            onSubmit={(text) => {
              onReply(text, comment.id);
              setShowReply(false);
            }}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <ul className="replies">
          <CommentList comments={comment.replies} onReply={onReply} onVote={onVote} />
        </ul>
      )}
    </li>
  );
}

function CommentInput({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="input-area">
      <input
        type="text"
        value={text}
        placeholder="Write a comment..."
        onChange={(e) => setText(e.target.value)}
      />
      <button
        onClick={() => {
          if (text.trim()) {
            onSubmit(text);
            setText("");
          }
        }}
      >
        Post
      </button>
    </div>
  );
}

export default App;
