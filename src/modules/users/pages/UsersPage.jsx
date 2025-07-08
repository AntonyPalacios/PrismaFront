import {Grid} from "@mui/material";
import {MyTitle} from '../../../components/ui/MyTitle.jsx'
import {UserTable} from "../components/UserTable.jsx";
import {MyFab} from "../../../components/ui/MyFab.jsx";
import MyModal from "../../../components/ui/MyModal.jsx";
import {useModal} from "../../../hooks/useModal.js";
import {UserForm} from "../components/UserForm.jsx";

export const UsersPage = () => {

    const {open,toggleModal, title} = useModal({title: "Nuevo Usuario"});
    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Usuarios</MyTitle>
            </Grid>
            <Grid width="100%">
                <UserTable />
            </Grid>
            <MyFab onHandleCLick={toggleModal}/>
            <MyModal
                open={open}
                toggleModal={toggleModal}
                title={title}
                content={<UserForm onCloseForm={toggleModal}/>}
            />
        </Grid>
    );
};
