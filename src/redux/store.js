import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./feature/userSlice";
import listStudentParentSlice from "./feature/listStudentParent";
import userProfileSlice from "./feature/userProfileSlice";
import listStudentSlice from "./feature/studentSlice";
import listStudentPersist from "./feature/listStudentPersist";
import persistStore from "redux-persist/es/persistStore";
const store = configureStore({
    reducer: {
        user: userSlice,
        listStudentParent: listStudentParentSlice,
        userProfile: userProfileSlice, 
        listStudent: listStudentSlice,
        listStudentPersist: listStudentPersist,
    },
});
export const persistor = persistStore(store);
export default store;