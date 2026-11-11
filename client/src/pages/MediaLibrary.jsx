
import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  Search,
  RefreshCw,
  FolderOpen,
  AlertCircle
} from "lucide-react";
import { getPosts } from "../services/api";

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError("");

      const posts = await getPosts();
      const mediaItems = [];

      posts.forEach((post) => {
        (post.media || []).forEach((url, index) => {
          if (!url) return;

          const isVideo =
            post.postType === "Reel" ||
            /\.(mp4|mov|webm)(\?|$)/i.test(url);

          mediaItems.push({
            id: `${post._id}-${index}`,
            url,
            type: isVideo ? "Video" : "Image",
            topic: post.topic || "Untitled Post",
            postType: post.postType || "Image",
            createdAt: post.createdAt
          });
        });
      });

      // Duplicate URLs ko ek hi baar show karein
      const uniqueMedia = [
        ...new Map(mediaItems.map((item) => [item.url, item])).values()
      ];

      setMedia(uniqueMedia);
    } catch (err) {
      console.error("Media Library error:", err);
      setError(err.message || "Media load nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const matchesFilter =
        filter === "All" || item.type === filter;

      const matchesSearch =
        item.topic.toLowerCase().includes(search.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [media, filter, search]);

  const imageCount = media.filter(
    (item) => item.type === "Image"
  ).length;

  const videoCount = media.filter(
    (item) => item.type === "Video"
  ).length;

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Media Library</h1>
          <p>Your uploaded images and videos in one place.</p>
        </div>

        <button
          type="button"
          onClick={fetchMedia}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            border: "1px solid #343b35",
            borderRadius: "8px",
            background: "#151a16",
            color: "#c5ff45",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <p>Total Media</p>
            <h2>{media.length}</h2>
          </div>
          <FolderOpen size={24} color="#c5ff45" />
        </div>

        <div className="stat-card">
          <div>
            <p>Images</p>
            <h2>{imageCount}</h2>
          </div>
          <ImageIcon size={24} color="#c5ff45" />
        </div>

        <div className="stat-card">
          <div>
            <p>Videos</p>
            <h2>{videoCount}</h2>
          </div>
          <Video size={24} color="#c5ff45" />
        </div>
      </div>

      <div className="panel" style={{ marginTop: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "22px"
          }}
        >
          <div>
            <h2>All Media</h2>
            <p style={{ color: "#929a92", marginTop: "5px" }}>
              Media attached to your saved posts
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#0d110e",
              border: "1px solid #343b35",
              borderRadius: "8px",
              padding: "0 12px",
              minWidth: "230px"
            }}
          >
            <Search size={17} color="#929a92" />
            <input
              type="text"
              placeholder="Search by post name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 0",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff"
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "22px",
            flexWrap: "wrap"
          }}
        >
          {["All", "Image", "Video"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              style={{
                padding: "8px 18px",
                borderRadius: "7px",
                border: "1px solid",
                borderColor: filter === item ? "#c5ff45" : "#343b35",
                background: filter === item ? "#c5ff45" : "#151a16",
                color: filter === item ? "#101510" : "#d0d5d0",
                cursor: "pointer"
              }}
            >
              {item === "All" ? "All Media" : `${item}s`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "55px 20px", textAlign: "center" }}>
            <RefreshCw
              size={28}
              color="#c5ff45"
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ color: "#929a92" }}>Loading media...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "35px 20px", textAlign: "center" }}>
            <AlertCircle
              size={30}
              color="#ff7777"
              style={{ margin: "0 auto 12px" }}
            />
            <p style={{ color: "#ff7777" }}>{error}</p>
            <button
              type="button"
              onClick={fetchMedia}
              style={{
                marginTop: "15px",
                padding: "9px 18px",
                borderRadius: "7px",
                border: "none",
                background: "#c5ff45",
                color: "#101510",
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div style={{ padding: "55px 20px", textAlign: "center" }}>
            <FolderOpen
              size={38}
              color="#697169"
              style={{ margin: "0 auto 14px" }}
            />
            <h3 style={{ marginBottom: "8px" }}>
              {media.length === 0
                ? "No media found"
                : "No matching media"}
            </h3>
            <p style={{ color: "#929a92" }}>
              {media.length === 0
                ? "Upload media and save it with a post to see it here."
                : "Try another search or filter."}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: "18px"
            }}
          >
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                style={{
                  overflow: "hidden",
                  border: "1px solid #303830",
                  borderRadius: "10px",
                  background: "#101511"
                }}
              >
                <div
                  style={{
                    height: "190px",
                    background: "#090b0a",
                    position: "relative"
                  }}
                >
                  {item.type === "Video" ? (
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.topic}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  )}
                </div>

                <div style={{ padding: "13px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginBottom: "8px",
                      color: "#c5ff45",
                      fontSize: "12px"
                    }}
                  >
                    {item.type === "Video" ? (
                      <Video size={14} />
                    ) : (
                      <ImageIcon size={14} />
                    )}
                    {item.type}
                  </div>

                  <h3
                    style={{
                      fontSize: "14px",
                      marginBottom: "7px",
                      overflowWrap: "anywhere"
                    }}
                  >
                    {item.topic}
                  </h3>

                  <p style={{ color: "#929a92", fontSize: "12px" }}>
                    {formatDate(item.createdAt)}
                  </p>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "12px",
                      color: "#c5ff45",
                      fontSize: "12px",
                      textDecoration: "none"
                    }}
                  >
                    Open Original Media ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
