import axios from "axios";

function getOrCreateDeviceId() {
  if (typeof window !== "undefined") {
    let deviceId = localStorage.getItem("carta-deviceId");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      localStorage.setItem("carta-deviceId", deviceId);
    }
    return deviceId;
  }
  return "server-side-rendering";
}

const getDeviceId = () => {
  return getOrCreateDeviceId();
};

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    "x-device-id": getDeviceId(),
  },
});

export const createLetterAPI = async (letterData: {
  title?: string;
  content?: string;
}) => {
  const response = await apiClient.post("/letters", letterData);
  return response.data;
};

export const getLettersForSidebarAPI = async () => {
  const response = await apiClient.get("/letters");
  return response.data;
};

export const getLetterByIdAPI = async (letterId: string) => {
  const response = await apiClient.get(`/letters/${letterId}`);
  return response.data;
};

export const updateLetterAPI = async (
  letterId: string,
  letterData: { title?: string; content?: string }
) => {
  const response = await apiClient.put(`/letters/${letterId}`, letterData);
  return response.data;
};
