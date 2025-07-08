import {areas} from "../assets/fakeData.jsx";

export const getAreaById = (id) => {
    return areas.find(a => a.id === id)
}