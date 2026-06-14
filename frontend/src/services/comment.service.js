import { api } from "./api.js";

export const getPostCommentsAPI = async (postId) => {
  const response = await api.get(`/comments/post/${postId}`);
  return response.data;
};

export const createCommentAPI = async (commentData) => {
  const response = await api.post("/comments", commentData);
  return response.data;
};

export const deleteCommentAPI = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};
