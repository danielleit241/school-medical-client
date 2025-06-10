import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./feature/userSlice";
import listStudentParentSlice from "./feature/listStudentParent";
import userProfileSlice from "./feature/userProfileSlice";
import listStudentSlice from "./feature/studentSlice";
const store = configureStore({
    reducer: {
        user: userSlice,
        listStudentParent: listStudentParentSlice,
        userProfile: userProfileSlice, 
        listStudent: listStudentSlice,
    },
});
export default store;