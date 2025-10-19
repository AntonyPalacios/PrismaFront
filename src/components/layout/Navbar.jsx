import * as React from 'react';
import {useContext, useState} from 'react';
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
import {Menu} from '@mui/icons-material';
import {Avatar, Box, IconButton, Typography} from "@mui/material";
import {NavLink} from "react-router";
import {AppContext} from "../../context/AppContext.jsx";
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../../store/slices/auth/authSlice.js";

const drawerWidth = 240;

export const Navbar = () => {

    const [mobileOpen, setMobileOpen] = useState(false);
    const {isLargeScreen} = useContext(AppContext);
    const {user} = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: 'primary.main',
            }}
        >
            <Box>
                {isLargeScreen && <Toolbar sx={{flexDirection: 'column', alignItems: 'center', py: 2}}>
                    <Avatar sx={{backgroundColor: 'secondary.main', width: 60, height: 60, mb: 1}} src={user?.picture}/>
                    <Typography variant="body1" fontWeight="bold" color="white">{user?.name}</Typography>
                    {/*<Typography variant="body2" color="white" sx={{mb: 2}}>{user.roles.filter(role => role.current)[0].role}</Typography>*/}
                </Toolbar>}
                <Divider/>
                <List sx={{ marginTop: !isLargeScreen? 10:0 }}>
                    {menuItems.map((item) => (
                        <ListItem key={item.id} disablePadding>
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                                sx={{
                                    '&.active': {
                                        backgroundColor: 'secondary.main',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{color: 'white'}}>{item.icon}</ListItemIcon>
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
        </Box>
    );
    return (
        <>
            {/* Toolbar visible solo en pantallas pequeñas */}
            {!isLargeScreen && (
                <Toolbar
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,

                        backgroundColor: 'primary.main',
                        color: 'white',
                        justifyContent: 'space-between',
                    }}
                >
                    <IconButton sx={{color: 'white'}} edge="start" onClick={handleDrawerToggle}>
                        <Menu/>
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        {user?.name}
                    </Typography>
                </Toolbar>
            )}

            {/* Drawer permanente en pantallas grandes */}
            {isLargeScreen ? (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            ) : (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{keepMounted: true}}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}
        </>
    );
};
