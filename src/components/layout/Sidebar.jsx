import {Box, Avatar, Typography, Button} from '@mui/material';
import {NavLink, useNavigate} from "react-router";
import {menuItems} from "../../assets/fakeData.jsx";


export default function Sidebar() {
    const navigate = useNavigate();
    const handleLogout = () =>{
        navigate('/login',{
            replace:true,
        });
    }

    return (
        <Box
            sx={{
                width: '220px',
                minHeight: '100vh',
                backgroundColor: 'primary.main', // tu primary
                color: 'text.primary',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 2,
            }}
        >
            {/* Header usuario */}
            <Avatar sx={{backgroundColor: 'secondary.main', width: 60, height: 60, mb: 1}}/>
            <Typography variant="body1" sx={{fontWeight: 'bold'}}>
                Silvia Valle
            </Typography>
            <Typography variant="body2" sx={{mb: 3}}>
                Administrador
            </Typography>

            {/* Botones */}
            <Box sx={{width: '100%'}}>
                {menuItems.map((item) => (
                    <NavLink to={item.path} key={item.id} >
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                justifyContent: 'flex-start',
                                px: 2,
                                backgroundColor: 'primary.main',
                                borderRadius: 0,
                                borderTop: '1px solid rgba(255,255,255,0.2)',
                                borderBottom: '1px solid rgba(0,0,0,0.3)',
                                color: 'text.primary',
                                height: '20%',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: 'secondary.main',
                                },
                            }}
                        >
                            {item.title}
                        </Button>
                    </NavLink>

                ))}
            </Box>
            <Box sx={{width: '100%' }}>
                <Button
                    fullWidth
                    variant="contained"
                    sx={{
                        justifyContent: 'flex-start',
                        px: 2,
                        backgroundColor: 'error.main',
                        borderRadius: 0,
                        borderTop: '1px solid rgba(255,255,255,0.2)',
                        borderBottom: '1px solid rgba(0,0,0,0.3)',
                        color: 'text.primary',
                        height: '20%',
                        fontWeight: 'bold'
                    }}
                    onClick={handleLogout}
                >
                    Logout
                </Button>
            </Box>

            {/* Relleno para completar altura */}
            <Box sx={{flexGrow: 1}}/>
        </Box>
    );
}