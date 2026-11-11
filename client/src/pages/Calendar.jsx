import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  RefreshCw,
  Trash2,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Image,
  Video
} from "lucide-react";
import { getPosts, deletePost } from "../services/api";

export default function Calendar() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      await deletePost(id);
      setPosts((current) =>
        current.filter((post) => post._id !== id)
      );
    } catch (err) {
      alert(err.message || "Failed to delete post.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata"
    });
  };

  const monthLabel = currentMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday se week start
    const startOffset = (firstDay.getDay() + 6) % 7;

    const days = [];

    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  const getScheduledPosts = (date) => {
    if (!date) return [];

    return posts.filter((post) => {
      if (post.status !== "scheduled" || !post.scheduledAt) {
        return false;
      }

      const scheduledDate = new Date(post.scheduledAt);

      return (
        scheduledDate.getFullYear() === date.getFullYear() &&
        scheduledDate.getMonth() === date.getMonth() &&
        scheduledDate.getDate() === date.getDate()
      );
    });
  };

  const drafts = posts.filter((post) => post.status === "draft");
  const scheduledCount = posts.filter(
    (post) => post.status === "scheduled"
  ).length;

  const today = new Date();

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONTENT MANAGEMENT</p>
          <h1>
            Content <span>Calendar</span>
          </h1>
          <p className="muted">
            Manage your saved and scheduled Instagram posts.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={fetchPosts}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FileText size={20} />
          <p>Total Posts</p>
          <h2>{posts.length}</h2>
        </div>

        <div className="stat-card">
          <Clock size={20} />
          <p>Scheduled</p>
          <h2>{scheduledCount}</h2>
        </div>

        <div className="stat-card">
          <CalendarDays size={20} />
          <p>Drafts</p>
          <h2>{drafts.length}</h2>
        </div>
      </div>

      <section className="panel" style={{ marginTop: "24px" }}>
        <div
          className="panel-heading"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div>
            <h2>Publishing Calendar</h2>
            <p className="muted">
              Scheduled posts by date
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setCurrentMonth(
                  (month) =>
                    new Date(
                      month.getFullYear(),
                      month.getMonth() - 1,
                      1
                    )
                )
              }
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <strong style={{ minWidth: "145px", textAlign: "center" }}>
              {monthLabel}
            </strong>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setCurrentMonth(
                  (month) =>
                    new Date(
                      month.getFullYear(),
                      month.getMonth() + 1,
                      1
                    )
                )
              }
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading calendar...</p>
        ) : error ? (
          <p style={{ color: "#ff7777" }}>{error}</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: "6px",
                marginTop: "20px"
              }}
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day) => (
                  <div
                    key={day}
                    style={{
                      textAlign: "center",
                      padding: "10px 2px",
                      color: "#c5ff45",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    {day}
                  </div>
                )
              )}

              {calendarDays.map((date, index) => {
                const dayPosts = getScheduledPosts(date);

                const isToday =
                  date &&
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();

                return (
                  <div
                    key={index}
                    style={{
                      minHeight: "105px",
                      padding: "8px",
                      border: "1px solid #292e29",
                      borderRadius: "8px",
                      background: date ? "#101511" : "transparent",
                      opacity: date ? 1 : 0.3,
                      minWidth: 0
                    }}
                  >
                    {date && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px"
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: isToday ? "700" : "400",
                              color: isToday ? "#c5ff45" : "#d0d5d0"
                            }}
                          >
                            {date.getDate()}
                          </span>

                          {dayPosts.length > 0 && (
                            <span
                              style={{
                                fontSize: "10px",
                                color: "#c5ff45"
                              }}
                            >
                              {dayPosts.length} posts
                            </span>
                          )}
                        </div>

                        <div style={{ display: "grid", gap: "5px" }}>
                          {dayPosts.map((post) => (
                            <div
                              key={post._id}
                              title={`${post.topic} - ${formatDate(post.scheduledAt)}`}
                              style={{
                                padding: "5px",
                                borderRadius: "5px",
                                background: "#27351c",
                                borderLeft: "3px solid #c5ff45",
                                fontSize: "10px",
                                color: "#e8f5d9",
                                overflowWrap: "anywhere"
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginBottom: "3px"
                                }}
                              >
                                {post.postType === "Reel" ? (
                                  <Video size={11} />
                                ) : (
                                  <Image size={11} />
                                )}
                                {new Date(post.scheduledAt).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Asia/Kolkata"
                                  }
                                )}
                              </div>
                              {post.topic}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                gap: "18px",
                flexWrap: "wrap",
                marginTop: "16px",
                fontSize: "12px",
                color: "#929a92"
              }}
            >
              <span>
                <span style={{ color: "#c5ff45" }}>●</span> Scheduled post
              </span>
              <span>
                <span style={{ color: "#75d9a0" }}>●</span> Today's date
              </span>
            </div>
          </>
        )}
      </section>

      <section className="panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <h2>Saved Drafts</h2>
          <span className="muted">{drafts.length} drafts</span>
        </div>

        {loading ? (
          <p className="muted">Loading drafts...</p>
        ) : drafts.length === 0 ? (
          <p className="muted">No saved drafts yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {drafts.map((post) => (
              <div
                key={post._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                  padding: "14px",
                  border: "1px solid #292e29",
                  borderRadius: "10px"
                }}
              >
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <h3 style={{ margin: "0 0 7px" }}>
                    {post.topic}
                  </h3>
                  <p className="muted" style={{ margin: 0 }}>
                    {post.postType} · Created {formatDate(post.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleDelete(post._id)}
                  title="Delete draft"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel" style={{ marginTop: "24px" }}>
        <div className="panel-heading">
          <h2>All Scheduled Posts</h2>
          <span className="muted">{scheduledCount} posts</span>
        </div>

        {loading ? (
          <p className="muted">Loading posts...</p>
        ) : scheduledCount === 0 ? (
          <p className="muted">No scheduled posts yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {posts
              .filter((post) => post.status === "scheduled")
              .sort(
                (a, b) =>
                  new Date(a.scheduledAt) - new Date(b.scheduledAt)
              )
              .map((post) => (
                <div
                  key={post._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    padding: "14px",
                    border: "1px solid #292e29",
                    borderRadius: "10px"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <h3 style={{ margin: "0 0 7px" }}>
                      {post.topic}
                    </h3>
                    <p className="muted" style={{ margin: "0 0 7px" }}>
                      {post.postType} · {formatDate(post.scheduledAt)}
                    </p>
                    <span
                      style={{
                        color: "#c5ff45",
                        fontSize: "11px",
                        textTransform: "uppercase"
                      }}
                    >
                      Scheduled
                    </span>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleDelete(post._id)}
                    title="Delete scheduled post"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
