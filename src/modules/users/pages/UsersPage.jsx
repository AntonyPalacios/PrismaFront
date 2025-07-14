import {Grid} from "@mui/material";
import {MyTitle} from '../../../components/ui/MyTitle.jsx'
import {UserTable} from "../components/UserTable.jsx";
import {MyFab} from "../../../components/ui/MyFab.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {UserForm} from "../components/UserForm.jsx";
import {useDispatch, useSelector} from "react-redux";
import {toggleAlert} from "../../../store/slices/alert/alertSlice.js";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {useGetUserQuery} from "../../../store/slices/user/userApiSlice.js";
import {useEffect} from "react";
import {setTutorList} from "../../../store/slices/user/userSlice.js";

export const UsersPage = () => {

    const {open,toggleModal, title} = useModal({title: "Nuevo Usuario"});

    const {message,severity,open:openAlert} = useSelector(state => state.alert);

    const dispatch = useDispatch();

    const { data: userList, isSuccess } = useGetUserQuery();

    useEffect(() => {
        if (isSuccess && userList.length > 0) {
            dispatch(setTutorList(userList));
        }
    }, [dispatch, isSuccess, userList]);
    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Usuarios</MyTitle>
            </Grid>
            <Grid width="100%">
                <UserTable userList={userList} />
            </Grid>
            <MyFab onHandleCLick={toggleModal}/>
            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}
                content={<UserForm onCloseForm={toggleModal}/>}
            />
            <MyAlert
                message={message}
                severity={severity}
                open={openAlert}
                onHandleClose={()=>dispatch(toggleAlert())}
            />
        </Grid>
    );
};
