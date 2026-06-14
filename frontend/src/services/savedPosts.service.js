import { api } from "./api.js";

export const savePostAPI = async (postId) => {
  const response = await api.post(`/saved-posts/${postId}`);
  return response.data;
};

export const unsavePostAPI = async (postId) => {
  const response = await api.delete(`/saved-posts/${postId}`);
  return response.data;
};

export const getSavedPostsAPI = async () => {
  const response = await api.get("/saved-posts");
  return response.data;
};
