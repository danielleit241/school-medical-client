import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./feature/userSlice";
import listStudentParentSlice from "./feature/listStudentParent";
import userProfileSlice from "./feature/userProfileSlice";
const store = configureStore({
    reducer: {
        user: userSlice,
        listStudentParent: listStudentParentSlice,
        userProfile: userProfileSlice,
    },

});

export default store;