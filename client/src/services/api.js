
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getPosts() {
  const response = await fetch(`${API_URL}/posts`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch posts");
  }

  return data.posts;
}

export async function createPost(postData) {
  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(postData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create post");
  }

  return data.post;
}

export async function deletePost(id) {
  const response = await fetch(`${API_URL}/posts/${id}`, {
    method: "DELETE"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete post");
  }

  return data;
}
