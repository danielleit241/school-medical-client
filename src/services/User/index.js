import axiosInstance from "../../api/axios";

export const UserProfile = {
    getUserProfile: async (userId) => { 
        try {
            const response = await axiosInstance.get(`/api/user-profile/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error("Error fetching user profile:", error);
            throw error; // Re-throw the error for further handling
        }
    }
};

