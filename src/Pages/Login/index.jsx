import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";

// ─── Floating Label Input ─────────────────────────────────────────────────────
const FloatingInput = ({ label, type, name, value, onChange, disabled, prefix }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value?.length > 0;

  return (
    <div className="login-input-wrap">
      <div className={`login-input-inner ${focused ? "focused" : ""} ${disabled ? "disabled" : ""}`}>
        <label
          className={`login-float-label ${active ? "active" : ""} ${prefix && !active ? "with-prefix" : ""}`}
        >
          {label}
        </label>
        <div className="login-input-row">
          {prefix && <span className="login-prefix">{prefix}</span>}
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="login-input"
            autoComplete={name === "phone" ? "tel" : "off"}
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main Login Component ─────────────────────────────────────────────────────
const Login = () => {
  // Step: "phone" | "otp" | "name"
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [shake, setShake] = useState(false);

  const context = useAppContext();
  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem("accessToken");
    if (token) history("/");
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Step 1: Send OTP via our server (Fast2SMS)
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      context.alertBox("error", "❌ Please enter a valid 10-digit phone number");
      triggerShake();
      return;
    }

    setIsLoading(true);
    context.setGlobalLoading(true);

    try {
      const res = await postData("/api/user/login-phone-otp/send", { mobile: digits });

      if (res?.error === false) {
        setStep("otp");
        setResendTimer(60);
        context.alertBox("success", `✅ OTP sent to +91 ${digits}`);
      } else {
        context.alertBox("error", `❌ ${res?.message || "Failed to send OTP"}`);
        triggerShake();
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      context.alertBox("error", "❌ Failed to send OTP. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
      context.setGlobalLoading(false);
    }
  };

  // Step 2: Verify OTP via our server
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length < 6) {
      context.alertBox("error", "❌ Please enter the 6-digit OTP");
      triggerShake();
      return;
    }

    setIsLoading(true);
    context.setGlobalLoading(true);

    try {
      const digits = phone.replace(/\D/g, "");
      const res = await postData("/api/user/login-phone-otp/verify", {
        mobile: digits,
        otp: otp.trim(),
      });

      if (res?.error === false) {
        if (res?.needsName) {
          // New user - need name
          setStep("name");
          context.alertBox("success", "✅ Phone verified! Please enter your name.");
        } else {
          // Existing user - logged in
          localStorage.setItem("accessToken", res?.data?.accesstoken);
          localStorage.setItem("refreshToken", res?.data?.refreshToken);
          context.setIsLogin(true);
          context.alertBox("success", "✅ Welcome back!");
          setPhone(""); setOtp(""); setName(""); setStep("phone");
          setTimeout(() => history("/"), 800);
        }
      } else {
        context.alertBox("error", `❌ ${res?.message || "Invalid OTP"}`);
        triggerShake();
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      context.alertBox("error", "❌ Network error. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
      context.setGlobalLoading(false);
    }
  };

  // Step 3: Submit name for new user registration
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      context.alertBox("error", "❌ Please enter your name (minimum 2 characters)");
      triggerShake();
      return;
    }

    setIsLoading(true);
    context.setGlobalLoading(true);

    try {
      const digits = phone.replace(/\D/g, "");
      const res = await postData("/api/user/login-phone-otp/complete", {
        mobile: digits,
        name: name.trim(),
      });

      if (res?.error === false) {
        localStorage.setItem("accessToken", res?.data?.accesstoken);
        localStorage.setItem("refreshToken", res?.data?.refreshToken);
        context.setIsLogin(true);
        context.alertBox("success", `🎉 Welcome ${name.trim()}!`);
        setPhone(""); setOtp(""); setName(""); setStep("phone");
        setTimeout(() => history("/"), 800);
      } else {
        context.alertBox("error", `❌ ${res?.message || "Registration failed"}`);
        triggerShake();
      }
    } catch (err) {
      console.error("Name submit error:", err);
      context.alertBox("error", "❌ Network error. Please try again.");
      triggerShake();
    } finally {
      setIsLoading(false);
      context.setGlobalLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") { setStep("phone"); setOtp(""); }
    else if (step === "name") { setStep("otp"); setName(""); }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const digits = phone.replace(/\D/g, "");
      const res = await postData("/api/user/login-phone-otp/send", { mobile: digits });
      if (res?.error === false) {
        setOtp("");
        setResendTimer(60);
        context.alertBox("success", "✅ New OTP sent!");
      } else {
        context.alertBox("error", `❌ ${res?.message || "Failed to resend OTP"}`);
      }
    } catch (err) {
      context.alertBox("error", "❌ Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const getHeaderContent = () => {
    switch (step) {
      case "phone": return { title: "Welcome back", subtitle: "Enter your phone number to get started" };
      case "otp":   return { title: "Verify OTP 🔐", subtitle: `We sent a code to +91 ${phone}` };
      case "name":  return { title: "Almost there! 👋", subtitle: "Please tell us your name" };
    }
  };

  const headerContent = getHeaderContent();

  return (
    <>
      <style>{loginStyles}</style>

      <section className="login-section">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="login-container">
          <div className={`login-card ${shake ? "shake" : ""}`}>
            {/* Header */}
            <div className="login-header">
              <div className="login-logo">
                <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                  <rect width="40" height="40" rx="12" fill="url(#lg1)" />
                  <path d="M12 20 L20 12 L28 20 L20 28 Z" fill="white" opacity="0.9" />
                  <defs>
                    <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40">
                      <stop stopColor="#FF6B00" />
                      <stop offset="1" stopColor="#FF9500" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h2 className="login-title">{headerContent.title}</h2>
              <p className="login-subtitle">{headerContent.subtitle}</p>
            </div>

            {/* PHONE STEP */}
            {step === "phone" && (
              <form onSubmit={handlePhoneSubmit} className="login-form" noValidate>
                <FloatingInput
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  prefix="+91"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={isLoading}
                />

                <button type="submit" disabled={isLoading || phone.length < 10} className="btn-primary">
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <CircularProgress size={18} color="inherit" />
                      <span>Sending OTP...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Send OTP</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>

                <p className="login-footer-text">
                  We'll send a 6-digit verification code via SMS
                </p>
              </form>
            )}

            {/* OTP STEP */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="login-form" noValidate>
                <button type="button" className="back-btn" onClick={handleBack} disabled={isLoading}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <FloatingInput
                  label="Enter 6-digit OTP"
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isLoading}
                />

                <button type="submit" disabled={isLoading || otp.length < 6} className="btn-primary">
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <CircularProgress size={18} color="inherit" />
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Verify OTP</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>

                <p className="resend-text">
                  Didn't receive OTP?{" "}
                  {resendTimer > 0 ? (
                    <span style={{ color: "#9ca3af", fontWeight: 600 }}>Resend in {resendTimer}s</span>
                  ) : (
                    <button
                      type="button"
                      className="resend-link"
                      onClick={handleResendOtp}
                      disabled={isLoading || isResending}
                    >
                      {isResending ? "Sending..." : "Resend"}
                    </button>
                  )}
                </p>
              </form>
            )}

            {/* NAME STEP */}
            {step === "name" && (
              <form onSubmit={handleNameSubmit} className="login-form" noValidate>
                <button type="button" className="back-btn" onClick={handleBack} disabled={isLoading}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <FloatingInput
                  label="Your full name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />

                <button type="submit" disabled={isLoading || !name.trim()} className="btn-primary">
                  {isLoading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <CircularProgress size={18} color="inherit" />
                      <span>Completing...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Complete Registration</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .login-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafaf8;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 2rem 1rem;
  }

  /* Decorative blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%);
    top: -100px; right: -100px;
    animation: blobFloat 8s ease-in-out infinite alternate;
  }
  .blob-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, rgba(255,149,0,0.1) 0%, transparent 70%);
    bottom: -80px; left: -80px;
    animation: blobFloat 10s ease-in-out infinite alternate-reverse;
  }
  @keyframes blobFloat {
    from { transform: translate(0,0) scale(1); }
    to   { transform: translate(30px, 20px) scale(1.08); }
  }

  .login-container {
    width: 100%;
    max-width: 440px;
    position: relative;
    z-index: 1;
  }

  /* Card */
  .login-card {
    background: #ffffff;
    border-radius: 24px;
    padding: 2.5rem 2.5rem 2rem;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.05),
      0 4px 6px rgba(0,0,0,0.04),
      0 20px 40px rgba(0,0,0,0.08),
      0 40px 80px rgba(255,107,0,0.06);
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Shake */
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
  }
  .shake { animation: shake 0.45s ease; }

  /* Header */
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .login-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px; height: 56px;
    background: linear-gradient(135deg, #FF6B00, #FF9500);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(255,107,0,0.35);
    margin-bottom: 1rem;
    animation: logoBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
  }
  @keyframes logoBounce {
    from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
    to   { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  .login-title {
    font-size: 1.625rem;
    font-weight: 700;
    color: #0f0f0f;
    letter-spacing: -0.03em;
    margin: 0 0 0.25rem;
  }
  .login-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }

  /* Form */
  .login-form { display: flex; flex-direction: column; gap: 1rem; }

  /* Back button */
  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
    align-self: flex-start;
  }
  .back-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #374151;
  }
  .back-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Floating input */
  .login-input-wrap { position: relative; }
  .login-input-inner {
    position: relative;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    background: #fafafa;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    overflow: hidden;
  }
  .login-input-inner.focused {
    border-color: #FF6B00;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(255,107,0,0.12);
  }
  .login-input-inner.disabled { opacity: 0.6; pointer-events: none; }

  .login-float-label {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.9375rem;
    color: #9ca3af;
    pointer-events: none;
    transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    background: transparent;
    padding: 0 2px;
    font-family: inherit;
    z-index: 1;
  }
  /* When there's a +91 prefix and label is inactive, push label right so it
     doesn't sit on top of the prefix text */
  .login-float-label.with-prefix {
    left: 46px;
  }
  .login-float-label.active {
    top: 10px;
    left: 14px;
    transform: translateY(0);
    font-size: 0.72rem;
    color: #FF6B00;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .login-input-row {
    display: flex;
    align-items: center;
    padding: 24px 14px 8px;
    gap: 6px;
  }
  .login-prefix {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    flex-shrink: 0;
    padding-top: 2px;
  }
  .login-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.9375rem;
    color: #111827;
    font-family: inherit;
    font-weight: 500;
    min-width: 0;
  }

  /* Resend OTP */
  .resend-text {
    text-align: center;
    font-size: 0.8375rem;
    color: #6b7280;
    margin: 0;
  }
  .resend-link {
    color: #FF6B00;
    font-weight: 700;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    font-size: inherit;
    text-decoration: underline;
    transition: opacity 0.15s;
  }
  .resend-link:hover:not(:disabled) { opacity: 0.75; }
  .resend-link:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Primary button */
  .btn-primary {
    width: 100%;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #FF6B00 0%, #FF9500 100%);
    color: #fff;
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 700;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.15s;
    box-shadow: 0 4px 14px rgba(255,107,0,0.4), 0 1px 3px rgba(255,107,0,0.2);
    margin-top: 0.25rem;
    letter-spacing: 0.01em;
  }
  .btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,107,0,0.45), 0 2px 8px rgba(255,107,0,0.25);
  }
  .btn-primary:hover:not(:disabled)::before { opacity: 1; }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  /* Footer text */
  .login-footer-text {
    text-align: center;
    font-size: 0.8375rem;
    color: #6b7280;
    margin: 0.25rem 0 0;
  }
  .auth-link {
    color: #FF6B00;
    font-weight: 700;
    text-decoration: none;
    transition: opacity 0.15s;
  }
  .auth-link:hover { opacity: 0.75; }

  @media (max-width: 480px) {
    .login-card { padding: 2rem 1.5rem 1.75rem; border-radius: 20px; }
  }
`;

export default Login;