import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CalendarDays,
  Image,
  Eye,
  Heart,
  Users,
  FileText,
  ArrowUpRight,
  Clock,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { getPosts } from "../services/api";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalPosts = posts.length;
  const scheduledPosts = posts.filter(
    (post) => post.status === "scheduled"
  ).length;
  const draftPosts = posts.filter(
    (post) => post.status === "draft"
  ).length;
  const publishedPosts = posts.filter(
    (post) => post.status === "published"
  ).length;

  const stats = [
    {
      label: "Total Posts",
      value: totalPosts,
      change: "Saved in database",
      icon: FileText
    },
    {
      label: "Published Posts",
      value: publishedPosts,
      change: "Published records",
      icon: Eye
    },
    {
      label: "Scheduled Posts",
      value: scheduledPosts,
      change: "Upcoming posts",
      icon: CalendarDays
    },
    {
      label: "Draft Posts",
      value: draftPosts,
      change: "Saved drafts",
      icon: Heart
    }
  ];

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata"
    });
  };

  return (
    <div className="page-content">
      <div className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>
            Welcome to <span>RAYS TechLab</span>
          </h1>
          <p className="muted">
            Manage your social content from one workspace.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <Link to="/create-post" className="primary-button">
            <Plus size={17} />
            Create Post
          </Link>
        </div>
      </div>

      <div className="connection">
        <div className="connection-indicator">
          <span className="status-dot"></span>
          <div>
            <strong>Instagram Account</strong>
            <p>Not connected yet</p>
          </div>
        </div>

        <Link to="/settings" className="text-button">
          Connect Account <ArrowUpRight size={15} />
        </Link>
      </div>

      {error && (
        <div className="panel" style={{ marginBottom: "20px" }}>
          <p style={{ color: "#ff7777" }}>{error}</p>
          <button
            type="button"
            className="text-button"
            onClick={fetchDashboardData}
          >
            Try Again
          </button>
        </div>
      )}

      <div className="stats-grid">
        {stats.map(({ label, value, change, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <div className="stat-icon">
                <Icon size={19} />
              </div>
            </div>

            <h2>{loading ? "..." : value}</h2>
            <p>{change}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Posts</h2>
              <p className="muted">Your latest content activity</p>
            </div>

            <Link to="/calendar" className="text-button">
              View Calendar <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="post-list">
            {loading ? (
              <p className="muted">Loading posts...</p>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 10px" }}>
                <FileText size={32} />
                <h3>No posts yet</h3>
                <p className="muted">
                  Your saved posts will appear here.
                </p>
                <Link to="/create-post" className="text-button">
                  Create your first post <ArrowUpRight size={15} />
                </Link>
              </div>
            ) : (
              posts.slice(0, 5).map((post) => (
                <div className="post-row" key={post._id}>
                  <div className="post-icon">
                    <Image size={19} />
                  </div>

                  <div className="post-info">
                    <strong>{post.topic}</strong>
                    <span>
                      {post.postType} · {formatDate(
                        post.status === "scheduled"
                          ? post.scheduledAt
                          : post.createdAt
                      )}
                    </span>
                  </div>

                  <span
                    className={`post-status ${post.status}`}
                  >
                    {post.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel quick-actions">
          <div className="panel-heading">
            <h2>Quick Actions</h2>
            <Sparkles size={18} color="#b7f34b" />
          </div>

          <Link to="/create-post" className="action-item">
            <div className="action-icon">
              <Plus size={19} />
            </div>
            <div>
              <strong>Create New Post</strong>
              <p>Prepare your next content</p>
            </div>
            <ArrowUpRight size={16} />
          </Link>

          <Link to="/calendar" className="action-item">
            <div className="action-icon">
              <CalendarDays size={19} />
            </div>
            <div>
              <strong>Content Calendar</strong>
              <p>Manage your posting schedule</p>
            </div>
            <ArrowUpRight size={16} />
          </Link>

          <Link to="/media" className="action-item">
            <div className="action-icon">
              <Image size={19} />
            </div>
            <div>
              <strong>Media Library</strong>
              <p>Organize your creative assets</p>
            </div>
            <ArrowUpRight size={16} />
          </Link>

          <div className="posting-note">
            <Clock size={17} />
            <div>
              <strong>Daily Posting Goal</strong>
              <p>Target: Every day at 9:00 AM IST</p>
            </div>
          </div>
        </section>
      </div>

      <p className="dashboard-disclaimer">
        Reach, engagement and follower analytics will be available
        after Instagram Meta API integration.
      </p>
    </div>
  );
}
