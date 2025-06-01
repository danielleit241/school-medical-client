import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    phoneNumber: null,

}

const userProfileSlice = createSlice({
    name: "userProfile",
    initialState,
    reducers: {
        setUserProfile(state, action) {
            console.log("setUserProfile action payload:", action.payload);
            state.phoneNumber = action.payload.phoneNumber;
        },
        clearUserProfile(state) {
            state.phoneNumber = null;
        }
    }
})

export const { setUserProfile, clearUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;