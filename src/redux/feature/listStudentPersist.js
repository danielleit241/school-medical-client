import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // sử dụng localStorage

const initialState = {
    listStudentParentPersist: []
};

const listStudentParentPersistSlice = createSlice({
    name: "listStudentParentPersist",
    initialState,
    reducers: {
        setListStudentParentPersist(state, action) {
            console.log("setListStudentParentPersist action payload:", action.payload);
            state.listStudentParent = action.payload;
        },
        clearListStudentParent(state) {
            state.listStudentParent = [];
        }
    }
});

export const { setListStudentParentPersist, clearListStudentParent } = listStudentParentPersistSlice.actions;

// Cấu hình persist
const persistConfig = {
    key: "listStudentParentPersist",
    storage,
};

const persistedReducer = persistReducer(persistConfig, listStudentParentPersistSlice.reducer);

export default persistedReducer;