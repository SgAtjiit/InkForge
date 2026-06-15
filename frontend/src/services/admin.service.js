import { api } from "./api.js";

export const getPendingPostsAPI = async (params = {}) => {
  const response = await api.get("/admin/posts/pending", { params });
  return response.data;
};

export const updatePostStatusAPI = async (id, payload) => {
  const response = await api.patch(`/admin/posts/${id}/status`, payload);
  return response.data;
};
