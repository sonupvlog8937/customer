import React, { lazy, Suspense, useCallback } from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { PiKeyReturnLight } from "react-icons/pi";
import { BsWallet2 } from "react-icons/bs";
import { LiaGiftSolid } from "react-icons/lia";
import { BiSupport } from "react-icons/bi";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FaFacebookF } from "react-icons/fa";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaPinterestP } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import Drawer from "@mui/material/Drawer";
import { useAppContext } from "../../hooks/useAppContext";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { IoCloseSharp } from "react-icons/io5";

// ✅ FIX 1: Heavy components lazy load — CartPanel, AddAddress, ProductZoom,
//    ProductDetailsComponent pehle initial bundle mein the.
//    Ab sirf Drawer/Dialog OPEN hone pe load honge — initial load fast hoga.
const CartPanel           = lazy(() => import("../CartPanel"));
const AddAddress          = lazy(() => import("../../Pages/MyAccount/addAddress"));
const ProductZoom         = lazy(() => import("../ProductZoom").then(m => ({ default: m.ProductZoom })));
const ProductDetailsComponent = lazy(() =>
  import("../ProductDetails").then(m => ({ default: m.ProductDetailsComponent }))
);

// ✅ FIX 2: Payment images lazy load — ye images below-the-fold hain,
//    loading="lazy" se initial page load pe bandwidth waste nahi hogi
const PaymentImages = () => (
  <div className="flex items-center gap-1">
    <img src="/carte_bleue.png"     alt="Carte Bleue"       loading="lazy" width="40" height="25" />
    <img src="/visa.png"            alt="Visa"              loading="lazy" width="40" height="25" />
    <img src="/master_card.png"     alt="Mastercard"        loading="lazy" width="40" height="25" />
    <img src="/american_express.png" alt="American Express" loading="lazy" width="40" height="25" />
    <img src="/paypal.png"          alt="PayPal"            loading="lazy" width="40" height="25" />
  </div>
);

const Footer = () => {
  const context = useAppContext();

  // ✅ FIX 3: toggleCartPanel / toggleAddressPanel — pehle inline arrow function thi
  //    jo har render pe naya function banata tha. useCallback se stable reference milegi.
  const handleCartClose    = useCallback(context.toggleCartPanel(false),    []);
  const handleAddressClose = useCallback(context.toggleAddressPanel(false), []);

  return (
    <>
      <footer className="py-6 bg-[#fafafa]">
        <div className="container">
          <div className="flex items-center justify-center gap-2 py-3 lg:py-8 pb-0 lg:pb-8 px-0 lg:px-5 scrollableBox footerBoxWrap">
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaShippingFastSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Free Shipping</h3>
              <p className="text-[12px] font-[500]">For all Orders Over ₹100</p>
            </div>
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <PiKeyReturnLight className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">30 Days Returns</h3>
              <p className="text-[12px] font-[500]">For an Exchange Product</p>
            </div>
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BsWallet2 className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Secured Payment</h3>
              <p className="text-[12px] font-[500]">Payment Cards Accepted</p>
            </div>
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <LiaGiftSolid className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Special Gifts</h3>
              <p className="text-[12px] font-[500]">Our First Product Order</p>
            </div>
            <div className="col flex items-center justify-center flex-col group w-[15%]">
              <BiSupport className="text-[40px] transition-all duration-300 group-hover:text-primary group-hover:-translate-y-1" />
              <h3 className="text-[16px] font-[600] mt-3">Support 24/7</h3>
              <p className="text-[12px] font-[500]">Contact us Anytime</p>
            </div>
          </div>
          <br />
          <hr />

          <div className="footer flex px-3 lg:px-0 flex-col lg:flex-row py-8">
            <div className="part1 w-full lg:w-[25%] border-r border-[rgba(0,0,0,0.1)]">
              <h2 className="text-[18px] font-[600] mb-4">Contact us</h2>
              <p className="text-[13px] font-[400] pb-4">
                Zeedaddy - Mega Super Store<br />
                Makhdumpur, Jehnabad, Bihar (India) 804424
              </p>
              <Link className="link text-[13px]" to="sonuee15@gmail.com">
                sonuee15@gmail.com
              </Link>
              <span className="text-[22px] font-[600] block w-full mt-3 mb-5 text-primary">
                (+91) 8969737537
              </span>
              <div className="flex items-center gap-2">
                <IoChatboxOutline className="text-[40px] text-primary" />
                <span className="text-[16px] font-[600]">Online Chat<br />Get Expert Help</span>
              </div>
            </div>

            <div className="part2 w-full lg:w-[40%] flex pl-0 lg:pl-8 mt-5 lg:mt-0">
              <div className="part2_col1 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Products</h2>
                <ul className="list">
                  {["Prices drop","New products","Best sales","Contact us","Sitemap","Stores"].map(t => (
                    <li key={t} className="list-none text-[14px] w-full mb-2">
                      <Link to="/" className="link">{t}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="part2_col2 w-[50%]">
                <h2 className="text-[18px] font-[600] mb-4">Our company</h2>
                <ul className="list">
                  {["Delivery","Legal Notice","Terms and conditions of use","About us","Secure payment","Login"].map(t => (
                    <li key={t} className="list-none text-[14px] w-full mb-2">
                      <Link to="/" className="link">{t}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="part2 w-full lg:w-[35%] flex pl-0 lg:pl-8 flex-col pr-8 mt-5 lg:mt-0">
              <h2 className="text-[18px] font-[600] mb-2 lg:mb-4">Subscribe to newsletter</h2>
              <p className="text-[13px]">
                Subscribe to our latest newsletter to get news about special discounts.
              </p>
              <form className="mt-5">
                <input
                  type="email"
                  className="w-full h-[45px] border outline-none pl-4 pr-4 rounded-sm mb-4 focus:border-[rgba(0,0,0,0.3)]"
                  placeholder="Your Email Address"
                />
                <Button className="btn-org">SUBSCRIBE</Button>
                <FormControlLabel
                  className="mt-3 lg:mt-0 block w-full"
                  control={<Checkbox />}
                  label="I agree to the terms and conditions and the privacy policy"
                />
              </form>
            </div>
          </div>
        </div>
      </footer>

      <div className="bottomStrip border-t border-[rgba(0,0,0,0.1)] pt-3 pb-[100px] lg:pb-3 bg-white">
        <div className="container flex items-center justify-between flex-col lg:flex-row gap-4 lg:gap-0">
          <ul className="flex items-center gap-2">
            {[
              { Icon: FaFacebookF,    size: "text-[17px]" },
              { Icon: AiOutlineYoutube, size: "text-[21px]" },
              { Icon: FaPinterestP,   size: "text-[17px]" },
              { Icon: FaInstagram,    size: "text-[17px]" },
            ].map(({ Icon, size }, i) => (
              <li key={i} className="list-none">
                <Link
                  to="/"
                  target="_blank"
                  className="w-[35px] h-[35px] rounded-full border border-[rgba(0,0,0,0.1)] flex items-center justify-center group hover:bg-primary transition-all"
                >
                  <Icon className={`${size} group-hover:text-white`} />
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-[13px] text-center mb-0">© 2026 - Zeedaddy Online Shopping App</p>

          <PaymentImages />
        </div>
      </div>

      {/* ── Cart Panel ── */}
      <Drawer
        open={context.openCartPanel}
        onClose={handleCartClose}
        anchor="right"
        className="cartPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>Shopping Cart ({context?.cartData?.length})</h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={handleCartClose} />
        </div>

        {/* ✅ FIX 1: CartPanel lazy loaded inside Suspense */}
        <Suspense fallback={<div className="flex justify-center pt-10"><span>Loading…</span></div>}>
          {context?.cartData?.length !== 0 ? (
            <CartPanel data={context?.cartData} />
          ) : (
            <div className="flex items-center justify-center flex-col pt-[100px] gap-5">
              <img src="/empty-cart.png" className="w-[150px]" loading="lazy" alt="empty cart" />
              <h4>Your Cart is currently empty</h4>
              <Button className="btn-org btn-sm" onClick={handleCartClose}>
                Continue Shopping
              </Button>
            </div>
          )}
        </Suspense>
      </Drawer>

      {/* ── Address Panel ── */}
      <Drawer
        open={context.openAddressPanel}
        onClose={handleAddressClose}
        anchor="right"
        className="addressPanel"
      >
        <div className="flex items-center justify-between py-3 px-4 gap-3 border-b border-[rgba(0,0,0,0.1)] overflow-hidden">
          <h4>{context?.addressMode === "add" ? "Add" : "Edit"} Delivery Address</h4>
          <IoCloseSharp className="text-[20px] cursor-pointer" onClick={handleAddressClose} />
        </div>
        <div className="w-full max-h-[100vh] overflow-auto">
          {/* ✅ FIX 1: AddAddress lazy loaded inside Suspense */}
          <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
            {context.openAddressPanel && <AddAddress />}
          </Suspense>
        </div>
      </Drawer>

      {/* ── Product Details Modal ── */}
      <Dialog
        open={context?.openProductDetailsModal?.open}
        fullWidth={context?.fullWidth}
        maxWidth={context?.maxWidth}
        onClose={context?.handleCloseProductDetailsModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="productDetailsModal"
      >
        <DialogContent>
          <div className="flex items-center w-full productDetailsModalContainer relative">
            <Button
              className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !text-[#000] !absolute top-[15px] right-[15px] !bg-[#f1f1f1]"
              onClick={context?.handleCloseProductDetailsModal}
            >
              <IoCloseSharp className="text-[20px]" />
            </Button>

            {/* ✅ FIX 1: ProductZoom + ProductDetailsComponent lazy inside Suspense */}
            {context?.openProductDetailsModal?.item && (
              <Suspense fallback={<div className="p-16 text-center w-full">Loading…</div>}>
                <div className="col1 w-[40%] px-3 py-8">
                  <ProductZoom images={context?.openProductDetailsModal?.item?.images} />
                </div>
                <div className="col2 w-[60%] py-8 px-8 pr-16 productContent">
                  <ProductDetailsComponent item={context?.openProductDetailsModal?.item} />
                </div>
              </Suspense>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Footer;