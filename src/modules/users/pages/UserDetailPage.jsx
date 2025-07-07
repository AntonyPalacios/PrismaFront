import {Grid} from "@mui/material";
import {MyTitle} from "../../../components/ui/index.js";
import {useParams} from "react-router";
import {useEffect, useState} from "react";
import {users} from "../../../assets/fakeData.jsx";
import {UserForm} from "../components/UserForm.jsx";

export const UserDetailPage = () => {
    const {id} = useParams();
    /*useEffect(() => {
        //obtener usuario por id desde el backend

    },[id])*/
    const user = users.find((user) => user.id === parseInt(id));
    const [disabled, setDisabled] = useState(true)
    const toggleForm = () =>{
        setDisabled(!disabled);
    }
    return (
        <Grid container spacing={2}>
            <Grid width="100%">
                <MyTitle>Usuarios</MyTitle>
            </Grid>
            <Grid width="100%">
                <UserForm user={user} disabled={disabled} action="edit" toggleForm={toggleForm}/>
                {JSON.stringify(user, null, 2)}
            </Grid>
        </Grid>
    );
};
