import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Logout from '@mui/icons-material/Logout';
import {menuItems} from "../../assets/fakeData.jsx";
import {Avatar, Box, Typography} from "@mui/material";
import {NavLink, useNavigate} from "react-router";

const drawerWidth = 240;

export const Navbar = () => {
    const navigate = useNavigate();
    const handleLogout = () =>{
        navigate('/login',{
            replace:true,
        });
    }
    return (
        <>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    position: 'relative',
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100vh',
                    },
                }}

                variant="permanent"
                anchor="left"
            >
                <Box>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            margin: '10% auto',
                        }}
                    >
                        <Avatar sx={{backgroundColor: 'secondary.main', width: 60, height: 60, mb: 1}}/>
                        <Typography variant="body1" sx={{fontWeight: 'bold', color:'white'}}>
                            Silvia Valle
                        </Typography>
                        <Typography variant="body2" sx={{mb: 3, color: 'white'}}>
                            Administrador
                        </Typography>
                    </Toolbar>
                    <Divider/>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.id} disablePadding>
                                <ListItemButton
                                    component={NavLink}
                                    to={item.path}
                                    sx={{
                                        '&.active': {
                                            backgroundColor: 'secondary.main',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{color: 'white'}}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} sx={{color: 'white'}}/>
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <Box sx={{p: 2}}>
                    <ListItem disablePadding onClick={handleLogout}>
                        <ListItemButton>
                            <ListItemIcon sx={{color: 'error.main'}}>
                                <Logout/>
                            </ListItemIcon>
                            <ListItemText primary="Salir" sx={{color: 'error.main'}}/>
                        </ListItemButton>
                    </ListItem>
                </Box>
            </Drawer>
        </>
    );
};
