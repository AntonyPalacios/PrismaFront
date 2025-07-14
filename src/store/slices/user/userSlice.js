import { createSlice} from '@reduxjs/toolkit';


const initialState = {
    tutorList:[]
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: { //aca solo van los reducers síncronos
        setTutorList: (state,action) => {
            state.tutorList = action.payload.filter(user => user.isTutor)
        },
    },
})

export const { setTutorList} = userSlice.actions