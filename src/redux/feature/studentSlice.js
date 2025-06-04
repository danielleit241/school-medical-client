import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    listStudent: []
}

const listStudentSlice = createSlice({
    name: "listStudent",
    initialState,
    reducers: {
        setListStudent(state, action) {
            // console.log("setListStudent action payload:", action.payload);
            state.listStudent = action.payload;
        },
        clearListStudent(state) {
            state.listStudent = [];
        }
    }
})

export const { setListStudent, clearListStudent } = listStudentSlice.actions;

export default listStudentSlice.reducer;