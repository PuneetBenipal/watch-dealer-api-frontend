import React, { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from 'react-router-dom';
import SimpleChatModal from "../SimpleChatModal";
import useAuth from "../../hooks/useAuth";

import { Box, Badge, IconButton, Avatar, Menu, MenuItem, Divider, ListItemIcon, Slide, Backdrop } from '@mui/material';
import { Person, Chat, Business, Notifications, Logout, Settings, List, Close, ShoppingCart } from '@mui/icons-material';

const Header = ({ unreadCount = 0 }) => {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        const URL = location.pathn0a0me;
        console.log("UI console Headre URL",URL)
        if(URL.includes("/share/")) {
            setVisible(false);
        }
    }, [])

    
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const [chatOpen, setChatOpen] = useState(false);
    const [role, setRole] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [show, setShow] = useState(false);
    
    const token = localStorage.token;

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        setAuth(token);
    }, [])
    
    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        window.location.href = "/";
    };
    
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setRole(userData?.role || null);
    }, []);
    
    // slide bar
    const navLink = (to, label) => (
        <Link
        to={to}
        className={`nav-link${location.pathname === to ? ' active' : ''}`}
            style={{
                display: 'block',
                padding: '12px 16px',
                color: location.pathname === to ? '#1976d2' : '#333',
                fontWeight: location.pathname === to ? 'bold' : 'normal',
                textDecoration: 'none',
                borderRadius: 0,
                backgroundColor: location.pathname === to ? '#e3f2fd' : 'transparent',
                transition: 'all 0.3s ease',
                marginBottom: 8,
            }}
            >
            {label}
        </Link>
    );
    
    const renderNavLinks = () => {
        switch (role) {
            case 'superadmin':
                return (
                    <>
                        {navLink('/', 'Home')}
                        {navLink('/admin', 'Superadmin')}
                    </>
                );
                case 'admin':
                    return (
                        <>
                        {navLink('/', 'Home')}
                    </>
                );
            default:
                return (
                    <>
                        {navLink('/', 'Home')}
                        {navLink('/agent', 'User Dashboard')}
                    </>
                );
            }
        };
        // slide bar
        
        const location = useLocation();
        const [id, setId] = useState(null);
        const [email, setEmail] = useState(null);
        const [date, setDate] = useState(null);
        const [name, setName] = useState(null);
        const [firstchar, setFirstchar] = useState(null);
        const [companyId, setCompanyId] = useState(null);
        const [shadow, setShadow] = useState(false);
        
    useEffect(() => {
        if (location.pathname === '/') {
            setShadow(false);
        } else {
            setShadow(true);
        }
    }, [location]);
    
    const handleProfileClick = async () => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // updateUser(parsedUser);
                setFirstchar(parsedUser.fullName.charAt(0).toUpperCase());
                setId(parsedUser.id);
                setEmail(parsedUser.email);
                setDate(parsedUser.date);
                setRole(parsedUser.role);
                setName(parsedUser.fullName);
                setCompanyId(parsedUser.companyId);
            }
            navigate('/account/profile');
        } catch (error) {
            console.error('Error updating profile data:', error);
        }
    };
    if(!visible) return <></>
    
    return (
        <>
            {
                !token ? (
                    <nav className="navbar navbar-expand-lg modern-navbar py-3">
                        <div className="container">
                            {/* Logo */}
                            <Link className="navbar-brand" to="/">
                                <span className="logo-text">
                                    Watch
                                    <span style={{
                                        color: '#b48c51',
                                        background: 'none',
                                        WebkitBackgroundClip: 'initial',
                                        WebkitTextFillColor: 'initial'
                                    }}>
                                        Dealer
                                    </span>Hub
                                </span>
                            </Link>

                            {/* Hamburger */}
                            <div className='mobile-header'>
                                <button
                                    className="navbar-toggler"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#navbarContent"
                                    aria-controls="navbarContent"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                    style={{
                                        marginBottom: 'auto', marginTop: '5px'
                                    }}
                                >
                                    <span className="navbar-toggler-icon" />
                                </button>

                                <div className="collapse navbar-collapse" id="navbarContent">
                                    <div className="d-lg-flex align-items-center mx-auto text-center">
                                        <Link to="/Dashboard" className={`nav-link${location.pathname === '/features' ? ' active' : ''}`}>Dashboard</Link>

                                        {(role === 'dealer' || (role === 'admin' && companyId)) && (
                                            <Link to="/Inventory" className={`nav-link${location.pathname === '/inventory' ? ' active' : ''}`}>Inventory</Link>
                                        )}

                                        {(role === 'admin' && companyId) && (
                                            <Link to="/Conversations" className={`nav-link${location.pathname === '/conversations' ? ' active' : ''}`}>Conversations</Link>
                                        )}

                                        {(role === 'admin' && companyId) && (
                                            <Link to="/InvoiceManager" className={`nav-link${location.pathname === '/invoice-manager' ? ' active' : ''}`}>Invoice Manager</Link>
                                        )}
                                        <Link to="/SearchWhatsApp" className={`nav-link${location.pathname === '/testimonials' ? ' active' : ''}`}>Search WhatsApp</Link>

                                        {(role === 'superadmin' || (role === 'admin' && !companyId)) && (
                                            <Link to="/admin" className={`nav-link${location.pathname === '/admin' ? ' active' : ''}`}>Admin Panel</Link>
                                        )}
                                    </div>
                                </div>

                                {
                                    role === null ?
                                        <div className="d-lg-flex align-items-center ms-lg-auto mt-3 mt-lg-0 justify-content-center ui-header-log">
                                            <Link to="/login" className="modern-signin-btn me-2">Sign In</Link>
                                            <Link to="/dealer-register" className="modern-getstarted-btn">Get Started</Link>
                                        </div> :
                                        <>
                                        </>
                                }
                            </div>
                        </div>
                    </nav>
                ) : (
                    <Box sx={{ bgcolor: '#ffffff', color: 'white', p: 2, boxShadow: shadow === true ? '0px 0px 5px black' : 'none' }}>
                        <Box className='ui-header-row'>
                            <Link to="/">
                                <span className="logo-text ui-logo-text" >
                                    Watch
                                    <span style={{
                                        color: '#b48c51',
                                        background: 'none',
                                        WebkitBackgroundClip: 'initial',
                                        WebkitTextFillColor: 'initial'
                                    }}>
                                        Dealer
                                    </span>Hub
                                </span>
                            </Link>
                            <div className="ui-header-urls">
                                {
                                    role === 'superadmin' ? (
                                        <div className="ui-oneline">
                                            <Link
                                                to="/admin"
                                                className={`nav-link${location.pathname === '/admin' ? ' active' : ''}`}
                                            >
                                                superadmin
                                            </Link>
                                        </div>
                                    ) : role === 'admin' ? (
                                        <div className="ui-oneline">
                                            {/* <Link
                                                to="/Inventory"
                                                className={`nav-link${location.pathname === '/inventory' ? ' active' : ''}`}
                                            >
                                                Inventory
                                            </Link> */}

                                        </div>
                                    ) : (
                                        <>
                                            <div className="ui-oneline">
                                                <Link
                                                    to="/agent"
                                                    className={`nav-link${location.pathname === '/agent' ? ' active' : ''}`}
                                                >
                                                    Agent Page
                                                </Link>
                                            </div>
                                        </>
                                    )
                                }
                            </div>

                            <Box style={{ display: "flex", flexDirection: "row" }} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {role === 'admin' && (
                                    <Badge badgeContent={unreadCount} color="error">
                                        <IconButton
                                            sx={{ color: '#c9a063' }}
                                        >
                                            <Business />
                                        </IconButton>
                                    </Badge>
                                )}

                                <div className="ui-list-hamber" onClick={() => setShow(!show)}>
                                    <Badge badgeContent={unreadCount} color="error">
                                        <IconButton
                                            onClick={() => setChatOpen(!chatOpen)}
                                            sx={{ color: '#c9a063' }}
                                        >
                                            <List />
                                        </IconButton>
                                    </Badge>
                                </div>
                                <div className="ui-sidebar-hover-button">
                                    <Badge badgeContent={unreadCount} color="error">
                                        <IconButton
                                            onClick={() => setChatOpen(!chatOpen)}
                                            sx={{ color: '#c9a063' }}
                                        >
                                            <Chat />
                                        </IconButton>
                                    </Badge>
                                </div>
                                <div className="ui-sidebar-hover-button">
                                    <IconButton sx={{ color: '#c9a063' }}>
                                        <Notifications />
                                    </IconButton>
                                </div>

                                <IconButton
                                    onClick={handleClick}
                                    size="small"
                                    sx={{ color: 'white' }}
                                    aria-controls={open ? 'account-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={open ? 'true' : undefined}
                                >
                                    <Avatar sx={{ bgcolor: '#c9a063', width: 32, height: 32 }}>
                                        <Person />
                                    </Avatar>
                                </IconButton>

                                <Menu
                                    anchorEl={anchorEl}
                                    id="account-menu"
                                    open={open}
                                    onClose={handleClose}
                                    onClick={handleClose}
                                    slotProps={{
                                        paper: {
                                            elevation: 0,
                                            sx: {
                                                overflow: 'visible',
                                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                                mt: 1.5,
                                                '& .MuiAvatar-root': {
                                                    width: 32,
                                                    height: 32,
                                                    ml: -0.5,
                                                    mr: 1,
                                                },
                                                '&::before': {
                                                    content: '""',
                                                    display: 'block',
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 14,
                                                    width: 10,
                                                    height: 10,
                                                    bgcolor: 'background.paper',
                                                    transform: 'translateY(-50%) rotate(45deg)',
                                                    zIndex: 0,
                                                },
                                            },
                                        },
                                    }}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <Divider />
                                    <MenuItem onClick={handleProfileClick}>
                                        <ListItemIcon>
                                            <Person fontSize="small" />
                                        </ListItemIcon>
                                        Profile
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <Logout fontSize="small" />
                                        </ListItemIcon>
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Box>
                    </Box >
                )
            }
            <Backdrop
                open={show}
                onClick={() => setShow(false)}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer - 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            />
            <Slide direction="right" in={show} mountOnEnter unmountOnExit>
                <Box
                    className="ui-sider-bar"
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer,
                        boxShadow: 6,
                    }}
                >
                    {/* Header with Close Button */}
                    <Box className='ui-slider-bar-header'>
                        <Link to="/">
                            <span className="logo-text ui-logo-slider-text" >
                                Watch
                                <span style={{
                                    color: '#b48c51',
                                    background: 'none',
                                    WebkitBackgroundClip: 'initial',
                                    WebkitTextFillColor: 'initial'
                                }}>
                                    Dealer
                                </span>Hub
                            </span>
                        </Link>
                        <IconButton onClick={() => setShow(false)} size="small">
                            <Close />
                        </IconButton>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        {renderNavLinks()}
                    </Box>
                    <div className="ui-sidebar-hover-button-show">
                        <Badge badgeContent={unreadCount} color="error">
                            <IconButton
                                onClick={() => setChatOpen(!chatOpen)}
                                sx={{ color: '#c9a063' }}
                                className="ui-slidebar-hover-icon"
                            >
                                <Chat />
                            </IconButton>
                        </Badge>
                        <div>
                            <IconButton sx={{ color: '#c9a063' }} className="ui-slidebar-hover-icon">
                                <Notifications />
                            </IconButton>
                        </div>
                    </div>
                </Box>
            </Slide>
            {chatOpen && <SimpleChatModal open={chatOpen} onClose={() => setChatOpen(false)} />}
        </>
    );
};

export default Header;
