import {useNavigate} from "react-router";
import {MyButton} from "../../components/ui/MyButton.jsx";

export const LoginPage = () => {

    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/students");
    }
    return (
        <>
            <h1>LoginPage</h1>
            <MyButton
                variant="contained"
                color="primary"
                onClick={handleLogin}
            >
                Login
            </MyButton>
        </>
    );
};
