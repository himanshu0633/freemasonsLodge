import messaging from "@react-native-firebase/messaging";
import axiosInstance from "../axiosInstance";

export const registerFCMToken = async (userId) => {
  try {
    if (!userId) {
      console.log("❌ User ID missing for FCM registration");
      return;
    }

    const token = await messaging().getToken();
    console.log("🔥 FCM TOKEN GENERATED:", token);

    if (!token) return;

    await axiosInstance.post(`/fcm-token/${userId}`, {
      fcmToken: token,
    });

    console.log("✅ FCM token saved to backend");
  } catch (error) {
    console.log("❌ FCM token error:", error.response?.data || error.message);
  }
};
