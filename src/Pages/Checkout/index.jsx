import React, { useEffect, useMemo, useState } from "react";
import { Button, TextField } from "@mui/material";
import { BsFillBagCheckFill } from "react-icons/bs";
import { useAppContext } from "../../hooks/useAppContext";
import { FaPlus } from "react-icons/fa6";
import Radio from '@mui/material/Radio';
import { deleteData, postData, fetchDataFromApi } from "../../utils/api";
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';

const VITE_APP_RAZORPAY_KEY_ID = import.meta.env.VITE_APP_RAZORPAY_KEY_ID;
const VITE_APP_RAZORPAY_KEY_SECRET = import.meta.env.VITE_APP_RAZORPAY_KEY_SECRET;

const VITE_APP_PAYPAL_CLIENT_ID = import.meta.env.VITE_APP_PAYPAL_CLIENT_ID;
const VITE_API_URL = import.meta.env.VITE_API_URL;

const Checkout = () => {

  const [userData, setUserData] = useState(null);
  const [isChecked, setIsChecked] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [commerceSettings, setCommerceSettings] = useState({ shippingFee: 0, deliveryFee: 0, freeShippingAbove: 0, goMarketShippingFee: 0, goMarketDeliveryFeePerKm: 0, firstOrderFreeDelivery: true });
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0); // Will be updated with actual distance
  const [distanceCalculated, setDistanceCalculated] = useState(false); // Track if calculation happened
  
  // Coupon states
  const [couponInput, setCouponInput] = useState(localStorage.getItem("couponCode") || "");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSummary, setCouponSummary] = useState({ discountAmount: Number(localStorage.getItem("couponDiscount") || 0), isValid: false, message: "" });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  
  const context = useAppContext();

  const history = useNavigate();
  const location = useLocation();
  const buyNowItem = location?.state?.buyNowItem;
  const isBuyNowCheckout = Boolean(buyNowItem);
  const checkoutItems = isBuyNowCheckout ? [buyNowItem] : context?.cartData;

  const cartSubTotal = useMemo(
    () =>
      checkoutItems?.length !== 0
        ? checkoutItems?.map((item) => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0)
        : 0,
    [checkoutItems]
  );

  const couponCode = !isBuyNowCheckout ? (localStorage.getItem("couponCode") || "") : "";
  const couponDiscount = !isBuyNowCheckout ? couponSummary.discountAmount : 0;
  const discountAmount = Math.min(couponDiscount, cartSubTotal);
  const baseAfterDiscount = Math.max(cartSubTotal - discountAmount, 0);
  
  // Separate Go Market and non-Go Market items
  const goMarketItems = checkoutItems?.filter((item) => {
    const source = String(item?.source || "").toLowerCase();
    const brand = String(item?.brand || "").toLowerCase();
    const isGoMarketSeller = item?.sellerId?.storeProfile?.marketId != null || 
                             item?.sellerId?.storeProfile?.goMarketOwnerId != null;
    return source.includes("gomarket") || brand.includes("gomarket") || isGoMarketSeller;
  }) || [];
  
  const nonGoMarketItems = checkoutItems?.filter((item) => {
    const source = String(item?.source || "").toLowerCase();
    const brand = String(item?.brand || "").toLowerCase();
    const isGoMarketSeller = item?.sellerId?.storeProfile?.marketId != null || 
                             item?.sellerId?.storeProfile?.goMarketOwnerId != null;
    return !source.includes("gomarket") && !brand.includes("gomarket") && !isGoMarketSeller;
  }) || [];
  
  const hasGoMarketItems = goMarketItems.length > 0;
  const hasNonGoMarketItems = nonGoMarketItems.length > 0;
  const isMixedCart = hasGoMarketItems && hasNonGoMarketItems;
  
  // Calculate subtotals for each type
  const goMarketSubtotal = goMarketItems.reduce((sum, item) => {
    return sum + (parseInt(item.price) * item.quantity);
  }, 0);
  
  const nonGoMarketSubtotal = nonGoMarketItems.reduce((sum, item) => {
    return sum + (parseInt(item.price) * item.quantity);
  }, 0);
  
  const freeByRule = commerceSettings.freeShippingAbove > 0 && baseAfterDiscount >= commerceSettings.freeShippingAbove;
  
  // Check if first order free delivery is enabled in admin settings
  const firstOrderFreeDeliveryEnabled = commerceSettings.firstOrderFreeDelivery === true;
  const applyFirstOrderDiscount = isFirstOrder && firstOrderFreeDeliveryEnabled;
  
  // Debug log
  console.log("🔍 Client - First Order Free Delivery Check:", {
    isFirstOrder,
    firstOrderFreeDeliveryEnabled,
    settingValue: commerceSettings.firstOrderFreeDelivery,
    applyFirstOrderDiscount
  });
  
  // Calculate Go Market fees (rounded). Shipping is a flat Go Market fee; delivery is per-km.
  const goMarketShipping = (hasGoMarketItems && !applyFirstOrderDiscount && !freeByRule) 
    ? Math.round(Number(commerceSettings.goMarketShippingFee || 0))
    : 0;
  const goMarketBaseDelivery = (hasGoMarketItems && !applyFirstOrderDiscount && !freeByRule) 
    ? Math.round(Number(commerceSettings.goMarketBaseDeliveryFee || 0))
    : 0;
  const goMarketDistanceDelivery = (hasGoMarketItems && !applyFirstOrderDiscount && !freeByRule) 
    ? Math.round(Number((commerceSettings.goMarketDeliveryFeePerKm || 0) * distanceKm))
    : 0;
  const goMarketDelivery = goMarketBaseDelivery + goMarketDistanceDelivery;
  
  // Calculate normal fees (rounded)
  const normalShipping = (hasNonGoMarketItems && !applyFirstOrderDiscount && !freeByRule) 
    ? Math.round(Number(commerceSettings.shippingFee || 0))
    : 0;
  const normalDelivery = (hasNonGoMarketItems && !applyFirstOrderDiscount && !freeByRule) 
    ? Math.round(Number(commerceSettings.deliveryFee || 0))
    : 0;
  
  // Total fees
  const totalShipping = goMarketShipping + normalShipping;
  const totalDelivery = goMarketDelivery + normalDelivery;
  const totalAmount = Math.max(baseAfterDiscount + totalShipping + totalDelivery, 0);

  useEffect(() => {
    fetchDataFromApi("/api/settings/commerce").then((res) => { 
      console.log("💳 Client Checkout - Commerce Settings Response:", res);
      if (res?.data) {
        console.log("✅ Client Checkout - Settings Loaded:", res.data);
        console.log("🎁 First Order Free Delivery:", res.data.firstOrderFreeDelivery);
        setCommerceSettings({
          ...res.data,
          firstOrderFreeDelivery: res.data.firstOrderFreeDelivery === true
        });
      }
    });
  }, []);

  // Calculate dynamic Go Market distance on the server so old cart items can
  // fall back to seller/market coordinates instead of showing a static distance.
  useEffect(() => {    
    if (!hasGoMarketItems) {
      setDistanceKm(0);
      setDistanceCalculated(false);
      return;
    }
    
      const userLocation = userData?.goMarketLocation || null;
    if (!userLocation?.coordinates?.length) {
      setDistanceKm(0);
      setDistanceCalculated(false);
      return;
    }
    
    let cancelled = false;
    postData("/api/order/go-market-distance", {
      userId: userData?._id,
      products: goMarketItems,
      userLocation,
    }).then((res) => {
      if (cancelled) return;
      const nextDistance = Number(res?.data?.distanceKm || 0);
      setDistanceKm(Number.isFinite(nextDistance) ? nextDistance : 0);
      setDistanceCalculated(Boolean(nextDistance > 0));
    }).catch(() => {
      if (!cancelled) setDistanceCalculated(false);
    });

    return () => { cancelled = true; };
  }, [hasGoMarketItems, goMarketItems, userData?.goMarketLocation, userData?._id]);

  // Log fee calculation for debugging
  useEffect(() => {
    if (hasGoMarketItems || hasNonGoMarketItems) {
      console.log("💰 Fees Breakdown:", {
        cartType: isMixedCart ? "MIXED" : (hasGoMarketItems ? "GO_MARKET_ONLY" : "NORMAL_ONLY"),
        isFirstOrder,
        freeByRule,
        baseAfterDiscount: `₹${baseAfterDiscount}`,
        goMarketItems: goMarketItems.length,
        nonGoMarketItems: nonGoMarketItems.length,
        goMarketSubtotal: `₹${goMarketSubtotal}`,
        nonGoMarketSubtotal: `₹${nonGoMarketSubtotal}`,
        ...(hasGoMarketItems && {
          goMarket: {
            distanceKm: `${distanceKm.toFixed(2)} km`,
            shippingFee: `₹${goMarketShipping}`,
            deliveryFeePerKm: `₹${commerceSettings.goMarketDeliveryFeePerKm || 0}/km`,
            deliveryFeeTotal: `₹${goMarketDelivery}`,
          }
        }),
        ...(hasNonGoMarketItems && {
          normal: {
            shippingFee: `₹${normalShipping}`,
            deliveryFee: `₹${normalDelivery}`,
          }
        }),
        totalFees: `₹${totalShipping + totalDelivery}`,
        total: `₹${totalAmount}`
      });
    }
  }, [hasGoMarketItems, hasNonGoMarketItems, goMarketShipping, goMarketDelivery, normalShipping, normalDelivery, distanceKm, baseAfterDiscount, isFirstOrder, freeByRule]);

  useEffect(() => {
    // Check if user has any previous orders
    if (context?.userData?._id) {
      fetchDataFromApi(`/api/order/order-list/orders`)
        .then((res) => {
          console.log("✅ First Order Check - Response:", res);
          setIsFirstOrder(res?.total === 0 || res?.data?.length === 0);
        })
        .catch((err) => {
          console.error("❌ First Order Check Failed:", err);
          setIsFirstOrder(false);
        });
    }
  }, [context?.userData]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setUserData(context?.userData);
    setSelectedAddress(context?.userData?.address_details[0]?._id);
  }, [context?.userData]);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await fetchDataFromApi("/api/coupon/active");
        if (res && Array.isArray(res)) {
          const activeCoupons = res.filter((c) => {
            const isActive = c.isActive !== false;
            const notExpired = !c.expiryDate || new Date(c.expiryDate) > new Date();
            return isActive && notExpired;
          });
          setAvailableCoupons(activeCoupons);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  // Apply coupon function
  const applyCoupon = async (code) => {
    const couponCode = code || couponInput;
    if (!couponCode.trim()) {
      setCouponSummary({ discountAmount: 0, isValid: false, message: "Please enter a coupon code" });
      return;
    }

    setCouponLoading(true);
    try {
      const res = await postData("/api/coupon/validate", {
        code: couponCode.toUpperCase(),
        orderTotal: cartSubTotal,
      });

      if (res?.error) {
        setCouponSummary({ discountAmount: 0, isValid: false, message: res.message || "Invalid coupon code" });
        localStorage.removeItem("couponCode");
        localStorage.removeItem("couponDiscount");
      } else if (res?.coupon) {
        const discountAmount = res.discountAmount || 0;
        setCouponSummary({ discountAmount, isValid: true, message: `Coupon applied! You saved ₹${Math.round(discountAmount)}` });
        localStorage.setItem("couponCode", couponCode.toUpperCase());
        localStorage.setItem("couponDiscount", discountAmount);
      }
    } catch (error) {
      setCouponSummary({ discountAmount: 0, isValid: false, message: "Failed to apply coupon" });
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon function
  const removeCoupon = () => {
    setCouponInput("");
    setCouponSummary({ discountAmount: 0, isValid: false, message: "" });
    localStorage.removeItem("couponCode");
    localStorage.removeItem("couponDiscount");
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${VITE_APP_PAYPAL_CLIENT_ID}&disable-funding=card`;
    script.async = true;
    script.onload = () => {
      if (!window.paypal) return;
      window.paypal
        .Buttons({
          createOrder: async () => {
            const resp = await fetch("https://v6.exchangerate-api.com/v6/8f85eea95dae9336b9ea3ce9/latest/INR");
            const respData = await resp.json();
            let convertedAmount = 0;

            if (respData.result === "success") {
              const usdToInrRate = respData.conversion_rates.USD;
              convertedAmount = (totalAmount * usdToInrRate).toFixed(2);
            }
            const headers = {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json',
            };

            const response = await axios.get(
              VITE_API_URL + `/api/order/create-order-paypal?userId=${context?.userData?._id}&totalAmount=${convertedAmount}`,
              { headers }
            );

            return response?.data?.id;
          },
          onApprove: async (data) => {
            onApprovePayment(data);
          },
          onError: (err) => {
            history("/order/failed");
            console.error("PayPal Checkout onError:", err);
          },
        })
        .render("#paypal-button-container");
    };
    document.body.appendChild(script);
  }, [context?.userData, selectedAddress, totalAmount]);

  const onApprovePayment = async (data) => {
    context.setGlobalLoading(true);
    const user = context?.userData;

    const info = {
      userId: user?._id,
      products: checkoutItems,
      payment_status: "COMPLETE",
      delivery_address: selectedAddress,
      couponCode,
      discountAmount,
      totalAmt: totalAmount,
      distanceKm: hasGoMarketItems ? distanceKm : 0,
      userLocation: hasGoMarketItems ? userData?.goMarketLocation : null,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };



    const headers = {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    };

    const response = await axios.post(
      VITE_API_URL + "/api/order/capture-order-paypal",
      {
        ...info,
        paymentId: data.orderID,
      },
      { headers }
    );

    context.alertBox("success", response?.data?.message);
    history("/order/success");
    context.setGlobalLoading(false);

    if (!isBuyNowCheckout) {
      deleteData(`/api/cart/emptyCart/${context?.userData?._id}`).then(() => {
        context?.getCartItems();
        localStorage.removeItem("couponCode");
        localStorage.removeItem("couponDiscount");
        localStorage.removeItem("couponFinalTotal");
      });
    }

  };


  const editAddress = (id) => {
    context?.setOpenAddressPanel(true);
    context?.setAddressMode("edit");
    context?.setAddressId(id);
  };


  const handleChange = (e, index) => {
    if (e.target.checked) {
      setIsChecked(index);
      setSelectedAddress(e.target.value);
    }
  };



  const checkout = (e) => {
    e.preventDefault();
    context.setGlobalLoading(true);

    if (userData?.address_details?.length !== 0) {
      const options = {
        key: VITE_APP_RAZORPAY_KEY_ID,
        key_secret: VITE_APP_RAZORPAY_KEY_SECRET,
        amount: parseInt(totalAmount * 100),
        currency: "INR",
        order_receipt: context?.userData?.name,
        name: "Advanced UI Techniques",
        description: "for testing purpose",
        handler: function (response) {

          const paymentId = response.razorpay_payment_id;

          const user = context?.userData;

          const payLoad = {
            userId: user?._id,
            products: checkoutItems,
            paymentId,
            payment_status: "COMPLETED",
            delivery_address: selectedAddress,
            couponCode,
            discountAmount,
            totalAmt: totalAmount,
            distanceKm: hasGoMarketItems ? distanceKm : 0,
            userLocation: hasGoMarketItems ? userData?.goMarketLocation : null,
            date: new Date().toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
          };


          postData(`/api/order/create`, payLoad).then((res) => {
            context.alertBox("success", res?.message);
            if (res?.error === false) {
              if (!isBuyNowCheckout) {
                deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
                  context?.getCartItems();
                  localStorage.removeItem("couponCode");
                  localStorage.removeItem("couponDiscount");
                  localStorage.removeItem("couponFinalTotal");
                });
              }
              history("/order/success");
            } else {
              history("/order/failed");
              context.alertBox("error", res?.message);
            }
            context.setGlobalLoading(false);
          });


        },

        theme: {
          color: "#ff5252",
        },
      };

      const pay = new window.Razorpay(options);
      pay.open();
    } else {
      context.alertBox("error", "Please add address");
      context.setGlobalLoading(false);
    }

  };



  const cashOnDelivery = () => {

    const user = context?.userData;
    setIsloading(true);
    context.setGlobalLoading(true);

    if (userData?.address_details?.length !== 0) {
      const payLoad = {
        userId: user?._id,
        products: checkoutItems,
        paymentId: '',
        payment_status: "CASH ON DELIVERY",
        delivery_address: selectedAddress,
        couponCode,
        discountAmount,
        totalAmt: totalAmount,
        distanceKm: hasGoMarketItems ? distanceKm : 0,
        userLocation: hasGoMarketItems ? userData?.goMarketLocation : null,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };


      postData(`/api/order/create`, payLoad).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          if (!isBuyNowCheckout) {
            deleteData(`/api/cart/emptyCart/${user?._id}`).then(() => {
              context?.getCartItems();
              localStorage.removeItem("couponCode");
              localStorage.removeItem("couponDiscount");
              localStorage.removeItem("couponFinalTotal");
              setIsloading(false);
              context.setGlobalLoading(false);
            });
          } else {
            setIsloading(false);
            context.setGlobalLoading(false);
          }
          history("/order/success");
        } else {
          context.alertBox("error", res?.message);
          setIsloading(false);
          context.setGlobalLoading(false);
          history("/order/failed");
        }
      });
    } else {
      context.alertBox("error", "Please add address");
      setIsloading(false);
      context.setGlobalLoading(false);
    }
  };

  return (
    <section className="py-3 lg:py-10 px-3">
      <form onSubmit={checkout}>
        <div className="w-full lg:w-[70%] m-auto flex flex-col md:flex-row gap-5">
          <div className="leftCol w-full md:w-[60%]">
            <div className="card bg-white shadow-md p-5 rounded-md w-full">
              <div className="flex items-center justify-between">
                <h2>Select Delivery Address</h2>
                {userData?.address_details?.length !== 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      context?.setOpenAddressPanel(true);
                      context?.setAddressMode("add");
                    }}
                    className="btn"
                  >
                    <FaPlus />
                    ADD {context?.windowWidth < 767 ? '' : 'NEW ADDRESS'}
                  </Button>
                )}

              </div>

              <br />

              <div className="flex flex-col gap-4">


                {userData?.address_details?.length !== 0 ? (
                  userData?.address_details?.map((address, index) => {

                    return (
                      <label
                        className={`flex gap-3 p-4 border border-[rgba(0,0,0,0.1)] rounded-md relative ${isChecked === index && 'bg-[#fff2f2]'}`}
                        key={index}
                      >
                        <div>
                          <Radio
                            size="small"
                            onChange={(e) => handleChange(e, index)}
                            checked={isChecked === index}
                            value={address?._id}
                          />
                        </div>
                        <div className="info">
                          <span className="inline-block text-[13px] font-[500] p-1 bg-[#f1f1f1] rounded-md">{address?.addressType}</span>
                          <h3>{userData?.name}</h3>
                          <p className="mt-0 mb-0">
                            {address?.address_line1 + " " + address?.city + " " + address?.country + " " + address?.state + " " + address?.landmark + ' ' + '+ ' + address?.mobile}
                          </p>


                          <p className="mb-0 font-[500]">{userData?.mobile !== null ? '+' + userData?.mobile : '+' + address?.mobile}</p>
                        </div>

                        <Button
                          variant="text"
                          className="!absolute top-[15px] right-[15px]"
                          size="small"
                          onClick={() => editAddress(address?._id)}
                        >EDIT</Button>

                      </label>
                    );
                  })

                ) : (
                  <div className="flex items-center mt-5 justify-between flex-col p-5">
                    <img src="/map.png" width="100" />
                    <h2 className="text-center">No Addresses found in your account!</h2>
                    <p className="mt-0">Add a delivery address.</p>
                    <Button
                      className="btn-org"
                      onClick={() => {
                        context?.setOpenAddressPanel(true);
                        context?.setAddressMode("add");
                      }}
                    >
                      ADD ADDRESS
                    </Button>
                  </div>
                )}

              </div>


            </div>
          </div>

          <div className="rightCol w-full  md:w-[40%]">
            <div className="card shadow-md bg-white p-5 rounded-md">
              <h2 className="mb-4">Your Order</h2>

              <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(0,0,0,0.1)]">
                <span className="text-[14px] font-[600]">Product</span>
                <span className="text-[14px] font-[600]">Subtotal</span>
              </div>

              <div className="mb-5 scroll max-h-[250px] overflow-y-scroll overflow-x-hidden pr-2">

                {checkoutItems?.length !== 0 &&
                  checkoutItems?.map((item, index) => {
                    return (
                      <div className="flex items-center justify-between py-2" key={index}>
                        <div className="part1 flex items-center gap-3">
                          <div className="img w-[50px] h-[50px] object-cover overflow-hidden rounded-md group cursor-pointer">
                            <img src={item?.image} className="w-full transition-all group-hover:scale-105" />
                          </div>

                          <div className="info">
                            <h4 className="text-[14px]" title={item?.productTitle}>{item?.productTitle?.substr(0, 20) + '...'} </h4>
                            <span className="text-[13px]">Qty : {item?.quantity}</span>
                          </div>
                        </div>

                        <span className="text-[14px] font-[500]">
                          {(item?.quantity * item?.price)?.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {/* Coupon Section - Same as Cart */}
              <div className="mt-4">
                {/* Available Coupons List - Show Above Input */}
                {availableCoupons.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 font-[500] flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 12v10H4V12M2 7h20M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                      </svg>
                      Available Coupons ({availableCoupons.length})
                    </p>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {availableCoupons.map((coupon) => {
                        const isDisabled = coupon.minOrderAmount > cartSubTotal;
                        const discountText = coupon.type === "percentage"
                          ? `${coupon.value || 0}% off${coupon.maxDiscountAmount ? ` (upto ₹${coupon.maxDiscountAmount})` : ""}`
                          : `₹${coupon.value || 0} off`;
                        
                        return (
                          <div
                            key={coupon._id || coupon.code}
                            className={`border rounded-lg p-3 ${isDisabled ? 'opacity-50' : ''} transition-all bg-gradient-to-r from-blue-50 to-white`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 px-2 py-1 bg-blue-100 border-2 border-blue-300 border-dashed rounded text-[11px] font-bold text-blue-700">
                                {coupon.code}
                              </div>
                              <div className="flex-1">
                                <p className="text-[13px] font-[600] mb-1 text-gray-800">
                                  {coupon.title || `Get ${discountText}`}
                                </p>
                                {coupon.description && (
                                  <p className="text-[11px] text-gray-600 mb-1">
                                    {coupon.description}
                                  </p>
                                )}
                                {/* <p className={`text-[10px] ${isDisabled ? 'text-red-500' : 'text-gray-500'}`}>
                                  {isDisabled 
                                    ? `Min order ₹${coupon.minOrderAmount} required`
                                    : `Valid on orders above ₹${coupon.minOrderAmount}`
                                  }
                                </p> */}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {/* <div className="px-2 py-1 bg-green-100 rounded text-green-700 text-[11px] font-bold whitespace-nowrap">
                                  {discountText}
                                </div> */}
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => applyCoupon(coupon.code)}
                                  disabled={isDisabled || couponLoading}
                                  style={{ 
                                    fontSize: '11px', 
                                    padding: '4px 12px', 
                                    minWidth: 'auto',
                                    textTransform: 'none'
                                  }}
                                >
                                  {couponLoading ? <CircularProgress size={12} color="inherit" /> : 'Apply'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="mb-2 font-[500]">Apply Coupon Code</p>
                <div className="flex gap-2">
                  <TextField
                    size="small"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full"
                  />
                  <Button
                    variant="contained"
                    onClick={() => applyCoupon()}
                    disabled={couponLoading}
                  >
                    {couponLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </div>

                {(couponSummary.message) && (
                  <p className={`text-[13px] mt-2 ${couponSummary.isValid ? "text-green-600" : "text-red-500"}`}>
                    {couponSummary.message}
                  </p>
                )}

                {!!couponCode && (
                  <Button size="small" onClick={removeCoupon}>
                    Remove coupon
                  </Button>
                )}
              </div>

              {!!couponCode && (
                <div className="bg-[#f7f7f7] rounded-md p-3 mb-3 mt-3">
                  <p className="text-[13px] mb-1">Coupon: <strong>{couponCode}</strong></p>
                  <p className="text-[13px] mb-0">Discount: -{discountAmount.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>
                </div>
              )}

              {applyFirstOrderDiscount && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-green-700 mb-1 flex items-center gap-2">
                        First Order Special!
                      </p>
                      <p className="text-[13px] text-green-600 mb-0 leading-relaxed">
                        Congratulations! You're getting <strong>FREE shipping & delivery</strong> on your first order 🎉
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Go Market Fees */}
              {hasGoMarketItems && (
                <div className="bg-[#f7f7f7] rounded-md p-3 mb-3">
                  <p className="text-[13px] mb-1 font-semibold text-blue-700">Go Market Fees</p>
                  <p className="text-[13px] mb-1">Go Market Shipping: {goMarketShipping === 0 ? "FREE" : goMarketShipping.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>
                  <p className="text-[13px] mb-0">Go Market Delivery ({distanceKm.toFixed(1)} km): {goMarketDelivery === 0 ? "FREE" : goMarketDelivery.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>
                  {/* {!applyFirstOrderDiscount && !freeByRule && (goMarketShipping > 0 || goMarketDelivery > 0) && (
                    <p className="text-[11px] text-blue-600 mt-2 bg-blue-50 p-2 rounded whitespace-pre-line">
                      ℹ️ Distance-based fees:{'\n'}
                      Shipping: ₹{goMarketShipping}{'\n'}
                      Delivery: ₹{commerceSettings.goMarketDeliveryFeePerKm}/km × {distanceKm.toFixed(1)} km = ₹{goMarketDelivery}
                    </p>
                  )} */}
                  {applyFirstOrderDiscount && (
                    <p className="text-[11px] text-green-600 mt-2 bg-green-50 p-2 rounded">
                      🎁 First Order Special - Fees waived!
                    </p>
                  )}
                </div>
              )}

              {/* Normal E-commerce Fees */}
              {hasNonGoMarketItems && (
                <div className="bg-[#f7f7f7] rounded-md p-3 mb-3">
                  <p className="text-[13px] mb-1 font-semibold text-gray-700">Standard Fees</p>
                  <p className="text-[13px] mb-1">Shipping: {normalShipping === 0 ? "FREE" : normalShipping.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>
                  <p className="text-[13px] mb-0">Delivery fee: {normalDelivery === 0 ? "FREE" : normalDelivery.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}</p>
                </div>
              )}

              {/* Mixed Cart Badge */}
              {isMixedCart && !applyFirstOrderDiscount && !freeByRule && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-yellow-300 rounded-md p-3 mb-3">
                  <p className="text-[13px] font-semibold text-amber-800 mb-1">📦 Mixed Cart: Go Market + Regular items</p>
                  <p className="text-[11px] text-amber-700 mb-0">{goMarketItems.length} Go Market item(s) · {nonGoMarketItems.length} Regular item(s)</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-3 mb-3">
                <span className="text-[14px] font-[600]">Payable Total</span>
                <span className="text-primary font-bold">
                  {totalAmount.toLocaleString('en-US', { style: 'currency', currency: 'INR' })}
                </span>


              </div>

              <div className="flex items-center flex-col gap-3 mb-2">
                <Button type="submit" className="btn-org btn-lg w-full flex gap-2 items-center">
                  <BsFillBagCheckFill className="text-[20px]" /> Pay On Online
                </Button>

                <div id="paypal-button-container" className={`${userData?.address_details?.length === 0 ? 'pointer-events-none' : ''}`}></div>

                <Button type="button" className="btn-dark btn-lg w-full flex gap-2 items-center" onClick={cashOnDelivery}>
                  {isLoading === true ? (
                    <CircularProgress />
                  ) : (
                    <>
                      <BsFillBagCheckFill className="text-[20px]" />
                      Cash on Delivery
                    </>
                  )}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Checkout;