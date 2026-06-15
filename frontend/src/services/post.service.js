import { api } from "./api.js";

export const getPublicPostsAPI = async (params = {}) => {
  const response = await api.get("/posts", { params });
  return response.data;
};

export const getFeedPostsAPI = async (params = {}) => {
  const response = await api.get("/posts/feed", { params });
  return response.data;
};

export const getMyPostsAPI = async (params = {}) => {
  const response = await api.get("/posts/me", { params });
  return response.data;
};

export const getPostBySlugAPI = async (slug) => {
  const response = await api.get(`/posts/${slug}`);
  return response.data;
};

export const createPostAPI = async (postData) => {
  const response = await api.post("/posts", postData);
  return response.data;
};

export const updatePostAPI = async (id, postData) => {
  const response = await api.patch(`/posts/${id}`, postData);
  return response.data;
};

export const deletePostAPI = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};
