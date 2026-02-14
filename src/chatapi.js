import axiosInstance from "./axiosInstance";

export const getAllUsers = () => axiosInstance.get("/chat/getallusers");
// ✅ Fix: Consistent naming - use camelCase with capital G
export const getAllGroups = (userId) => axiosInstance.get(`/chat/getallgroups?userId=${userId}`);
export const createGroup = (data) => axiosInstance.post("/chat/creategroup", data);
export const getChats = (userId) => axiosInstance.get(`/chat/userchats/${userId}`);
export const getMessages = (chatId) => axiosInstance.get(`/chat/messages/${chatId}`);
export const sendMessage = (data) => axiosInstance.post("/chat/sendmessage", data);