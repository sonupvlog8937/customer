import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from "../../hooks/useAppContext";
import {
    FaUser,
    FaMapMarkerAlt,
    FaShoppingBag,
    FaHeart,
    FaSignOutAlt,
    FaSignInAlt,
    FaChevronRight,
} from 'react-icons/fa';

const menuItems = [
    { label: 'My Profile',  path: '/my-account',           icon: <FaUser />        },
    { label: 'My Orders',   path: '/my-orders',            icon: <FaShoppingBag /> },
    { label: 'Address',     path: '/my-account/address',   icon: <FaMapMarkerAlt />},
    { label: 'Wishlist',    path: '/my-account/wishlist',  icon: <FaHeart />       },
];

const AccountSidebar = () => {
    const context  = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    // Logout: Redux state + localStorage dono clear karo
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        context.setIsLogin(false);
        context.setUserData({});
        context.setCartData([]);
        context.setMyListData([]);
        navigate("/login");
    };

    const isLoggedIn = context?.isLogin;
    const name       = context?.userData?.name  || "";
    const email      = context?.userData?.email || "";
    const initials   = name ? name.charAt(0).toUpperCase() : null;

    return (
        <aside style={S.sidebar}>

            {/* Avatar + User Info */}
            <div style={S.userSection}>
                <div style={S.avatar}>
                    {initials ?? <FaUser size={18} />}
                </div>
                <div style={S.userInfo}>
                    <p style={S.userName}>{name || "Guest User"}</p>
                    <p style={S.userEmail}>{email || "Not logged in"}</p>
                </div>
            </div>

            <hr style={S.hr} />

            {/* Navigation */}
            <nav style={S.nav}>
                {menuItems.map(({ label, path, icon }) => (
                    <NavItem
                        key={path}
                        label={label}
                        icon={icon}
                        active={location.pathname === path}
                        onClick={() => navigate(path)}
                    />
                ))}
            </nav>

            <hr style={S.hr} />

            {/* Login / Logout */}
            <div style={S.authSection}>
                {isLoggedIn ? (
                    <AuthButton
                        icon={<FaSignOutAlt size={14} />}
                        label="Logout"
                        variant="logout"
                        onClick={handleLogout}
                    />
                ) : (
                    <AuthButton
                        icon={<FaSignInAlt size={14} />}
                        label="Login"
                        variant="login"
                        onClick={() => navigate("/login")}
                    />
                )}
            </div>
        </aside>
    );
};

/* ── NavItem ── */
const NavItem = ({ label, icon, active, onClick }) => {
    const [hovered, setHovered] = React.useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...S.navItem,
                background: active ? '#eff6ff' : hovered ? '#f8fafc' : 'transparent',
                color:      active ? '#2563eb' : '#475569',
                fontWeight: active ? '600' : '500',
            }}
        >
            <span style={{ ...S.navIcon, color: active ? '#2563eb' : '#94a3b8' }}>
                {icon}
            </span>
            <span style={S.navLabel}>{label}</span>
            {active && (
                <FaChevronRight size={10} style={{ marginLeft: 'auto', color: '#2563eb' }} />
            )}
        </button>
    );
};

/* ── AuthButton ── */
const AuthButton = ({ icon, label, variant, onClick }) => {
    const [hovered, setHovered] = React.useState(false);

    const hoverStyle = variant === 'logout'
        ? { background: '#fff1f1', color: '#b91c1c', borderColor: '#fca5a5' }
        : { background: '#1d4ed8' };

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...(variant === 'logout' ? S.logoutBtn : S.loginBtn),
                ...(hovered ? hoverStyle : {}),
            }}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

/* ── Styles ── */
const S = {
    sidebar: {
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        padding: '18px 12px',
        width: '100%',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        border: '1px solid #f1f5f9',
    },
    userSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '4px 8px 14px',
    },
    avatar: {
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '700',
        flexShrink: 0,
        boxShadow: '0 4px 12px rgba(37,99,235,0.28)',
        userSelect: 'none',
    },
    userInfo: {
        overflow: 'hidden',
        flex: 1,
    },
    userName: {
        margin: 0,
        fontSize: '14px',
        fontWeight: '700',
        color: '#1e293b',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userEmail: {
        margin: '2px 0 0',
        fontSize: '11.5px',
        color: '#94a3b8',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    hr: {
        border: 'none',
        borderTop: '1px solid #f1f5f9',
        margin: '2px 0',
    },
    nav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: '8px 0',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        fontSize: '13.5px',
        transition: 'background 0.12s, color 0.12s',
    },
    navIcon: {
        display: 'flex',
        fontSize: '14px',
        flexShrink: 0,
        transition: 'color 0.12s',
    },
    navLabel: {
        flex: 1,
    },
    authSection: {
        padding: '10px 4px 2px',
    },
    logoutBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1.5px solid #fecaca',
        background: 'transparent',
        color: '#ef4444',
        fontSize: '13.5px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
    loginBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '10px 14px',
        borderRadius: '10px',
        border: 'none',
        background: '#2563eb',
        color: '#ffffff',
        fontSize: '13.5px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        boxShadow: '0 4px 14px rgba(37,99,235,0.28)',
    },
};

export default AccountSidebar;