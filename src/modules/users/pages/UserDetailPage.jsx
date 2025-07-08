import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {useParams} from "react-router";
import {useCallback, useContext, useEffect, useState} from "react";
import {UserForm} from "../components/UserForm.jsx";
import {MyAlert} from "../../../components/ui/MyAlert.jsx";
import {UserContext} from "../../../context/UserContext.jsx";

export const UserDetailPage = () => {
    const {id} = useParams();
    /*useEffect(() => {
        //obtener usuario por id desde el backend

    },[id])*/
    const {state:{users,userAlert}, onToggleAlert} = useContext(UserContext);
    const user = users.find((user) => user.id === parseInt(id));
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
                {JSON.stringify(user, null, 2)}
            </Grid>
            <MyAlert
                message={userAlert.message}
                severity={userAlert.severity}
                open={userAlert.open}
                onHandleClose={onToggleAlert}
            />
        </Grid>
    );
};
