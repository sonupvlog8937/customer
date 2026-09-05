// import React, { useEffect, useMemo, useState } from "react";

// import Button from "@mui/material/Button";
// import { BsFillBagCheckFill } from "react-icons/bs";
// import TextField from "@mui/material/TextField";
// import CartItems from "./cartItems";
// import { useAppContext } from "../../hooks/useAppContext";
// import { fetchDataFromApi, postData } from "../../utils/api";
// import { Link } from "react-router-dom";

// const COUPON_CONFIG = {
//   SAVE10: { type: "percentage", value: 10, minAmount: 1000 },
//   FLAT200: { type: "fixed", value: 200, minAmount: 1500 },
//   FREESHIP: { type: "fixed", value: 0, minAmount: 0 },
// };

// const CartPage = () => {

//   const [productSizeData, setProductSizeData] = useState([]);
//   const [productRamsData, setProductRamsData] = useState([]);
//   const [productWeightData, setProductWeightData] = useState([]);
//   const [couponInput, setCouponInput] = useState(localStorage.getItem("couponCode") || "");
//   const [couponMessage, setCouponMessage] = useState("");
//   const context = useAppContext();

//   useEffect(() => {

//     window.scrollTo(0, 0);

//     fetchDataFromApi("/api/product/productSize/get").then((res) => {
//       if (res?.error === false) {
//         setProductSizeData(res?.data);
//       }
//     });

//     fetchDataFromApi("/api/product/productRAMS/get").then((res) => {
//       if (res?.error === false) {
//         setProductRamsData(res?.data);
//       }
//     });

//     fetchDataFromApi("/api/product/productWeight/get").then((res) => {
//       if (res?.error === false) {
//         setProductWeightData(res?.data);
//       }
//     });
//   }, []);

//   const cartSubTotal = useMemo(
//     () =>
//       context.cartData?.length !== 0
//         ? context.cartData?.map((item) => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0)
//         : 0,
//     [context.cartData]
//   );

//   const couponSummary = useMemo(() => {
//     const code = (localStorage.getItem("couponCode") || "").trim().toUpperCase();

//     if (!code) {
//       return { code: "", discountAmount: 0, isValid: false, message: "" };
//     }

//     const coupon = COUPON_CONFIG[code];

//     if (!coupon) {
//       return { code, discountAmount: 0, isValid: false, message: "Invalid coupon code" };
//     }

//     if (cartSubTotal < coupon.minAmount) {
//       return {
//         code,
//         discountAmount: 0,
//         isValid: false,
//         message: `Coupon requires minimum order of ${coupon.minAmount.toLocaleString("en-US", { style: "currency", currency: "INR" })}`,
//       };
//     }

//     const discountAmount = coupon.type === "percentage" ? Math.round((cartSubTotal * coupon.value) / 100) : coupon.value;

//     return {
//       code,
//       discountAmount,
//       isValid: true,
//       message: `${code} applied successfully`,
//     };
//   }, [cartSubTotal]);

//   useEffect(() => {
//     if (!couponSummary.code) {
//       localStorage.removeItem("couponDiscount");
//       localStorage.removeItem("couponFinalTotal");
//       return;
//     }

//     if (couponSummary.isValid) {
//       localStorage.setItem("couponDiscount", String(couponSummary.discountAmount));
//       localStorage.setItem("couponFinalTotal", String(Math.max(cartSubTotal - couponSummary.discountAmount, 0)));
//       return;
//     }

//     localStorage.removeItem("couponDiscount");
//     localStorage.removeItem("couponFinalTotal");
//   }, [couponSummary, cartSubTotal]);

//   const applyCoupon = () => {
//     const code = couponInput.trim().toUpperCase();

//     if (!code) {
//       setCouponMessage("Please enter a coupon code");
//       return;
//     }

//     localStorage.setItem("couponCode", code);
//     setCouponInput(code);
//     setCouponMessage("");
//   };

//   const removeCoupon = () => {
//     localStorage.removeItem("couponCode");
//     localStorage.removeItem("couponDiscount");
//     localStorage.removeItem("couponFinalTotal");
//     setCouponInput("");
//     setCouponMessage("Coupon removed");
//   };


//   const selectedSize = (item) => {
//     if (item?.size !== "") {
//       return item?.size;
//     }

//     if (item?.weight !== "") {
//       return item?.weight;
//     }

//     if (item?.ram !== "") {
//       return item?.ram;
//     }

//   };

//   const totalAfterDiscount = Math.max(cartSubTotal - (couponSummary?.discountAmount || 0), 0);

//   return (
//     <section className="section py-4 lg:py-8 pb-10">
//       <div className="container w-[80%] max-w-[80%] flex gap-5 flex-col lg:flex-row">
//         <div className="leftPart w-full lg:w-[70%]">
//           <div className="shadow-md rounded-md bg-white">
//             <div className="py-5 px-3 border-b border-[rgba(0,0,0,0.1)]">
//               <h2>Your Cart</h2>
//               <p className="mt-0 mb-0">
//                 There are <span className="font-bold text-primary">{context?.cartData?.length}</span>{" "}
//                 products in your cart
//               </p>
//             </div>

          

//              {context?.cartData?.length !== 0 ? (
//               context?.cartData?.map((item, index) => {
//                 return (
//                  <CartItems
//                     selected={() => selectedSize(item)}
//                     qty={item?.quantity}
//                     item={item}
//                     key={index}
//                     productSizeData={productSizeData}
//                     productRamsData={productRamsData}
//                     productWeightData={productWeightData}
//                   />
//                 );
//               })

//                  ) : (
//               <div className="flex items-center justify-center flex-col py-10 gap-5">
//                 <img src="/empty-cart.png" className="w-[150px]" />
//                 <h4>Your Cart is currently empty</h4>
//                 <Link to="/">
//                   <Button className="btn-org">Continue Shopping</Button>
//                 </Link>
//               </div>
//             )}

//           </div>
//         </div>

//         <div className="rightPart w-full lg:w-[30%]">
//           <div className="shadow-md rounded-md bg-white p-5 sticky top-[155px] z-[90]">
//             <h3 className="pb-3">Cart Totals</h3>
//             <hr />

//              <div className="mb-3 mt-4">
//               <p className="text-[14px] font-[500] mb-2">Apply Coupon</p>
//               <div className="flex gap-2">
//                 <TextField
//                   size="small"
//                   placeholder="Enter code"
//                   value={couponInput}
//                   onChange={(e) => setCouponInput(e.target.value)}
//                   className="w-full"
//                 />
//                 <Button type="button" variant="outlined" onClick={applyCoupon}>Apply</Button>
//               </div>

//               {(couponSummary.message || couponMessage) && (
//                 <p className={`text-[12px] mt-2 ${couponSummary.isValid ? "text-green-600" : "text-red-500"}`}>
//                   {couponSummary.message || couponMessage}
//                 </p>
//               )}

//               {couponSummary.code && (
//                 <Button type="button" size="small" onClick={removeCoupon} className="!mt-1 !p-0 !min-w-0">
//                   Remove coupon
//                 </Button>
//               )}
//             </div>

//             <p className="flex items-center justify-between">
//               <span className="text-[14px] font-[500]">Subtotal</span>
//               <span className="text-primary font-bold">
//                   {cartSubTotal?.toLocaleString("en-US", { style: "currency", currency: "INR" })}
//               </span>
//             </p>

//             <p className="flex items-center justify-between">
//               <span className="text-[14px] font-[500]">Shipping</span>
//               <span className="font-bold">Free</span>
//             </p>

//               <p className="flex items-center justify-between">
//               <span className="text-[14px] font-[500]">Coupon Discount</span>
//               <span className="font-bold text-green-600">
//                 -{(couponSummary?.discountAmount || 0).toLocaleString("en-US", { style: "currency", currency: "INR" })}
//               </span>
//             </p>

//             <p className="flex items-center justify-between">
//               <span className="text-[14px] font-[500]">Estimate for</span>
//               <span className="font-bold"><span className="font-bold">{context?.userData?.address_details[0]?.country}</span></span>
//             </p>

//             <p className="flex items-center justify-between">
//               <span className="text-[14px] font-[500]">Total</span>
//               <span className="text-primary font-bold">
//                   {totalAfterDiscount?.toLocaleString("en-US", { style: "currency", currency: "INR" })}
//               </span>
//             </p>

//             <br />

//             <Link to="/checkout">
//               <Button className="btn-org btn-lg w-full flex gap-2">
//                 <BsFillBagCheckFill className="text-[20px]" /> Checkout
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CartPage;


import React, { useEffect, useMemo, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { BsFillBagCheckFill } from "react-icons/bs";
import TextField from "@mui/material/TextField";
import CartItems from "./cartItems";
import { useAppContext } from "../../hooks/useAppContext";
import { fetchDataFromApi, postData } from "../../utils/api";
import { Link } from "react-router-dom";
import { IoPricetagOutline, IoCloseCircle, IoCheckmarkCircle, IoAlertCircle, IoLockClosed } from "react-icons/io5";

const CartPage = () => {

  const [productSizeData, setProductSizeData] = useState([]);
  const [productRamsData, setProductRamsData] = useState([]);
  const [productWeightData, setProductWeightData] = useState([]);

  const [couponInput, setCouponInput] = useState(localStorage.getItem("couponCode") || "");
  const [appliedCoupon, setAppliedCoupon] = useState(localStorage.getItem("couponCode") || "");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [applyingCouponCode, setApplyingCouponCode] = useState(""); // Track which coupon is being applied
  const [couponSummary, setCouponSummary] = useState({ discountAmount: Number(localStorage.getItem("couponDiscount") || 0), isValid: false, message: "" });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [commerceSettings, setCommerceSettings] = useState({ shippingFee: 0, deliveryFee: 0, freeShippingAbove: 0, goMarketShippingFee: 0, goMarketDeliveryFeePerKm: 0 });
  const [goMarketDistanceKm, setGoMarketDistanceKm] = useState(0);

  const context = useAppContext();

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchDataFromApi("/api/product/productSize/get").then((res) => {
      if (!res?.error) setProductSizeData(res?.data);
    });

    fetchDataFromApi("/api/product/productRAMS/get").then((res) => {
      if (!res?.error) setProductRamsData(res?.data);
    });

    fetchDataFromApi("/api/product/productWeight/get").then((res) => {
      if (!res?.error) setProductWeightData(res?.data);
    });

    // Fetch commerce settings for shipping and delivery fees
    fetchDataFromApi("/api/settings/commerce").then((res) => {
      if (res?.data) setCommerceSettings(res.data);
    });

    // Fetch available coupons
    fetchDataFromApi("/api/coupon/active").then((res) => {
      if (res && Array.isArray(res)) {
        const activeCoupons = res.filter((c) => {
          const isActive = c.isActive !== false;
          const notExpired = !c.expiryDate || new Date(c.expiryDate) > new Date();
          return isActive && notExpired;
        });
        setAvailableCoupons(activeCoupons);
      }
    });
  }, []);

  // ✅ Subtotal
  const cartSubTotal = useMemo(() => {
    if (!context?.cartData?.length) return 0;
    return context.cartData
      .map((item) => parseInt(item.price) * item.quantity)
      .reduce((total, value) => total + value, 0);
  }, [context?.cartData]);

 const applyCoupon = async (code = null) => {
    const couponCode = code || couponInput.trim();
    
    if (!couponCode) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setApplyingCouponCode(couponCode.toUpperCase()); // Track which coupon is being applied
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/coupon/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify({ code: couponCode.toUpperCase(), orderAmount: cartSubTotal })
    });

    const data = await response.json();
    setCouponLoading(false);
    setApplyingCouponCode(""); // Reset

     if (response.ok && data?.success) {
      const appliedCode = data.code || data.coupon?.code || couponCode.toUpperCase();
      setAppliedCoupon(appliedCode);
      setCouponInput(appliedCode);
      setCouponSummary({ discountAmount: data.discountAmount, isValid: true, message: data.message });
      setCouponMessage("");
      localStorage.setItem("couponCode", appliedCode);
      localStorage.setItem("couponDiscount", String(data.discountAmount));
    } else {
      setAppliedCoupon(""); // Clear on error
      setCouponSummary({ discountAmount: 0, isValid: false, message: data?.message || "Invalid coupon code" });
      setCouponMessage(data?.message || "Invalid coupon code");
      localStorage.removeItem("couponCode");
      localStorage.removeItem("couponDiscount");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponMessage("Coupon removed");

    localStorage.removeItem("couponCode");
    localStorage.removeItem("couponDiscount");
    setCouponSummary({ discountAmount: 0, isValid: false, message: "" });
  };

  const goMarketItems = useMemo(() => (context?.cartData || []).filter((item) => {
    const source = String(item?.source || "").toLowerCase();
    const brand = String(item?.brand || "").toLowerCase();
    const isGoMarketSeller = item?.sellerId?.storeProfile?.marketId != null || item?.sellerId?.storeProfile?.goMarketOwnerId != null;
    return source.includes("gomarket") || brand.includes("gomarket") || isGoMarketSeller;
  }), [context?.cartData]);

  const nonGoMarketItems = useMemo(() => (context?.cartData || []).filter((item) => !goMarketItems.includes(item)), [context?.cartData, goMarketItems]);
  const hasGoMarketItems = goMarketItems.length > 0;
  const hasNonGoMarketItems = nonGoMarketItems.length > 0;

  useEffect(() => {
    if (!hasGoMarketItems || !context?.userData?.goMarketLocation?.coordinates?.length) {
      setGoMarketDistanceKm(0);
      return;
    }

    let cancelled = false;
    console.log("🛒 Client Cart: Fetching Go Market distance with ROAD FACTOR (1.35x)...");
    postData("/api/order/go-market-distance", {
      userId: context?.userData?._id,
      products: goMarketItems,
      userLocation: context?.userData?.goMarketLocation,
    }).then((res) => {
      if (cancelled) return;
      const nextDistance = Number(res?.data?.distanceKm || 0);
      console.log("✅ Client Cart distance fetched:", nextDistance, "km");
      console.log("   ℹ️ This distance INCLUDES 1.35x road factor for accurate routing");
      console.log("   ℹ️ Server response:", res?.data);
      setGoMarketDistanceKm(Number.isFinite(nextDistance) ? nextDistance : 0);
    }).catch((err) => {
      console.error("❌ Client Cart distance fetch failed:", err);
      if (!cancelled) setGoMarketDistanceKm(0);
    });

    return () => { cancelled = true; };
  }, [hasGoMarketItems, goMarketItems, context?.userData?.goMarketLocation, context?.userData?._id]);

  // ✅ SIZE SELECT FIX
  const selectedSize = (item) => {
    if (item?.size) return item.size;
    if (item?.weight) return item.weight;
    if (item?.ram) return item.ram;
    return "";
  };

  // Calculate fees (rounded)
  const baseAfterDiscount = Math.max(cartSubTotal - (couponSummary?.discountAmount || 0), 0);
  const freeByRule = commerceSettings.freeShippingAbove > 0 && baseAfterDiscount >= commerceSettings.freeShippingAbove;
  
  // Cart page doesn't apply first order discount (only checkout does)
  // So we always show fees here (unless free by rule)
  const goMarketShippingFee = hasGoMarketItems ? Math.round(Number(commerceSettings.goMarketShippingFee || 0)) : 0;
  const goMarketBaseDeliveryFee = (hasGoMarketItems && !freeByRule) 
    ? Math.round(Number(commerceSettings.goMarketBaseDeliveryFee || 0)) 
    : 0;
  const goMarketDistanceDeliveryFee = (hasGoMarketItems && !freeByRule) 
    ? Math.round(Number((commerceSettings.goMarketDeliveryFeePerKm || 0) * goMarketDistanceKm)) 
    : 0;
  const goMarketDeliveryFee = goMarketBaseDeliveryFee + goMarketDistanceDeliveryFee;
  const standardShippingFee = hasNonGoMarketItems ? Math.round(Number(commerceSettings.shippingFee || 0)) : 0;
  const standardDeliveryFee = hasNonGoMarketItems ? Math.round(Number(commerceSettings.deliveryFee || 0)) : 0;
  const shippingFee = freeByRule ? 0 : goMarketShippingFee + standardShippingFee;
  const deliveryFee = freeByRule ? 0 : goMarketDeliveryFee + standardDeliveryFee;
  const totalAfterDiscount = baseAfterDiscount + shippingFee + deliveryFee;

  return (
    <section className="section py-4 lg:py-8 pb-10">
      <div className="container w-[80%] flex gap-5 flex-col lg:flex-row">

        {/* LEFT SIDE */}
        <div className="leftPart w-full lg:w-[70%]">
          <div className="shadow-md rounded-md bg-white p-4">
            <h2>Your Cart</h2>

            {context?.cartData?.length ? (
              context.cartData.map((item, index) => (
                <CartItems
                  key={index}
                  item={item}
                  qty={item.quantity}
                  selected={() => selectedSize(item)}
                  productSizeData={productSizeData}
                  productRamsData={productRamsData}
                  productWeightData={productWeightData}
                />
              ))
            ) : (
              <div className="text-center py-10">
                <h4>Your Cart is empty</h4>
                <Link to="/">
                  <Button className="btn-org mt-3">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="rightPart w-full lg:w-[30%]">
          <div className="shadow-md rounded-md bg-white p-5 sticky top-[155px]">

            <h3>Cart Totals</h3>
            <hr />

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
                        ? `${coupon.value}% off${coupon.maxDiscountAmount ? ` (upto ₹${coupon.maxDiscountAmount})` : ""}`
                        : `₹${coupon.value} off`;
                      
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
                                disabled={isDisabled || applyingCouponCode === coupon.code}
                                style={{ 
                                  fontSize: '11px', 
                                  padding: '4px 12px', 
                                  minWidth: 'auto',
                                  textTransform: 'none'
                                }}
                              >
                                {applyingCouponCode === coupon.code ? <CircularProgress size={12} color="inherit" /> : 'Apply'}
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
                  disabled={!!applyingCouponCode}
                >
                  {applyingCouponCode === couponInput.trim().toUpperCase() ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>

              {(couponSummary.message || couponMessage) && (
                <p className={`text-[13px] mt-2 ${couponSummary.isValid ? "text-green-600" : "text-red-500"}`}>
                  {couponSummary.message || couponMessage}
                </p>
              )}

              {appliedCoupon && (
                <Button size="small" onClick={removeCoupon}>
                  Remove coupon
                </Button>
              )}
            </div>

            <hr className="my-3" />

            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cartSubTotal}</span>
            </p>

            {couponSummary.discountAmount > 0 && (
              <p className="flex justify-between">
                <span>Discount</span>
                <span className="text-green-600">
                  -₹{couponSummary.discountAmount}
                </span>
              </p>
            )}

            <p className="flex justify-between">
              <span>Shipping Fee</span>
              <span className={shippingFee === 0 ? "text-green-600 font-[600]" : ""}>
                {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
              </span>
            </p>

            <p className="flex justify-between">
               <span>Delivery Fee{hasGoMarketItems && goMarketDistanceKm > 0 ? ` (${goMarketDistanceKm.toFixed(1)} km)` : ""}</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-[600]" : ""}>
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </span>
            </p>

            {freeByRule && commerceSettings.freeShippingAbove > 0 && (
              <p className="text-[12px] text-green-600 bg-green-50 p-2 rounded mt-2">
                🎉 You got FREE shipping & delivery!
              </p>
            )}

            <hr className="my-2" />

            <p className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{totalAfterDiscount}</span>
            </p>

            <br />

            <Link to="/checkout">
              <Button className="btn-org w-full flex gap-2">
                <BsFillBagCheckFill /> Checkout
              </Button>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;