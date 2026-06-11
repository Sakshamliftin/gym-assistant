"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community");
      const data = await res.json();
      if (data.posts) setPosts(data.posts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    
    setSubmitting(true);
    try {
      await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      setNewTitle("");
      setNewContent("");
      await fetchPosts(); // refresh feed
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading community feed...</div>;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Creator Community</h1>
        <Link href="/dashboard" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
          Dashboard
        </Link>
      </div>

      {/* Post creation form */}
      <div style={{ background: "var(--bg-elevated)", padding: "1.5rem", borderRadius: "0.5rem", marginBottom: "2rem" }}>
        <h3 style={{ margin: "0 0 1rem" }}>Share an update</h3>
        <form onSubmit={handlePost} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input
            type="text"
            placeholder="Title (optional)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ padding: "0.75rem", borderRadius: "0.25rem", border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)" }}
          />
          <textarea
            placeholder="What's on your mind?"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={3}
            required
            style={{ padding: "0.75rem", borderRadius: "0.25rem", border: "1px solid var(--border)", background: "var(--bg-base)", color: "var(--text-primary)", resize: "vertical" }}
          />
          <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: "flex-end" }}>
            {submitting ? "Posting..." : "Post Update"}
          </button>
        </form>
      </div>

      {/* Feed */}
      <div>
        <h2 style={{ marginBottom: "1rem" }}>Latest Posts</h2>
        {posts.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No posts yet. Be the first to share something!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {posts.map((post) => (
              <div key={post.id} style={{ border: "1px solid var(--border)", padding: "1.5rem", borderRadius: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "var(--accent)" }}>{post.creator.displayName}</strong>
                  <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {post.title && <h3 style={{ margin: "0 0 0.5rem" }}>{post.title}</h3>}
                <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
