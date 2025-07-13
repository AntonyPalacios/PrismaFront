
import {useGetAreasQuery} from "../store/slices/api/apiSlice.js";
import {useCallback} from "react";
import {useSelector} from "react-redux";

export const useGetNameById = () => {
    // 1. Obtén los datos de las áreas usando el hook de RTK Query
    const { data: areas = [], isLoading } = useGetAreasQuery();
    const {tutorList} = useSelector((state) => state.user);

    // 2. Usa useMemo para calcular el nombre del área solo cuando las áreas o el areaId cambien
    const getAreaNameById = useCallback((id) => {
        if (isLoading ) {
            return '';
        }
        // Busca el área por ID
        const area = areas.find(area => area.id === id);
        return area ? area.name : 'Área Desconocida';
    }, [areas, isLoading]);

    const getTutorNameById = useCallback((id) => {

        if (isLoading ) {
            return '';
        }
        // Busca el área por ID
        const tutor = tutorList.find(tutor => tutor.id === id);
        return tutor ? tutor.name : 'Sin Tutor';
    }, [tutorList, isLoading]);

    return {
        getAreaNameById,
        getTutorNameById
    }
}
