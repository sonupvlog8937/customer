import React, { useState } from 'react'
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { HiOutlineDotsVertical } from "react-icons/hi";
import { FaHome, FaBriefcase, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { useAppContext } from "../../hooks/useAppContext";

const ITEM_HEIGHT = 48;

const AddressBox = (props) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const context = useAppContext();

    const handleClick = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const removeAddress = (id) => {
        setAnchorEl(null);
        props.removeAddress(id);
    };

    const editAddress = (id) => {
        setAnchorEl(null);
        context?.setOpenAddressPanel(true);
        context?.setAddressMode("edit");
        context?.setAddressId(id);
    };

    const isHome = props?.address?.addressType === "Home";

    return (
        <div style={styles.box}>
            {/* Top Row: Type Badge + Menu */}
            <div style={styles.topRow}>
                <span style={{ ...styles.badge, ...(isHome ? styles.badgeHome : styles.badgeOffice) }}>
                    {isHome ? <FaHome size={11} /> : <FaBriefcase size={11} />}
                    {props?.address?.addressType}
                </span>

                <div>
                    <IconButton
                        size="small"
                        aria-label="more"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={handleClick}
                        style={{ color: '#94a3b8' }}
                    >
                        <HiOutlineDotsVertical />
                    </IconButton>

                    <Menu
                        id="long-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{ 'aria-labelledby': 'long-button' }}
                        slotProps={{
                            paper: {
                                style: {
                                    maxHeight: ITEM_HEIGHT * 4.5,
                                    width: '160px',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                },
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => editAddress(props?.address?._id)}
                            style={{ fontSize: '13px', fontWeight: '500', color: '#2563eb' }}
                        >
                            ✏️ &nbsp; Edit
                        </MenuItem>
                        <MenuItem
                            onClick={() => removeAddress(props?.address?._id)}
                            style={{ fontSize: '13px', fontWeight: '500', color: '#ef4444' }}
                        >
                            🗑️ &nbsp; Delete
                        </MenuItem>
                    </Menu>
                </div>
            </div>

            {/* Name + Phone */}
            <div style={styles.nameRow}>
                <span style={styles.name}>{context?.userData?.name}</span>
                <span style={styles.phonePill}>
                    <FaPhone size={9} />
                    +{props?.address?.mobile}
                </span>
            </div>

            {/* Address Line */}
            <div style={styles.addressLine}>
                <FaMapMarkerAlt size={11} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                    {props?.address?.address_line1}, {props?.address?.city},{" "}
                    {props?.address?.state} – {props?.address?.pincode},{" "}
                    {props?.address?.country}
                </span>
            </div>
        </div>
    );
};

const styles = {
    box: {
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: 'default',
    },
    topRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.3px',
    },
    badgeHome: {
        background: '#eff6ff',
        color: '#2563eb',
        border: '1px solid #bfdbfe',
    },
    badgeOffice: {
        background: '#f0fdf4',
        color: '#16a34a',
        border: '1px solid #bbf7d0',
    },
    nameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '8px',
    },
    name: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1e293b',
    },
    phonePill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '3px 9px',
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '500',
    },
    addressLine: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        fontSize: '13px',
        color: '#64748b',
        lineHeight: '1.5',
    },
};

export default AddressBox;