import {tutores} from "../assets/fakeData.jsx";

export const getTutorById = (id) => {
    return tutores.find(a => a.id === id)
}