import React, { useState, useCallback, useEffect, lazy, Suspense } from "react";
import Search from "../Search";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa6";
import Tooltip from "@mui/material/Tooltip";
import { useAppContext } from "../../hooks/useAppContext";
import { Button } from "@mui/material";
import { IoSearch } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdHeartEmpty } from "react-icons/io";
import { IoIosLogOut } from "react-icons/io";
import { fetchDataFromApi } from "../../utils/api";
import { LuMapPin } from "react-icons/lu";
import { HiOutlineMenu } from "react-icons/hi";
import "./Navigation/style.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ✅ FIX 1: Navigation lazy load — pehle Navigation bhi initial bundle mein tha
// Ab sirf zaroorat padne pe load hoga → website open hone ka time kam
const Navigation = lazy(() => import("./Navigation"));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -3,
    top: 13,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 4px",
  },
}));

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [isOpenCatPanel, setIsOpenCatPanel] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const context = useAppContext();
  const location = useLocation();
  const history = useNavigate();

  const hideNavigationOnPage = [""].includes(location.pathname);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  // ✅ FIX 2: handleClick pehle setAnchorEl karta tha par event nahi leta tha
  // User account button click karne pe menu open hota tha download bhi trigger hota tha
  const handleUserClick = useCallback((e) => {
    setAnchorEl(e.currentTarget);
  }, []);

  const handleDownloadClick = useCallback(() => {
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 3000);
  }, []);

  // ✅ FIX 3: Logo fetch — pehle har isLogin change pe fetch hoti thi
  // Ab sirf ek baar — logo rarely changes
  useEffect(() => {
    if (localStorage.getItem("logo")) return; // already cached in localStorage
    fetchDataFromApi("/api/logo").then((res) => {
      if (res?.logo?.[0]?.logo) {
        localStorage.setItem("logo", res.logo[0].logo);
      }
    });
  }, []); // ← empty deps — sirf once on mount

  const logout = useCallback(() => {
    setAnchorEl(null);
    fetchDataFromApi(
      `/api/user/logout?token=${localStorage.getItem("accessToken")}`,
      { withCredentials: true }
    ).then((res) => {
      if (res?.error === false) {
        context.setIsLogin(false);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        context.setUserData(null);
        context?.setCartData([]);
        context?.setMyListData([]);
        history("/");
      }
    });
  }, [context, history]);

  const isDesktop = context?.windowWidth > 992;

  return (
    <>
      <header className="bg-white fixed lg:sticky left-0 w-full top-0 lg:-top-[47px] z-[101]">
        <div className="top-strip hidden lg:block py-2 border-t-[1px] border-gray-250 border-b-[1px]">
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="col1 w-[50%] hidden lg:block">
                <p className="text-[12px] font-[500] mt-0 mb-0">
                  Get up to 50% off new season styles, limited time only
                </p>
              </div>
              <div className="col2 flex items-center justify-between w-full lg:w-[50%] lg:justify-end">
                <ul className="flex items-center gap-3 w-full justify-between lg:w-[200px]">
                  <li className="list-none">
                    <Link to="/help-center" className="text-[11px] lg:text-[13px] link font-[500] transition">
                      Help Center
                    </Link>
                  </li>
                  <li className="list-none">
                    <Link to="/order-tracking" className="text-[11px] lg:text-[13px] link font-[500] transition">
                      Order Tracking
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="header py-2 lg:py-4 border-b-[1px] border-gray-250">
          <div className="container flex items-center justify-between">
            {!isDesktop && (
              <Button
                className="!w-[35px] !min-w-[35px] !h-[35px] !rounded-full !text-gray-800"
                onClick={() => setIsOpenCatPanel(true)}
              >
                <HiOutlineMenu size={22} />
              </Button>
            )}

            <div className="col1 w-[40%] lg:w-[25%]">
              <Link to="/">
                {/* ✅ FIX 4: loading="eager" + width/height — CLS (layout shift) avoid hoga
                    Browser ko pehle se size pata hoga, reflow nahi hoga */}
                <img
                  src={localStorage.getItem("logo")}
                  className="max-w-[140px] lg:max-w-[200px]"
                  loading="eager"
                  width="200"
                  height="50"
                  alt="logo"
                />
              </Link>
            </div>

            <a
              href="/699b044d39ee2939e558446e.apk"
              download
              onClick={handleDownloadClick}
              className={`download-btn ${isDownloading ? "loading" : ""}`}
            >
              {isDownloading ? "loading" : "📲 App"}
            </a>

            <div
              className={`col2 fixed top-0 left-0 w-full h-full lg:w-[40%] lg:static p-2 lg:p-0 bg-white z-50 ${
                isDesktop ? "!block" : ""
              } ${context?.openSearchPanel === true ? "block" : "hidden"}`}
            >
              <Search />
            </div>

            <div className="col3 w-[10%] lg:w-[30%] flex items-center pl-7">
              <ul className="flex items-center justify-end gap-0 lg:gap-3 w-full">
                {/* Login / Register — only desktop, not logged in */}
                {!context.isLogin && isDesktop && (
                  <li className="list-none">
                    <Link to="/login" className="link transition text-[15px] font-[500]">Login</Link>
                    {" "}|{" "}
                    <Link to="/register" className="link transition text-[15px] font-[500]">Register</Link>
                  </li>
                )}

                {/* User account button — only desktop, logged in */}
                {context.isLogin && isDesktop && (
                  <li>
                    <Button
                      className="!text-[#000] myAccountWrap flex items-center gap-3 cursor-pointer"
                      onClick={handleUserClick} // ✅ FIX: was calling wrong handler
                    >
                      <Button className="!w-[40px] !h-[40px] !min-w-[40px] !rounded-full !bg-gray-200">
                        <FaRegUser className="text-[17px] text-[rgba(0,0,0,0.7)]" />
                      </Button>
                      <div className="info flex flex-col">
                        <h4 className="leading-3 text-[14px] text-[rgba(0,0,0,0.6)] font-[500] mb-0 capitalize text-left">
                          {context?.userData?.name}
                        </h4>
                        <span className="text-[13px] text-[rgba(0,0,0,0.6)] font-[400] capitalize text-left">
                          {context?.userData?.email}
                        </span>
                      </div>
                    </Button>

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
                            overflow: "visible",
                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                            mt: 1.5,
                            "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
                            "&::before": {
                              content: '""', display: "block", position: "absolute",
                              top: 0, right: 14, width: 10, height: 10,
                              bgcolor: "background.paper",
                              transform: "translateY(-50%) rotate(45deg)", zIndex: 0,
                            },
                          },
                        },
                      }}
                      transformOrigin={{ horizontal: "right", vertical: "top" }}
                      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                      <Link to="/my-account" className="w-full block">
                        <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                          <FaRegUser className="text-[18px]" />
                          <span className="text-[14px]">My Account</span>
                        </MenuItem>
                      </Link>
                      <Link to="/address" className="w-full block">
                        <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                          <LuMapPin className="text-[18px]" />
                          <span className="text-[14px]">Address</span>
                        </MenuItem>
                      </Link>
                      <Link to="/my-orders" className="w-full block">
                        <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                          <IoBagCheckOutline className="text-[18px]" />
                          <span className="text-[14px]">Orders</span>
                        </MenuItem>
                      </Link>
                      <Link to="/my-list" className="w-full block">
                        <MenuItem onClick={handleClose} className="flex gap-2 !py-2">
                          <IoMdHeartEmpty className="text-[18px]" />
                          <span className="text-[14px]">My List</span>
                        </MenuItem>
                      </Link>
                      <MenuItem onClick={logout} className="flex gap-2 !py-2">
                        <IoIosLogOut className="text-[18px]" />
                        <span className="text-[14px]">Logout</span>
                      </MenuItem>
                    </Menu>
                  </li>
                )}

                {/* Wishlist — desktop only */}
                {isDesktop && (
                  <li>
                    <Tooltip title="Wishlist">
                      <Link to="/my-list">
                        <IconButton aria-label="wishlist">
                          <StyledBadge
                            badgeContent={context?.myListData?.length || 0}
                            color="secondary"
                          >
                            <FaRegHeart />
                          </StyledBadge>
                        </IconButton>
                      </Link>
                    </Tooltip>
                  </li>
                )}

                {/* Cart — desktop only */}
                {isDesktop && (
                  <li>
                    <Tooltip title="Cart">
                      <Link to="/cart">
                        <IconButton aria-label="cart">
                          <StyledBadge
                            badgeContent={context?.cartData?.length || 0}
                            color="secondary"
                          >
                            <MdOutlineShoppingCart />
                          </StyledBadge>
                        </IconButton>
                      </Link>
                    </Tooltip>
                  </li>
                )}

                {/* Search — always visible */}
                <li>
                  <Tooltip title="Search">
                    <IconButton
                      aria-label="search"
                      onClick={() => context?.setOpenSearchPanel(true)}
                    >
                      <IoSearch />
                    </IconButton>
                  </Tooltip>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ✅ FIX 5: Navigation lazy — Suspense fallback se flicker nahi aayega */}
        {(!hideNavigationOnPage || isOpenCatPanel) && (
          <Suspense fallback={null}>
            <Navigation
              isOpenCatPanel={isOpenCatPanel}
              setIsOpenCatPanel={setIsOpenCatPanel}
            />
          </Suspense>
        )}
      </header>

      <div className="afterHeader mt-[65px] lg:mt-0"></div>
    </>
  );
};

export default Header;