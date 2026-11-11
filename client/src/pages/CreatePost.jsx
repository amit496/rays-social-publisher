
import { useRef, useState } from "react";
import {
  ImagePlus,
  Sparkles,
  Hash,
  CalendarDays,
  Clock,
  Send,
  X,
  UploadCloud
} from "lucide-react";

import { createPost } from "../services/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

export default function CreatePost() {
  const fileInputRef = useRef(null);
  const mediaRef = useRef([]);

  const [caption, setCaption] = useState("");
  const [topic, setTopic] = useState("");
  const [postType, setPostType] = useState("Image");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keep React state and ref synchronized.
  const updateMedia = (newMedia) => {
    mediaRef.current = newMedia;
    setMedia(newMedia);
  };

  const generateCaption = () => {
    if (!topic.trim()) {
      alert("Please enter a post topic first.");
      return;
    }

    setCaption(
      `🚀 ${topic}

Technology is changing the way we build and create. Stay curious, keep learning, and keep experimenting!

Follow @raystechlab for more AI & Tech updates.

#RAYSTechLab #AI #Technology #Coding`
    );
  };

  const uploadMedia = async (files) => {
    if (!files || files.length === 0) return;

    if (mediaRef.current.length > 0) {
      alert("Please remove the existing media before uploading again.");
      return;
    }

    if (postType === "Image" && files.length !== 1) {
      alert("Image post supports only one file.");
      return;
    }

    if (postType === "Reel" && files.length !== 1) {
      alert("Reel supports only one video.");
      return;
    }

    if (postType === "Carousel" && files.length < 2) {
      alert("Please select at least 2 images for Carousel.");
      return;
    }

    if (
      postType === "Carousel" &&
      files.some((file) => !file.type.startsWith("image/"))
    ) {
      alert("Carousel supports images only.");
      return;
    }

    if (
      postType === "Image" &&
      !files[0].type.startsWith("image/")
    ) {
      alert("Please select an image for Image post.");
      return;
    }

    if (
      postType === "Reel" &&
      !files[0].type.startsWith("video/")
    ) {
      alert("Please select a video for Reel.");
      return;
    }

    if (files.some((file) => file.size > MAX_FILE_SIZE)) {
      alert("Each file must be smaller than 100 MB.");
      return;
    }

    try {
      setUploading(true);

      const uploadedMedia = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("media", file);

        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: formData
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.media?.url) {
          throw new Error(
            data.message || "Media upload failed."
          );
        }

        uploadedMedia.push({
          url: data.media.url,
          publicId: data.media.publicId,
          mediaType: data.media.mediaType,
          originalName: data.media.originalName
        });
      }

      // Update ref and state together.
      updateMedia(uploadedMedia);

      console.log("Uploaded media:", uploadedMedia);

      alert("Media uploaded successfully!");
    } catch (error) {
      console.error("Media upload error:", error);

      updateMedia([]);

      alert(error.message || "Media upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    updateMedia([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const savePost = async (status) => {
    const currentMedia = mediaRef.current;

    if (!topic.trim()) {
      alert("Please enter a post topic first.");
      return;
    }

    if (uploading) {
      alert("Please wait until media upload finishes.");
      return;
    }

    if (currentMedia.length === 0) {
      alert("Please upload your media first.");
      return;
    }

    if (loading) return;

    let scheduledAt = null;

    if (status === "scheduled") {
      if (!scheduleDate || !scheduleTime) {
        alert("Please select schedule date and time.");
        return;
      }

      scheduledAt = new Date(
        `${scheduleDate}T${scheduleTime}:00+05:30`
      );

      if (Number.isNaN(scheduledAt.getTime())) {
        alert("Invalid schedule date or time.");
        return;
      }

      if (scheduledAt <= new Date()) {
        alert("Please select a future date and time.");
        return;
      }
    }

    try {
      setLoading(true);

      const postData = {
        topic: topic.trim(),
        caption,
        postType,
        media: currentMedia.map((item) => item.url),
        status,
        scheduledAt
      };

      console.log("Saving post data:", postData);

      const savedPost = await createPost(postData);

      console.log("Saved post:", savedPost);

      alert(
        status === "draft"
          ? "Draft saved successfully!"
          : "Post scheduled successfully!"
      );

      setTopic("");
      setCaption("");
      setPostType("Image");
      setScheduleDate("");
      setScheduleTime("09:00");

      updateMedia([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Post save error:", error);

      alert(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const openFilePicker = () => {
    if (
      !uploading &&
      !loading &&
      mediaRef.current.length === 0
    ) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONTENT WORKSPACE</p>

          <h1>
            Create <span>Post</span>
          </h1>

          <p className="muted">
            Create and prepare your next Instagram post.
          </p>
        </div>
      </div>

      <div className="create-grid">
        <section className="panel create-form">
          <h2>Post Details</h2>

          <label>Post Type</label>

          <div className="type-options">
            {["Image", "Carousel", "Reel"].map((type) => (
              <button
                key={type}
                type="button"
                className={
                  postType === type
                    ? "type-option selected"
                    : "type-option"
                }
                disabled={uploading || loading || media.length > 0}
                onClick={() => setPostType(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <label>Topic / Idea</label>

          <input
            className="field"
            placeholder="e.g. Future of AI Agents"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div className="label-row">
            <label>Caption</label>

            <button
              type="button"
              className="text-button"
              onClick={generateCaption}
              disabled={loading}
            >
              <Sparkles size={15} />
              Generate Caption
            </button>
          </div>

          <textarea
            className="field caption-field"
            placeholder="Write your Instagram caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
          />

          <div className="label-row">
            <label>
              <Hash size={14} />
              Hashtags
            </label>

            <span className="muted">Included in caption</span>
          </div>

          <label>Media Upload</label>

          <div
            className="upload-area"
            style={{ cursor: "pointer" }}
            onClick={openFilePicker}
          >
            <UploadCloud size={30} />

            <strong>
              {postType === "Carousel"
                ? "Upload multiple images"
                : postType === "Reel"
                ? "Upload your video"
                : "Upload your image"}
            </strong>

            <span>
              Files will be uploaded to Cloudinary.
            </span>

            <button
              type="button"
              className="primary-button"
              disabled={
                uploading || loading || media.length > 0
              }
              onClick={(e) => {
                e.stopPropagation();
                openFilePicker();
              }}
            >
              {uploading ? "Uploading..." : "Choose File"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              accept={
                postType === "Reel"
                  ? "video/mp4,video/quicktime"
                  : "image/jpeg,image/png,image/webp,image/gif"
              }
              multiple={postType === "Carousel"}
              disabled={
                uploading || loading || media.length > 0
              }
              onChange={(e) => {
                const selectedFiles = Array.from(
                  e.target.files || []
                );

                uploadMedia(selectedFiles);

                e.target.value = "";
              }}
            />

            {uploading && (
              <strong>Uploading media to Cloudinary...</strong>
            )}
          </div>

          {media.length > 0 && (
            <div
              className="panel"
              style={{
                marginTop: "16px",
                padding: "16px"
              }}
            >
              <div className="label-row">
                <strong>
                  Uploaded Media ({media.length})
                </strong>

                <button
                  type="button"
                  className="text-button"
                  onClick={removeMedia}
                  disabled={loading || uploading}
                >
                  <X size={15} />
                  Remove
                </button>
              </div>

              {media.map((item, index) => (
                <div
                  key={item.publicId || item.url}
                  style={{ marginTop: "12px" }}
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={item.url}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "250px",
                        borderRadius: "10px"
                      }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.originalName || "Uploaded media"}
                      style={{
                        width: "100%",
                        maxHeight: "250px",
                        objectFit: "contain",
                        borderRadius: "10px"
                      }}
                    />
                  )}

                  <span className="muted">
                    {index + 1}. {item.originalName}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="schedule-row">
            <div>
              <label>
                <CalendarDays size={14} />
                Schedule Date
              </label>

              <input
                type="date"
                className="field"
                value={scheduleDate}
                onChange={(e) =>
                  setScheduleDate(e.target.value)
                }
                disabled={loading}
              />
            </div>

            <div>
              <label>
                <Clock size={14} />
                Schedule Time
              </label>

              <input
                type="time"
                className="field"
                value={scheduleTime}
                onChange={(e) =>
                  setScheduleTime(e.target.value)
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              disabled={loading || uploading}
              onClick={() => savePost("draft")}
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              className="primary-button"
              disabled={loading || uploading}
              onClick={() => savePost("scheduled")}
            >
              <Send size={16} />

              {uploading
                ? "Uploading..."
                : loading
                ? "Processing..."
                : "Schedule Post"}
            </button>
          </div>
        </section>

        <section className="panel preview-panel">
          <div className="panel-heading">
            <h2>Live Preview</h2>
            <span className="instagram-label">IG</span>
          </div>

          <div className="instagram-preview">
            <div className="preview-account">
              <div className="avatar">R</div>
              <strong>raystechlab</strong>
            </div>

            <div className="preview-image">
              {media.length > 0 ? (
                media[0].mediaType === "video" ? (
                  <video
                    src={media[0].url}
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "contain"
                    }}
                  />
                ) : (
                  <img
                    src={media[0].url}
                    alt={topic || "Post preview"}
                    style={{
                      width: "100%",
                      maxHeight: "300px",
                      objectFit: "contain"
                    }}
                  />
                )
              ) : (
                <>
                  <ImagePlus size={38} />
                  <strong>
                    {topic || "Your Post Preview"}
                  </strong>
                  <span>MADE AT RAYS TECHLAB</span>
                </>
              )}
            </div>

            <div className="preview-caption">
              <strong>raystechlab</strong>{" "}
              {caption ||
                "Your Instagram caption will appear here..."}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
