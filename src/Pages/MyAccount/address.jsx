import React from 'react'
import AccountSidebar from '../../components/AccountSidebar';
import { useAppContext } from "../../hooks/useAppContext";
import { useState, useEffect } from 'react';
import { deleteData, fetchDataFromApi } from '../../utils/api';
import AddressBox from './addressBox';
import { FaPlus, FaMapMarkerAlt } from 'react-icons/fa';

const Address = () => {
    const [address, setAddress] = useState([]);
    const context = useAppContext();

    useEffect(() => {
        if (context?.userData?._id !== "" && context?.userData?._id !== undefined) {
            setAddress(context?.userData?.address_details);
        }
    }, [context?.userData]);

    const removeAddress = (id) => {
        deleteData(`/api/address/${id}`).then((res) => {
            fetchDataFromApi(`/api/address/get?userId=${context?.userData?._id}`).then((res) => {
                setAddress(res.data);
                context?.getUserDetails();
            });
        });
    };

    return (
        <section className="py-5 lg:py-10 w-full" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container flex flex-col md:flex-row gap-5">
                {/* Sidebar */}
                <div className="col1 w-full md:w-[30%] lg:w-[20%]">
                    <AccountSidebar />
                </div>

                {/* Main Content */}
                <div className="col2 w-full md:w-[70%] lg:w-[50%]">
                    <div style={styles.card}>
                        {/* Header */}
                        <div style={styles.cardHeader}>
                            <div style={styles.headerLeft}>
                                <div style={styles.headerIcon}>
                                    <FaMapMarkerAlt size={16} color="#2563eb" />
                                </div>
                                <div>
                                    <h2 style={styles.headerTitle}>Saved Addresses</h2>
                                    <p style={styles.headerSubtitle}>{address?.length || 0} address{address?.length !== 1 ? 'es' : ''} saved</p>
                                </div>
                            </div>

                            {/* Add Address Button */}
                            <button
                                style={styles.addBtn}
                                onClick={() => {
                                    context?.setOpenAddressPanel(true);
                                    context?.setAddressMode("add");
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#1d4ed8';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.35)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = '#2563eb';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.25)';
                                }}
                            >
                                <FaPlus size={12} />
                                <span>Add Address</span>
                            </button>
                        </div>

                        <div style={styles.divider} />

                        {/* Address List */}
                        <div style={styles.addressList}>
                            {address?.length > 0 ? (
                                address.map((addr, index) => (
                                    <AddressBox address={addr} key={index} removeAddress={removeAddress} />
                                ))
                            ) : (
                                // Empty State
                                <div style={styles.emptyState}>
                                    <div style={styles.emptyIcon}>
                                        <FaMapMarkerAlt size={28} color="#cbd5e1" />
                                    </div>
                                    <p style={styles.emptyTitle}>No addresses saved</p>
                                    <p style={styles.emptySubtitle}>Add a delivery address to get started</p>
                                    <button
                                        style={styles.emptyAddBtn}
                                        onClick={() => {
                                            context?.setOpenAddressPanel(true);
                                            context?.setAddressMode("add");
                                        }}
                                    >
                                        <FaPlus size={12} />
                                        <span>Add Your First Address</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const styles = {
    card: {
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    headerIcon: {
        width: '40px',
        height: '40px',
        background: '#eff6ff',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '700',
        color: '#1e293b',
        fontFamily: "'DM Sans', sans-serif",
    },
    headerSubtitle: {
        margin: 0,
        fontSize: '12px',
        color: '#94a3b8',
        marginTop: '2px',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 16px',
        borderRadius: '10px',
        border: 'none',
        background: '#2563eb',
        color: '#fff',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
    },
    divider: {
        height: '1px',
        background: '#f1f5f9',
    },
    addressList: {
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
        gap: '8px',
    },
    emptyIcon: {
        width: '72px',
        height: '72px',
        background: '#f8fafc',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
        border: '1px dashed #e2e8f0',
    },
    emptyTitle: {
        margin: 0,
        fontSize: '15px',
        fontWeight: '600',
        color: '#475569',
    },
    emptySubtitle: {
        margin: 0,
        fontSize: '13px',
        color: '#94a3b8',
    },
    emptyAddBtn: {
        marginTop: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 20px',
        borderRadius: '10px',
        border: '1.5px dashed #2563eb',
        background: '#eff6ff',
        color: '#2563eb',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default Address;