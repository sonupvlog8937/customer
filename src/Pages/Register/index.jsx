import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../hooks/useAppContext";
import { postData } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";

// ─── Floating Label Input ─────────────────────────────────────────────────────
const FloatingInput = ({ label, type, name, value, onChange, disabled, prefix }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value?.length > 0;
  return (
    <div
      className="reg-input-inner"
      style={{
        borderColor: focused ? "#FF6B00" : undefined,
        boxShadow: focused ? "0 0 0 3px rgba(255,107,0,0.12)" : undefined,
        background: focused ? "#fff" : undefined,
      }}
    >
      <label className={`reg-float-label${active ? " active" : ""}`}>{label}</label>
      <div className="reg-input-row">
        {prefix && <span className="reg-prefix">{prefix}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="reg-input"
          autoComplete={name === "phone" ? "tel" : name === "name" ? "name" : "off"}
        />
      </div>
    </div>
  );
};

// ─── Main Register Component ──────────────────────────────────────────────────
const Register = () => {
  // Steps: "form" | "otp"
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [shake, setShake] = useState(false);

  const otpInputsRef = useRef([]);

  const context = useAppContext();
  const history = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // Auto-focus first OTP input when step changes to "otp"
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputsRef.current[0]?.focus(), 200);
    }
  }, [step]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  // Step 1: Validate form and send OTP via server (Fast2SMS)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      context.alertBox("error", "❌ Please enter your full name");
      triggerShake();
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      context.alertBox("error", "❌ Please enter a valid 10-digit phone number");
      triggerShake();
      return;
    }

    setIsLoading(true);
    try {
      const res = await postData("/api/user/register-phone-otp/send", {
        mobile: digits,
        name: name.trim(),
      });

      if (res?.error === false) {
        setStep("otp");
        setResendTimer(60);
        
        // Show alert with attempts remaining info
        if (res?.attemptsRemaining !== undefined) {
          context.alertBox("success", `✅ OTP sent! ${res.attemptsRemaining} attempt(s) remaining`);
        } else {
          context.alertBox("success", `✅ OTP sent to +91 ${digits}`);
        }
      } else {
        // Handle rate limit or other errors
        if (res?.suspendedUntil) {
          const suspendedDate = new Date(res.suspendedUntil);
          const hours = Math.ceil((suspendedDate.getTime() - Date.now()) / (60 * 60 * 1000));
          context.alertBox("error", `🚫 Number suspended for ${hours} hours due to too many OTP requests`);
        } else {
          context.alertBox("error", `❌ ${res?.message || "Failed to send OTP"}`);
        }
        triggerShake();
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to send OTP. Please try again.";
      context.alertBox("error", `❌ ${errorMsg}`);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  // OTP box handlers
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpInputsRef.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) otpInputsRef.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      otpInputsRef.current[5]?.focus();
    }
  };

  const fullOtp = otp.join("");

  // Step 2: Verify OTP and register via server
  const handleVerifyOtp = async () => {
    if (fullOtp.length !== 6) {
      context.alertBox("error", "❌ Please enter the 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const digits = phone.replace(/\D/g, "");
      const res = await postData("/api/user/register-phone-otp/verify", {
        mobile: digits,
        otp: fullOtp,
        name: name.trim(),
      });

      if (res?.error === false) {
        localStorage.setItem("accessToken", res?.data?.accesstoken);
        localStorage.setItem("refreshToken", res?.data?.refreshToken);
        context.setIsLogin(true);
        context.alertBox("success", `🎉 Welcome ${name.trim()}! Account created.`);
        setTimeout(() => history("/"), 800);
      } else {
        context.alertBox("error", `❌ ${res?.message || "Registration failed"}`);
        setOtp(["", "", "", "", "", ""]);
        otpInputsRef.current[0]?.focus();
        triggerShake();
      }
    } catch (err) {
      console.error("Verify OTP error:", err);
      context.alertBox("error", "❌ Network error. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpInputsRef.current[0]?.focus();
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const digits = phone.replace(/\D/g, "");
      const res = await postData("/api/user/register-phone-otp/send", {
        mobile: digits,
        name: name.trim(),
      });
      
      if (res?.error === false) {
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(60);
        otpInputsRef.current[0]?.focus();
        
        // Show alert with attempts remaining info
        if (res?.attemptsRemaining !== undefined) {
          context.alertBox("success", `✅ New OTP sent! ${res.attemptsRemaining} attempt(s) remaining`);
        } else {
          context.alertBox("success", "✅ New OTP sent!");
        }
      } else {
        // Handle rate limit or other errors
        if (res?.suspendedUntil) {
          const suspendedDate = new Date(res.suspendedUntil);
          const hours = Math.ceil((suspendedDate.getTime() - Date.now()) / (60 * 60 * 1000));
          context.alertBox("error", `🚫 Number suspended for ${hours} hours due to too many OTP requests`);
        } else {
          context.alertBox("error", `❌ ${res?.message || "Failed to resend OTP"}`);
        }
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to resend OTP.";
      context.alertBox("error", `❌ ${errorMsg}`);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <style>{registerStyles}</style>

      <section className="reg-section">
        <div className="blob blob-1" />
        <div className="blob blob-2" />

        <div className="reg-container">
          {/* ── FORM STEP ── */}
          {step === "form" && (
            <div className={`reg-card ${shake ? "shake" : ""}`}>
              <div className="reg-header">
                <div className="reg-logo">
                  <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
                    <rect width="40" height="40" rx="12" fill="url(#rg1)" />
                    <path d="M13 20 Q20 10 27 20 Q20 30 13 20Z" fill="white" opacity="0.9" />
                    <defs>
                      <linearGradient id="rg1" x1="0" y1="0" x2="40" y2="40">
                        <stop stopColor="#FF6B00" />
                        <stop offset="1" stopColor="#FF9500" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <h2 className="reg-title">Create account</h2>
                <p className="reg-subtitle">Join us — it's completely free</p>
              </div>

              <form onSubmit={handleSendOtp} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Name */}
                <FloatingInput
                  label="Full Name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />

                {/* Phone */}
                <FloatingInput
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  prefix="+91"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={isLoading}
                />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !name.trim() || phone.length < 10}
                  className="btn-primary"
                >
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

                {/* Login link */}
                <p className="reg-footer-text">
                  Already have an account?{" "}
                  <Link to="/login" className="auth-link">Sign in →</Link>
                </p>
              </form>
            </div>
          )}

          {/* ── OTP STEP ── */}
          {step === "otp" && (
            <div className={`reg-card otp-card ${shake ? "shake" : ""}`}>
              <button className="back-btn" onClick={() => { setStep("form"); setOtp(["","","","","",""]); }} disabled={isLoading}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </button>

              <div className="otp-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth={1.5} className="otp-icon-svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>

              <h3 className="reg-title">Verify your phone</h3>
              <p className="reg-subtitle">
                We sent a 6-digit code to<br />
                <strong className="otp-phone">+91 {phone}</strong>
              </p>

              {/* 6-box OTP input */}
              <div className="otp-boxes" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className={`otp-box ${digit ? "filled" : ""}`}
                    disabled={isLoading}
                  />
                ))}
              </div>

              <button
                className="btn-primary"
                disabled={isLoading || fullOtp.length !== 6}
                onClick={handleVerifyOtp}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <CircularProgress size={18} color="inherit" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  "Verify & Create Account"
                )}
              </button>

              <p className="otp-resend-text">
                Didn't get it?{" "}
                {resendTimer > 0 ? (
                  <span className="otp-timer">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={handleResend}
                    disabled={isResending}
                  >
                    {isResending ? "Sending..." : "Resend code"}
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const registerStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .reg-section {
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
    to   { transform: translate(30px,20px) scale(1.08); }
  }

  .reg-container {
    width: 100%;
    max-width: 440px;
    position: relative;
    z-index: 1;
  }

  .reg-card {
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
  .otp-card { text-align: center; }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-8px); }
    40%      { transform: translateX(8px); }
    60%      { transform: translateX(-5px); }
    80%      { transform: translateX(5px); }
  }
  .shake { animation: shake 0.45s ease; }

  .reg-header { text-align: center; margin-bottom: 2rem; }
  .reg-logo {
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
  .reg-title {
    font-size: 1.625rem;
    font-weight: 700;
    color: #0f0f0f;
    letter-spacing: -0.03em;
    margin: 0 0 0.25rem;
  }
  .reg-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.6;
  }

  /* Floating Input */
  .reg-input-inner {
    position: relative;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    background: #fafafa;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    overflow: hidden;
  }
  .reg-float-label {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.9375rem;
    color: #9ca3af;
    pointer-events: none;
    transition: all 0.18s cubic-bezier(0.4,0,0.2,1);
    font-family: inherit;
    z-index: 1;
  }
  .reg-float-label.active {
    top: 10px;
    transform: translateY(0);
    font-size: 0.72rem;
    color: #FF6B00;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .reg-input-row {
    display: flex;
    align-items: center;
    padding: 24px 14px 8px;
    gap: 6px;
  }
  .reg-prefix {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    flex-shrink: 0;
    padding-top: 2px;
  }
  .reg-input {
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
    margin-bottom: 1.25rem;
  }
  .back-btn:hover:not(:disabled) { background: #f9fafb; border-color: #d1d5db; color: #374151; }
  .back-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* OTP phone icon */
  .otp-icon-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px; height: 64px;
    background: rgba(255,107,0,0.08);
    border-radius: 20px;
    margin-bottom: 1rem;
  }
  .otp-icon-svg { width: 32px; height: 32px; }

  .otp-phone {
    color: #0f0f0f;
    font-weight: 700;
  }

  /* OTP box inputs */
  .otp-boxes {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin: 1.5rem 0;
  }
  .otp-box {
    width: 48px; height: 56px;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    text-align: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
    font-family: inherit;
    background: #fafafa;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    cursor: text;
    caret-color: #FF6B00;
  }
  .otp-box:focus {
    border-color: #FF6B00;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(255,107,0,0.12);
  }
  .otp-box.filled {
    border-color: #FF6B00;
    background: rgba(255,107,0,0.04);
  }

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
  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255,107,0,0.45), 0 2px 8px rgba(255,107,0,0.25);
  }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; transform: none; }
  .btn-content { display: flex; align-items: center; justify-content: center; gap: 8px; }

  /* Resend */
  .otp-resend-text {
    text-align: center;
    font-size: 0.8375rem;
    color: #6b7280;
    margin: 1rem 0 0;
  }
  .otp-timer { color: #9ca3af; font-weight: 600; }
  .resend-btn {
    color: #FF6B00;
    font-weight: 700;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
    font-size: inherit;
    text-decoration: underline;
  }
  .resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Footer */
  .reg-footer-text {
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
    .reg-card { padding: 2rem 1.5rem 1.75rem; border-radius: 20px; }
    .otp-box { width: 42px; height: 50px; font-size: 1.1rem; }
  }
`;

export default Register;