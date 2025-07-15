import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {useParams} from "react-router";
import {useCallback, useEffect, useState} from "react";
import {UserForm} from "../components/UserForm.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {useGetUserQuery} from "../../../store/slices/user/userApiSlice.js";
import {setTutorList} from "../../../store/slices/user/userSlice.js";

export const UserDetailPage = () => {
    const {id} = useParams();
    /*useEffect(() => {
        //obtener usuario por id desde el backend

    },[id])*/
    // const {list,status:userStatus} = useSelector(state => state.user);
    const {message,severity,open} = useSelector(state => state.alert);

    const dispatch = useDispatch();

    // Cargar estudiantes ya que si no hay nada, no puede buscar al alumno
    const { data: usersList, isLoading, isFetching, isSuccess, isError, error } = useGetUserQuery();
    useEffect(() => {
        if (isSuccess && usersList.length > 0) {
            dispatch(setTutorList(usersList));
        }
    }, [dispatch, isSuccess, usersList]);
    const user = usersList.find((user) => user.id === parseInt(id));
    const [disabled, setDisabled] = useState(true)
    const toggleForm = useCallback(() =>{
        setDisabled(prevDisabled => !prevDisabled);
    },[]);
    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Usuarios</MyTitle>
            </Grid>
            <Grid width="100%">
                <UserForm user={user} disabled={disabled} action="edit" toggleForm={toggleForm}/>
            </Grid>
            <MyAlert
                message={message}
                severity={severity}
                open={open}
                onHandleClose={()=>dispatch(toggleAlert())}
            />
        </Grid>
    );
};
