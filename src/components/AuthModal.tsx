import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { apiService, type User } from "../services/api";
import { auth } from "../firebase";
import {
  signInWithCredential,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { X } from "lucide-react";
import loginBg from "../assets/images/Pricing_BG.jpg";
import CtaButton from "./CtaButton";
interface AuthModalProps {
  onClose: () => void;
  onSuccess?: (user: User) => void;
}

type AuthMode = "login" | "register" | "otp" | "forgot-password";

const AuthModal = ({ onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    full_name: "",
    mobile_number: "",
  });
  const [otpForm, setOtpForm] = useState({ email: "", otp: "" });
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
    otp: "",
  });
  const [otpError, setOtpError] = useState("");

  // Additional UI & validation states
  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "request" | "verify"
  >("request");
  const [showMobilePopup, setShowMobilePopup] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileNumberError, setMobileNumberError] = useState("");
  const [savingMobile, setSavingMobile] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState<User | null>(null);

  // Validation errors for forms
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [registerErrors, setRegisterErrors] = useState<{
    email?: string;
    password?: string;
    full_name?: string;
    mobile_number?: string;
  }>({});

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);
  const registerFullNameRef = useRef<HTMLInputElement | null>(null);
  const registerEmailRef = useRef<HTMLInputElement | null>(null);
  const registerPasswordRef = useRef<HTMLInputElement | null>(null);
  const registerMobileRef = useRef<HTMLInputElement | null>(null);
  const isProcessingRef = useRef(false);
  const initializedRef = useRef(false);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);
  const registrationPasswordRef = useRef<string>("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
  }, [onSuccess, onClose]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateLogin = (): boolean => {
    // Sequential validation: show only the first invalid field's error
    const errors: { email?: string; password?: string } = {};

    if (!loginForm.email.trim()) {
      errors.email = "This field is required";
      setLoginErrors(errors);
      loginEmailRef.current?.focus();
      loginEmailRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
      return false;
    }

    if (!validateEmail(loginForm.email)) {
      errors.email = "Please enter a valid email address";
      setLoginErrors(errors);
      loginEmailRef.current?.focus();
      loginEmailRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
      return false;
    }

    if (!loginForm.password) {
      errors.password = "This field is required";
      setLoginErrors(errors);
      loginPasswordRef.current?.focus();
      loginPasswordRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
      return false;
    }

    if (!validatePassword(loginForm.password)) {
      errors.password = "Password must be at least 6 characters";
      setLoginErrors(errors);
      loginPasswordRef.current?.focus();
      loginPasswordRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
      return false;
    }

    setLoginErrors({});
    return true;
  };

  const validateMobileNumber = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile.replace(/\s+/g, ""));
  };

  const validateRegister = (): boolean => {
    const errors: {
      full_name?: string;
      email?: string;
      password?: string;
      mobile_number?: string;
    } = {};

    if (!registerForm.full_name.trim()) {
      errors.full_name = "This field is required";
      setRegisterErrors(errors);
      registerFullNameRef.current?.focus();
      return false;
    }

    if (!registerForm.email.trim()) {
      errors.email = "This field is required";
      setRegisterErrors(errors);
      registerEmailRef.current?.focus();
      return false;
    }

    if (!validateEmail(registerForm.email)) {
      errors.email = "Please enter a valid email address";
      setRegisterErrors(errors);
      registerEmailRef.current?.focus();
      return false;
    }

    if (!registerForm.password) {
      errors.password = "This field is required";
      setRegisterErrors(errors);
      registerPasswordRef.current?.focus();
      return false;
    }

    if (!validatePassword(registerForm.password)) {
      errors.password = "Password must be at least 6 characters";
      setRegisterErrors(errors);
      registerPasswordRef.current?.focus();
      return false;
    }

    if (!registerForm.mobile_number.trim()) {
      errors.mobile_number = "This field is required";
      setRegisterErrors(errors);
      registerMobileRef.current?.focus();
      return false;
    }

    if (!validateMobileNumber(registerForm.mobile_number)) {
      errors.mobile_number = "Please enter a valid 10-digit mobile number";
      setRegisterErrors(errors);
      registerMobileRef.current?.focus();
      return false;
    }

    setRegisterErrors({});
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateLogin()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      if (response.status && response.user) {
        setSuccessMessage(response.message || "Login successful!");

        try {
          const profileResponse = await apiService.getProfile(
            response.user.id.toString(),
          );
          if (profileResponse.status && profileResponse.user) {
            const userData: User = {
              ...response.user,
              ...profileResponse.user,
              avatar:
                response.user.avatar ||
                response.user.picture ||
                profileResponse.user.picture,
            };
            setTimeout(() => {
              onSuccessRef.current?.(userData);
              onCloseRef.current();
            }, 1500);
          } else {
            const userData: User = {
              ...response.user,
              avatar: response.user.avatar || response.user.picture,
            };
            setTimeout(() => {
              onSuccessRef.current?.(userData);
              onCloseRef.current();
            }, 1500);
          }
        } catch (profileErr: any) {
          const userData: User = {
            ...response.user,
            avatar: response.user.avatar || response.user.picture,
          };
          setTimeout(() => {
            onSuccessRef.current?.(userData);
            onCloseRef.current();
          }, 1500);
        }
      } else {
        setError(response.message || "Invalid email or password");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!validateRegister()) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.register({
        email: registerForm.email.trim(),
        password: registerForm.password,
        full_name: registerForm.full_name.trim(),
        mobile_number: registerForm.mobile_number.trim().replace(/\s+/g, ""),
      });

      if (response.status && response.user) {
        registrationPasswordRef.current = registerForm.password;
        setSuccessMessage(
          response.message ||
            "Registration successful! Please verify your email.",
        );
        setOtpForm({ ...otpForm, email: registerForm.email.trim() });
        setTimeout(() => {
          setMode("otp");
          setSuccessMessage("");
        }, 1500);
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setSuccessMessage("");

    if (!otpForm.otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    if (otpForm.otp.length !== 6) {
      setOtpError("OTP must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyOtp({
        email: otpForm.email,
        otp: otpForm.otp.trim(),
      });

      if (response.status && response.user) {
        const message = response.credits_added
          ? `${response.message} You received ${response.credits_added} credits as a signup bonus!`
          : response.message;
        setSuccessMessage(message || "Email verified successfully!");

        const password =
          registrationPasswordRef.current || registerForm.password;
        if (otpForm.email && password) {
          try {
            await createUserWithEmailAndPassword(
              auth,
              otpForm.email.trim(),
              password,
            );
          } catch (firebaseErr: any) {
            console.log(
              "Firebase user creation after OTP:",
              firebaseErr.code || firebaseErr.message,
            );
          } finally {
            registrationPasswordRef.current = "";
          }
        }

        try {
          const profileResponse = await apiService.getProfile(
            response.user.id.toString(),
          );
          if (profileResponse.status && profileResponse.user) {
            const userData: User = {
              ...response.user,
              ...profileResponse.user,
              avatar:
                response.user.avatar ||
                response.user.picture ||
                profileResponse.user.picture,
            };
            setTimeout(() => {
              onSuccessRef.current?.(userData);
              onCloseRef.current();
            }, 1500);
          } else {
            const userData: User = {
              ...response.user,
              avatar: response.user.avatar || response.user.picture,
            };
            setTimeout(() => {
              onSuccessRef.current?.(userData);
              onCloseRef.current();
            }, 1500);
          }
        } catch (profileErr: any) {
          const userData: User = {
            ...response.user,
            avatar: response.user.avatar || response.user.picture,
          };
          setTimeout(() => {
            onSuccessRef.current?.(userData);
            onCloseRef.current();
          }, 1500);
        }
      } else {
        setOtpError(
          response.message || "Invalid OTP code. Please check and try again.",
        );
      }
    } catch (err: any) {
      setOtpError(
        err.response?.data?.message ||
          err.message ||
          "OTP verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const initGoogleAuth = async () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return;
      }

      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Failed to load Google script"));
          setTimeout(
            () => reject(new Error("Timeout loading Google script")),
            10000,
          );
        });
      }

      if (window.google && googleButtonRef.current && !initializedRef.current) {
        initializedRef.current = true;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            if (isProcessingRef.current) {
              return;
            }

            isProcessingRef.current = true;

            try {
              const payload = JSON.parse(
                atob(response.credential.split(".")[1]),
              );
              const idToken = response.credential;

              if (idToken && idToken.length > 0) {
                try {
                  const credential = GoogleAuthProvider.credential(idToken);
                  const userCredential = await signInWithCredential(
                    auth,
                    credential,
                  );
                  console.log(
                    "✅ Firebase sign-in successful:",
                    userCredential.user?.email,
                  );
                } catch (firebaseErr: any) {
                  console.error(
                    "Firebase sign-in error:",
                    firebaseErr.code || firebaseErr.message,
                  );
                }
              }

              const authResponse = await apiService.googleAuth({
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                sub: payload.sub,
                email_verified: true,
              });

              const handleUserData = (userData: User) => {
                if (
                  !userData.mobile_number ||
                  userData.mobile_number.trim() === ""
                ) {
                  setPendingGoogleUser(userData);
                  setShowMobilePopup(true);
                } else {
                  onSuccessRef.current?.(userData);
                }
              };

              if (authResponse.user) {
                try {
                  const profileResponse = await apiService.getProfile(
                    authResponse.user.id.toString(),
                  );
                  if (profileResponse.status && profileResponse.user) {
                    handleUserData({
                      ...authResponse.user,
                      ...profileResponse.user,
                      avatar:
                        authResponse.user.avatar ||
                        authResponse.user.picture ||
                        payload.picture,
                    });
                  } else {
                    handleUserData({
                      ...authResponse.user,
                      avatar:
                        authResponse.user.avatar ||
                        authResponse.user.picture ||
                        payload.picture,
                    });
                  }
                } catch {
                  handleUserData({
                    ...authResponse.user,
                    avatar:
                      authResponse.user.avatar ||
                      authResponse.user.picture ||
                      payload.picture,
                  });
                }
              } else {
                try {
                  const profileResponse = await apiService.getProfile(
                    payload.sub,
                  );
                  if (profileResponse.status && profileResponse.user) {
                    handleUserData({
                      id: profileResponse.user.id || payload.sub,
                      email: payload.email,
                      name: payload.name || profileResponse.user.name,
                      avatar: payload.picture || profileResponse.user.picture,
                      mobile_number: profileResponse.user.mobile_number,
                    });
                  } else {
                    handleUserData({
                      id: payload.sub,
                      email: payload.email,
                      name: payload.name,
                      avatar: payload.picture,
                    });
                  }
                } catch {
                  handleUserData({
                    id: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    avatar: payload.picture,
                  });
                }
              }
            } catch (err: any) {
              setError(err.message || "Google authentication failed");
              isProcessingRef.current = false;
            }
          },
        });

        // window.google.accounts.id.renderButton(googleButtonRef.current, {
        //   type: 'standard',
        //   theme: 'filled_black',  // dark button, fits dark UIs
        //   size: 'large',
        //   text: 'continue_with',  // "Continue with Google"
        //   shape: 'pill',          // fully rounded corners
        //   logo_alignment: 'center',
        //   width: 360,             // must be a number, not '100%'
        // })

        setGoogleReady(true);
      }
    };

    initGoogleAuth();

    return () => {
      isProcessingRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (overlayRef.current && contentRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
      );
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleClose = () => {
    if (contentRef.current && overlayRef.current) {
      gsap.to(contentRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute right-5 top-5 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        <X size={22} strokeWidth={2.4} aria-hidden="true" />
      </button>
      <div
        ref={contentRef}
        onClick={(e) => e.stopPropagation()}
        data-auth-modal
        className="relative w-full max-w-[1200px] rounded-[2.45rem] border my-4 shadow-2xl backdrop-blur-2xl"
        style={{
          borderColor: "rgba(255, 255, 255, 0.26)",
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.18)",
          // NO overflow-hidden here — that was clipping the bottom of the right panel
        }}
      >
        {/* Scoped CSS to remove extra focus outlines/shadows inside the modal */}
        <style>{`
          [data-auth-modal] input:focus,
          [data-auth-modal] textarea:focus,
          [data-auth-modal] select:focus,
          [data-auth-modal] .auth-modal-input:focus,
          [data-auth-modal] input:focus-visible,
          [data-auth-modal] textarea:focus-visible {
            box-shadow: none !important;
            outline: none !important;
          }

          /* Autofill handling: keep background but remove inset highlight if needed */
          [data-auth-modal] input:-webkit-autofill,
          [data-auth-modal] input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.04) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255,255,255,0.04) inset !important;
            -webkit-text-fill-color: white !important;
            caret-color: white !important;
          }
        `}</style>
        {/*
          ============================================================
          LAYOUT: flex row — left panel grows naturally with content,
          right panel is completely independent with its own padding.
          They share the same row but NEVER affect each other's height.
          ============================================================
        */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            overflow: "hidden",
            borderRadius: "2rem",
            maxHeight: "95vh",
          }}
        >
          {/* ── LEFT PANEL ── takes natural height from content ── */}
          <div
            className="p-6 md:p-8 bg-transparent font-geist"
            style={{
              flex: "0 0 46%",
            }}
          >
            <div className="w-full max-w-[430px] mx-auto">
              {mode !== "forgot-password" && (
                <div className="mb-7 pt-1">
                  <p className="text-[#00FFFF] text-sm font-semibold tracking-[0.2em] uppercase mb-2 font-clash-display">
                    ProductSnap
                  </p>
                  <h2 className="text-2xl font-bold text-white leading-tight font-clash-display">
                    Start your perfect creative journey
                  </h2>
                </div>
              )}

              {/* Tabs */}
              {mode !== "otp" && mode !== "forgot-password" && (
                <div className="flex gap-2 mb-3  bg-white/20 rounded-full p-1 border border-white/30 backdrop-blur-md">
                  <button
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccessMessage("");
                      setLoginErrors({});
                      setRegisterErrors({});
                    }}
                    className={`flex-1 py-2 px-4 rounded-full text-base font-bold transition-all ${
                      mode === "login"
                        ? "bg-white text-slate-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMode("register");
                      setError("");
                      setSuccessMessage("");
                      setLoginErrors({});
                      setRegisterErrors({});
                      setRegisterForm({
                        email: "",
                        password: "",
                        full_name: "",
                        mobile_number: "",
                      });
                    }}
                    className={`flex-1 py-2 px-4 rounded-full text-base font-bold transition-all ${
                      mode === "register"
                        ? "bg-white text-slate-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Error Message */}
              {(error || otpError) && (
                <div className="error-message mb-6 p-3 bg-red-500/90 border border-red-300/80 rounded-2xl text-white text-sm backdrop-blur-md">
                  {error || otpError}
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="success-message mb-6 p-3 bg-cyan-500/90 border border-cyan-300/80 rounded-2xl text-white text-sm backdrop-blur-md">
                  {successMessage}
                </div>
              )}

              {/* Forgot Password Form */}
              {mode === "forgot-password" && (
                <div className="space-y-4 mb-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold font-Clash Display text-white mb-2">
                      Reset Password
                    </h3>
                    <p className="text-white font-geist-reference  text-sm">
                      {forgotPasswordStep === "request"
                        ? "Enter your email to receive a password reset OTP"
                        : `We've sent a 6‑digit verification code to ${forgotPasswordForm.email}. Enter it below to continue.`}
                    </p>
                  </div>

                  {forgotPasswordStep === "request" ? (
                    <>
                      <div>
                        <label className="block text-sm font-geist-reference  font-medium text-white mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={forgotPasswordForm.email}
                          onChange={(e) => {
                            setForgotPasswordForm({
                              ...forgotPasswordForm,
                              email: e.target.value,
                            });
                            setError("");
                          }}
                          className="w-full font-geist-reference  text-sm font-medium text-white/90  px-4 py-3 border rounded-full  placeholder-white/60 bg-white/10  focus:outline-none focus:ring-2 transition-all border-white/30 focus:border-[#00FFFF]/60 focus:ring-[#00FFFF]/40"
                          placeholder="Enter your email"
                        />
                      </div>
                      <CtaButton
                        type="button"
                        onClick={async () => {
                          if (
                            !forgotPasswordForm.email ||
                            !validateEmail(forgotPasswordForm.email)
                          ) {
                            setError("Please enter a valid email address");
                            return;
                          }
                          setLoading(true);
                          setError("");
                          setSuccessMessage("");
                          try {
                            const response =
                              await apiService.resetPasswordRequest({
                                email: forgotPasswordForm.email.trim(),
                              });
                            if (response.status) {
                              setSuccessMessage(
                                response.message || "OTP sent to your email",
                              );
                              setTimeout(() => {
                                setForgotPasswordStep("verify");
                                setSuccessMessage("");
                              }, 1500);
                            } else {
                              setError(
                                response.message || "Failed to send OTP",
                              );
                            }
                          } catch (err: any) {
                            setError(
                              err.response?.data?.message ||
                                err.message ||
                                "Failed to send OTP",
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="w-full py-3 mt-5 bg-[#00FFFF] text-slate-900 rounded-full font-geist-reference"
                        showArrow={false}
                      >
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </CtaButton>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block font-geist-reference text-sm font-medium text-white mb-2">
                          Enter the OTP sent to your email
                        </label>
                        <input
                          type="text"
                          value={forgotPasswordForm.otp}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setForgotPasswordForm({
                              ...forgotPasswordForm,
                              otp: value,
                            });
                            setError("");
                          }}
                          className="w-full mb-2  px-4 py-3 border rounded-full text-white placeholder-white/60 bg-white/10 font-light focus:outline-none focus:ring-2 transition-all text-center text-2xl tracking-widest border-white/30 focus:border-white/60 focus:ring-white/40"
                          placeholder="000000"
                          maxLength={6}
                        />
                        <p className="mt-2 text-xs font-geist-reference text-white text-center">
                          Didn't receive the code? Check your spam folder or
                          request a new one.
                        </p>
                      </div>
                      <CtaButton
                        type="button"
                        onClick={async () => {
                          if (
                            !forgotPasswordForm.otp ||
                            forgotPasswordForm.otp.length !== 6
                          ) {
                            setError("Please enter a valid 6-digit OTP");
                            return;
                          }
                          setLoading(true);
                          setError("");
                          setSuccessMessage("");
                          try {
                            const response = await apiService.resetPassword({
                              email: forgotPasswordForm.email.trim(),
                              otp: forgotPasswordForm.otp.trim(),
                            });
                            if (response.status) {
                              let message =
                                response.message ||
                                "Password reset successfully!";
                              if (response.note) {
                                message += ` ${response.note}`;
                              }
                              setSuccessMessage(message);
                              if (response.new_password) {
                                setLoginForm({
                                  email: forgotPasswordForm.email.trim(),
                                  password: response.new_password,
                                });
                              }
                              setTimeout(() => {
                                setMode("login");
                                setForgotPasswordStep("request");
                                setForgotPasswordForm({ email: "", otp: "" });
                              }, 1500);
                              setTimeout(() => setSuccessMessage(""), 1500);
                            } else {
                              setError(
                                response.message || "Failed to reset password",
                              );
                            }
                          } catch (err: any) {
                            setError(
                              err.response?.data?.message ||
                                err.message ||
                                "Failed to reset password",
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                        className="w-full py-3 bg-white text-slate-900 rounded-full font-semibold font-geist-reference"
                        showArrow={false}
                      >
                        {loading ? "Resetting Password..." : "Reset Password"}
                      </CtaButton>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setForgotPasswordStep("request");
                      setForgotPasswordForm({ email: "", otp: "" });
                      setError("");
                      setSuccessMessage("");
                    }}
                    className="w-full py-1 text-white/90 hover:text-white mb-0 font-geist-reference mt-1 transition-colors text-sm underline"
                  >
                    Back to Login
                  </button>
                </div>
              )}

              {/* Login Form */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-4 mb-6">
                  <div>
                    <label className="block font-geist-reference text-sm font-medium text-white/80 mb-2">
                      Email
                      {loginErrors.email && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        ref={loginEmailRef}
                        aria-invalid={!!loginErrors.email}
                        aria-describedby={
                          loginErrors.email ? "login-email-error" : undefined
                        }
                        value={loginForm.email}
                        onChange={(e) => {
                          setLoginForm({ ...loginForm, email: e.target.value });
                          if (loginErrors.email)
                            setLoginErrors({
                              ...loginErrors,
                              email: undefined,
                            });
                        }}
                        className={`w-full pl-4 pr-4 py-3 border rounded-full text-white placeholder-white/60 placeholder:text-sm placeholder:font-light font-geist-reference bg-white/10 font-light focus:outline-none transition-all ${
                          loginErrors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                            : "border-white/30 focus:border-[#00FFFF]/75 focus:ring-[#00FFFF]"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {loginErrors.email && (
                      <p
                        id="login-email-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-sm text-red-500"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                        {loginErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-geist-reference  text-sm font-medium text-white/80 mb-2">
                      Password
                      {loginErrors.password && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        ref={loginPasswordRef}
                        aria-invalid={!!loginErrors.password}
                        aria-describedby={
                          loginErrors.password
                            ? "login-password-error"
                            : undefined
                        }
                        value={loginForm.password}
                        onChange={(e) => {
                          setLoginForm({
                            ...loginForm,
                            password: e.target.value,
                          });
                          if (loginErrors.password)
                            setLoginErrors({
                              ...loginErrors,
                              password: undefined,
                            });
                        }}
                        className={`w-full pl-4 pr-4 py-3 border rounded-full text-white placeholder-white/60 placeholder:text-sm placeholder:font-light font-geist-reference bg-white/10 font-light focus:outline-none transition-all ${
                          loginErrors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                            : "border-white/30 focus:border-[#00FFFF] focus:ring-[#00FFFF]"
                        }`}
                        placeholder="Enter your password"
                      />
                    </div>
                    {loginErrors.password && (
                      <p
                        id="login-password-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-sm text-red-500"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                        {loginErrors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-0 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot-password");
                        setForgotPasswordForm({
                          ...forgotPasswordForm,
                          email: loginForm.email,
                        });
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-sm font-geist-reference text-white/90 hover:text-white transition-colors underline"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <CtaButton
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#00FFFF] text-slate-900 rounded-full font-geist-reference font-semibold"
                    showArrow={false}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </CtaButton>
                </form>
              )}

              {/* Register Form */}
              {mode === "register" && (
                <form onSubmit={handleRegister} className="space-y-4 mb-6">
                  <div>
                    <label className="block font-geist-reference  text-sm font-medium text-white/90 mb-2.5 mt-0.5">
                      Full Name
                      {registerErrors.full_name && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        ref={registerFullNameRef}
                        aria-invalid={!!registerErrors.full_name}
                        aria-describedby={
                          registerErrors.full_name
                            ? "register-fullname-error"
                            : undefined
                        }
                        value={registerForm.full_name}
                        onChange={(e) => {
                          setRegisterForm({
                            ...registerForm,
                            full_name: e.target.value,
                          });
                          if (registerErrors.full_name)
                            setRegisterErrors({
                              ...registerErrors,
                              full_name: undefined,
                            });
                        }}
                        className={`w-full pl-4 pr-4 py-3 border rounded-full text-white placeholder-white/60 bg-white/10 placeholder:text-sm font-light  font-geist-reference   focus:outline-none transition-all ${
                          registerErrors.full_name
                            ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                            : "border-white/30 focus:border-[#00FFFF] focus:ring-[#00FFFF]"
                        }`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {registerErrors.full_name && (
                      <p
                        id="register-fullname-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-sm text-red-500"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                        {registerErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div className="mt-2">
                    <label className="block text-sm font-geist-reference   font-medium text-white/90 mb-2 ">
                      Email
                      {registerErrors.email && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => {
                          setRegisterForm({
                            ...registerForm,
                            email: e.target.value,
                          });
                          if (registerErrors.email)
                            setRegisterErrors({
                              ...registerErrors,
                              email: undefined,
                            });
                        }}
                        ref={registerEmailRef}
                        aria-invalid={!!registerErrors.email}
                        aria-describedby={
                          registerErrors.email
                            ? "register-email-error"
                            : undefined
                        }
                        className={`w-full pl-4 pr-4 py-3 border rounded-full text-white placeholder:text-sm  font-geist-reference    placeholder-white/60 bg-white/10 font-light focus:outline-none transition-all ${
                          registerErrors.email
                            ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                            : "border-white/30 focus:border-[#00FFFF] focus:ring-[#00FFFF]"
                        }`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {registerErrors.email && (
                      <p
                        id="register-email-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-sm text-red-500"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                        {registerErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm  font-geist-reference   font-medium text-white/90 mb-2">
                      Password
                      {registerErrors.password && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => {
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          });
                          if (registerErrors.password)
                            setRegisterErrors({
                              ...registerErrors,
                              password: undefined,
                            });
                        }}
                        ref={registerPasswordRef}
                        aria-invalid={!!registerErrors.password}
                        aria-describedby={
                          registerErrors.password
                            ? "register-password-error"
                            : undefined
                        }
                        className={`w-full pl-4 pr-4 py-3 border rounded-full text-white placeholder-white/60  font-geist-reference    placeholder:text-sm bg-white/10 font-light focus:outline-none transition-all ${
                          registerErrors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                            : "border-white/30 focus:border-[#00FFFF] focus:ring-[#00FFFF]"
                        }`}
                        placeholder="Enter your password (min. 6 characters)"
                      />
                    </div>
                    {registerErrors.password && (
                      <p
                        id="register-password-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-sm text-red-500"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                        {registerErrors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm  font-geist-reference   font-medium text-white/90 mb-2">
                      Mobile Number
                      {registerErrors.mobile_number && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={registerForm.mobile_number}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setRegisterForm({
                            ...registerForm,
                            mobile_number: value,
                          });
                          if (registerErrors.mobile_number)
                            setRegisterErrors({
                              ...registerErrors,
                              mobile_number: undefined,
                            });
                        }}
                        ref={registerMobileRef}
                        aria-invalid={!!registerErrors.mobile_number}
                        aria-describedby={
                          registerErrors.mobile_number
                            ? "register-mobile-error"
                            : undefined
                        }
                        className={`w-full pl-4 pr-4 py-3 border rounded-full text-white placeholder-white/60  font-geist-reference    placeholder:text-sm bg-white/10 font-light focus:outline-none transition-all ${
                          registerErrors.mobile_number
                            ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                            : "border-white/30 focus:border-[#00FFFF] focus:ring-[#00FFFF]"
                        }`}
                        placeholder="Enter your 10-digit mobile number"
                      />
                    </div>
                    {registerErrors.mobile_number && (
                      <p
                        id="register-mobile-error"
                        role="alert"
                        className="mt-2 flex items-center gap-2 text-sm text-red-500"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <circle cx="12" cy="16" r="1" />
                        </svg>
                        {registerErrors.mobile_number}
                      </p>
                    )}
                  </div>

                  <CtaButton
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#00FFFF] text-slate-900 rounded-full font-geist-reference font-semibold mt-5"
                    showArrow={false}
                  >
                    {loading ? "Registering..." : "Register"}
                  </CtaButton>
                </form>
              )}

              {/* OTP Form */}
              {mode === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-white mb-2">
                      We've sent a verification code to
                    </p>
                    <p className="text-white font-medium">{otpForm.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Enter OTP Code
                    </label>
                    <input
                      type="text"
                      value={otpForm.otp}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setOtpForm({ ...otpForm, otp: value });
                        setOtpError("");
                      }}
                      className={`w-full px-4 py-3 border rounded-2xl text-white placeholder-white/60 bg-white/10 font-light focus:outline-none focus:ring-2 transition-all text-center text-2xl tracking-widest ${
                        otpError
                          ? "border-red-500 focus:border-red-500 focus:ring-0 focus:shadow-none"
                          : "border-white/30 focus:border-white/70 focus:ring-white/40"
                      }`}
                      placeholder="000000"
                      maxLength={6}
                    />
                    {otpError && (
                      <p className="mt-1 text-sm text-white bg-red-500 rounded-lg p-1">
                        {otpError}
                      </p>
                    )}
                  </div>

                  <CtaButton
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-cyan-300 text-slate-900 rounded-2xl font-semibold"
                    showArrow={false}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </CtaButton>

                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setOtpError("");
                      setSuccessMessage("");
                      setOtpForm({ ...otpForm, otp: "" });
                    }}
                    className="w-full py-2 text-white hover:text-white transition-colors text-sm underline"
                  >
                    Back to Register
                  </button>
                </form>
              )}

              {/* Divider */}
              {mode !== "otp" && mode !== "forgot-password" && (
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-white/30"></div>
                  <span className="px-4 text-sm text-white/80">OR</span>
                  <div className="flex-1 border-t border-white/30"></div>
                </div>
              )}

              {/* Google Sign-In */}
              {/* {mode !== 'otp' && mode !== 'forgot-password' && (
                <>
                  <div ref={googleButtonRef} className="w-full flex  justify-center mb-5" style={{ minHeight: '50px' }} />
                  {!googleReady && (
                    <div className="w-full py-3 text-center text-white/80 text-sm mb-4">
                      Loading Google Sign-In...
                    </div>
                  )}
                </>
              )} */}

              {mode !== "otp" && mode !== "forgot-password" && (
                <>
                  <div ref={googleButtonRef} style={{ display: "none" }} />
                  <div className="w-full flex justify-center mb-5">
                    <button
                      type="button"
                      onClick={() =>
                        window.google?.accounts?.id?.prompt(() => undefined)
                      }
                      disabled={!googleReady}
                      className="relative flex items-center justify-center w-14 h-14 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-105"
                      style={{
                        background: "linear-gradient(145deg, #2a2a2a, #111111)",
                        boxShadow:
                          "0 0 0 1px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.5)",
                      }}
                    >
                      {/* glass shine arc */}
                      <span
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 45%, transparent 100%)",
                        }}
                      />
                      {/* Google G icon */}
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        className="relative z-10"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}

              <p className="text-xs font-geist-reference text-white/80 text-center mt-1 mb-1">
                By signing in, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>

          {/*
            ── RIGHT PANEL ──────────────────────────────────────────
            Completely independent from left panel.
            Uses its own padding — changing padding here will NEVER
            affect login or register card height/layout.
            padding: top right bottom left
            Adjust bottom value freely without any side effects.
            ─────────────────────────────────────────────────────────
          */}
          <div
            className="hidden md:block"
            style={{
              flex: "1",
              padding: "70px 70px 70px 35px", // ← change any of these freely
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "2.45rem",
                overflow: "hidden",
                backgroundImage: `url(${loginBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Number Popup */}
      {showMobilePopup && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border p-8 bg-secondary"
            onClick={(e) => e.stopPropagation()}
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: "var(--color-primary)",
            }}
          >
            <h3 className="text-2xl font-bold text-primary mb-4">
              Mobile Number Required
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Please provide your mobile number to complete your registration.
              This is required for account verification and payment processing.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobileNumber(value);
                  if (mobileNumberError) setMobileNumberError("");
                }}
                className={`w-full px-4 py-3 border rounded-full text-gray-600 placeholder-gray-600 font-light focus:outline-none focus:ring-2 transition-all font-geist ${
                  mobileNumberError
                    ? "border-gray-600 focus:ring-black"
                    : "border-gray-600 focus:border-[var(--color-primary-light)] focus:ring-[var(--color-primary-light)]"
                }`}
                placeholder="Enter your 10-digit mobile number"
              />
              {mobileNumberError && (
                <p className="mt-1 text-sm text-white bg-red-500 rounded-lg p-1">
                  {mobileNumberError}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!mobileNumber.trim()) {
                    setMobileNumberError("Mobile number is required");
                    return;
                  }
                  if (!validateMobileNumber(mobileNumber)) {
                    setMobileNumberError(
                      "Please enter a valid 10-digit mobile number",
                    );
                    return;
                  }
                  if (!pendingGoogleUser) {
                    setShowMobilePopup(false);
                    return;
                  }

                  setSavingMobile(true);
                  setMobileNumberError("");

                  try {
                    const response = await apiService.updateProfile({
                      user_id: pendingGoogleUser.id.toString(),
                      mobile_number: mobileNumber.trim().replace(/\s+/g, ""),
                    });

                    if (response.status) {
                      const updatedUser: User = {
                        ...pendingGoogleUser,
                        mobile_number: mobileNumber.trim().replace(/\s+/g, ""),
                      };
                      setShowMobilePopup(false);
                      setPendingGoogleUser(null);
                      setMobileNumber("");
                      onSuccessRef.current?.(updatedUser);
                      onCloseRef.current();
                    } else {
                      setMobileNumberError(
                        response.message || "Failed to save mobile number",
                      );
                    }
                  } catch (err: any) {
                    setMobileNumberError(
                      err.response?.data?.message ||
                        err.message ||
                        "Failed to save mobile number. Please try again.",
                    );
                  } finally {
                    setSavingMobile(false);
                  }
                }}
                disabled={savingMobile}
                className="flex-1 py-3 bg-primary rounded-full hover:bg-black transition-all text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingMobile ? "Saving..." : "Save & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.08) inset !important;
          box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.08) inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
