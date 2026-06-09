import { useState, useEffect, useRef, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { toast } from "react-toastify";
import { apiService, type User } from "../services/api";
import AuthModal from "./AuthModal";
import CtaButton from "./CtaButton";
import pricingBg from "../assets/images/Pricing_BG.jpg";

gsap.registerPlugin(ScrollTrigger);

interface PricingCard {
  name: string;
  description: string;
  highlightedWord?: string;
  credits?: string;
  price: string;
  paymentAmount?: string;
  originalPrice?: string;
  period?: string;
  gstNote?: string;
  features: string[];
  popular?: boolean;
  discountBadge?: string;
}

const PricingSection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<PricingCard | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [isSavingMobile, setIsSavingMobile] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [activePricingIndex, setActivePricingIndex] = useState(2);

  useEffect(() => {
    if (showCreditModal || showMobileModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showCreditModal, showMobileModal]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll(".pricing-card");
      if (!cards || cards.length === 0) return;

      gsap.set(cards, { opacity: 0 });

      const rect = section.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;

      if (isInView) {
        gsap.to(cards, {
          opacity: 1,
          duration: 0.8,
        });
      } else {
        gsap.to(cards, {
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const creditPacks: PricingCard[] = [
    {
      name: "",
      description: "",
      credits: "100 Credits",
      price: "₹99",
      gstNote: "+18% GST as applicable",
      features: [],
      popular: false,
    },
    {
      name: "",
      description: "",
      credits: "550 Credits",
      price: "₹499",
      gstNote: "+18% GST as applicable",
      features: [],
      popular: false,
      discountBadge: "10% Bonus",
    },
    {
      name: "",
      description: "",
      credits: "1200 Credits",
      price: "₹999",
      gstNote: "+18% GST as applicable",
      features: [],
      popular: true,
      discountBadge: "20% Bonus",
    },
  ];

  const pricingPlans: PricingCard[] = [
    {
      name: "Free",
      description: "For creatives taking their first steps with Forma.",
      price: "Free",
      paymentAmount: creditPacks[0].price.replace(/[₹â‚¹,]/g, "").trim(),
      features: [
        "Up to 3 projects in the cloud",
        "Image export up to 1080p",
        "Basic editing tools",
        "Free templates and icons",
        "Access via web and mobile app",
      ],
      popular: false,
    },
    {
      name: "Standard",
      description:
        "For freelancers and small teams who need more freedom and flexibility.",
      price: "$9,99",
      paymentAmount: creditPacks[1].price.replace(/[₹â‚¹,]/g, "").trim(),
      period: "/m",
      features: [
        "Up to 50 projects in the cloud",
        "Export up to 4K",
        "Advanced editing toolkit",
        "Team collaboration (up to 5 members)",
        "Access to premium template library",
      ],
      popular: false,
    },
    {
      name: "Pro",
      description:
        "For studios, agencies, and professional creators working with brands.",
      price: "$19,99",
      paymentAmount: creditPacks[2].price.replace(/[₹â‚¹,]/g, "").trim(),
      period: "/m",
      features: [
        "Unlimited projects",
        "Export up to 8K + animations",
        "AI-powered content generation tools",
        "Unlimited team members",
        "Brand customization (logos, fonts, color palettes)",
      ],
      popular: true,
    },
  ];

  const loadCashfreeSDK = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Cashfree) {
        resolve((window as any).Cashfree);
        return;
      }

      if (document.querySelector('script[src*="cashfree"]')) {
        const checkInterval = setInterval(() => {
          if ((window as any).Cashfree) {
            clearInterval(checkInterval);
            resolve((window as any).Cashfree);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("Cashfree SDK loading timeout"));
        }, 10000);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).Cashfree) {
          resolve((window as any).Cashfree);
        } else {
          reject(new Error("Cashfree SDK loaded but not available on window"));
        }
      };
      script.onerror = () => {
        reject(new Error("Failed to load Cashfree SDK script"));
      };
      document.head.appendChild(script);
    });
  };

  const initializeCashfree = async () => {
    const Cashfree = await loadCashfreeSDK();
    if (!Cashfree || typeof Cashfree !== "function") {
      throw new Error("Cashfree SDK not available");
    }
    return new Cashfree({
      mode: "production",
    });
  };

  const checkMobileNumber = (): boolean => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      return !!(user.mobile_number && user.mobile_number.trim() !== "");
    } catch {
      return false;
    }
  };

  const handleBuyNow = async (plan: PricingCard) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setShowLoginModal(true);
      return;
    }

    if (!checkMobileNumber()) {
      setPendingAction(() => () => {
        const numericAmount = plan.price.replace(/[₹,]/g, "").trim();
        setCreditAmount(plan.paymentAmount || numericAmount);
        setSelectedPlan(plan);
        setShowCreditModal(true);
      });
      setShowMobileModal(true);
      return;
    }

    const numericAmount = plan.price.replace(/[₹,]/g, "").trim();
    setCreditAmount(plan.paymentAmount || numericAmount);
    setSelectedPlan(plan);
    setShowCreditModal(true);
  };

  const handleSaveMobile = async () => {
    if (!mobileNumber || mobileNumber.trim() === "") {
      toast.error("Please enter a valid mobile number");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsSavingMobile(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("User not found. Please login again.");
        setShowMobileModal(false);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;

      if (!userId) {
        toast.error("User ID not found");
        setShowMobileModal(false);
        return;
      }

      const response = await apiService.updateProfile({
        user_id: userId,
        mobile_number: mobileNumber.trim(),
      });

      if (!response.status) {
        throw new Error(response.message || "Failed to update mobile number");
      }

      const updatedUser = {
        ...user,
        mobile_number: mobileNumber.trim(),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setShowMobileModal(false);
      setMobileNumber("");

      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error: any) {
      console.error("Error saving mobile number:", error);
      toast.error(error.message || "Failed to save mobile number");
    } finally {
      setIsSavingMobile(false);
    }
  };

  const handleCreditPayment = async () => {
    if (!checkMobileNumber()) {
      setPendingAction(() => handleCreditPaymentAfterMobileCheck);
      setShowCreditModal(false);
      setShowMobileModal(true);
      return;
    }
    handleCreditPaymentAfterMobileCheck();
  };

  const handleCreditPaymentAfterMobileCheck = async () => {
    const amount = parseFloat(creditAmount);

    if (!creditAmount || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount < 1) {
      toast.error("Minimum amount is ₹1");
      return;
    }

    setIsProcessing(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setShowCreditModal(false);
        setShowLoginModal(true);
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;

      if (!userId) {
        toast.error("User ID not found");
        setShowCreditModal(false);
        return;
      }

      const response = await apiService.createPaymentOrder(userId, amount);

      if (!response.status || !response.data) {
        throw new Error(response.message || "Failed to create order");
      }

      const { paymentSessionId } = response.data;
      const cashfree = await initializeCashfree();

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: "_modal",
      };

      setShowCreditModal(false);
      setCreditAmount("");

      cashfree
        .checkout(checkoutOptions)
        .then(async (response: any) => {
          console.log("Response:", response);
          setTimeout(async () => {
            try {
              const verifyResponse = await apiService.verifyOrder(
                String(userId),
              );

              if (
                verifyResponse.status &&
                verifyResponse.data?.results &&
                verifyResponse.data.results.length > 0
              ) {
                const latestOrder = verifyResponse.data.results[0];
                const orderStatus = (latestOrder.status || "").toLowerCase();

                let paymentStatus: "success" | "failed" | "pending" = "pending";

                if (
                  orderStatus === "success" ||
                  orderStatus === "completed" ||
                  orderStatus === "paid"
                ) {
                  paymentStatus = "success";
                } else if (orderStatus === "failed" || orderStatus === "fail") {
                  paymentStatus = "failed";
                } else if (orderStatus === "pending") {
                  paymentStatus = "pending";
                } else {
                  paymentStatus = "pending";
                }

                const isSuccess = paymentStatus === "success";
                const paymentData = {
                  status: paymentStatus,
                  orderId: latestOrder.order_id,
                  amount: latestOrder.amount,
                  baseAmount: latestOrder.base_amount,
                  gstAmount: latestOrder.gst_amount,
                  totalAmount: latestOrder.amount,
                  credits: latestOrder.credits_to_add,
                  date: latestOrder.completed_at || latestOrder.created_at,
                  paymentMethod: "Cashfree",
                  orderStatus: latestOrder.order_status,
                  orderStatusInternal: latestOrder.status,
                };

                if (isSuccess) {
                  window.dispatchEvent(new CustomEvent("refreshCredits"));
                }

                navigate("/payment-result", {
                  state: { paymentData },
                });
              } else {
                navigate("/payment-result", {
                  state: {
                    paymentData: {
                      status: "failed",
                      message: "No payment orders found",
                    },
                  },
                });
              }
            } catch (verifyError: any) {
              console.error(
                "Error verifying orders after checkout:",
                verifyError,
              );
              navigate("/payment-result", {
                state: {
                  paymentData: {
                    status: "failed",
                    message:
                      "Unable to verify payment. Please check your payment status.",
                  },
                },
              });
            }
          }, 2000);
        })
        .catch((error: any) => {
          console.error("Payment checkout error:", error);
          navigate("/payment-result", {
            state: {
              paymentData: {
                status: "failed",
                message: "Payment checkout failed. Please try again.",
              },
            },
          });
        });
    } catch (error: any) {
      console.error("Credit payment error:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative z-10 min-h-screen overflow-hidden bg-black px-6 py-16 text-white md:min-h-0 md:py-0 lg:px-8"
      style={{ perspective: "1200px" }}
    >
      <img
        src={pricingBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/45" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black via-black/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1180px] md:h-screen">
        <div
          className="pointer-events-none absolute left-1/2 top-[72px] hidden -translate-x-1/2 select-none bg-clip-text pb-10 text-center font-heading text-[170px] font-semibold leading-none tracking-normal text-transparent opacity-75 md:block lg:text-[230px] xl:text-[285px]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(0,255,255,0.08) 0%, rgba(0,255,255,0.9) 48%, rgba(255,255,255,0.78) 100%)",
            textShadow: "0 0 55px rgba(0,255,255,0.36)",
          }}
        >
          <span
            style={{
              color: "rgba(0,255,255,0.42)",
              WebkitTextFillColor: "rgba(0,255,255,0.42)",
              textShadow: "none",
            }}
          >
            P
          </span>
          ricing
        </div>

        <div className="relative mx-auto flex flex-wrap items-stretch justify-center gap-6 md:gap-7 md:pt-[250px]">
          {pricingPlans.map((plan, index) => {
            const isActive = activePricingIndex === index;

            return (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => setActivePricingIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActivePricingIndex(index);
                  }
                }}
                className="pricing-card group relative isolate w-full max-w-[360px] overflow-hidden rounded-[40px] text-white backdrop-blur-xl transition-all duration-300 md:h-[540px] md:w-[31%] lg:w-[31%]"
                style={{
                  transformStyle: "preserve-3d",
                  transform: "rotateX(0deg) rotateY(0deg) translateZ(0px)",
                  // transition: isHovered ? 'none' : 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                  background: isActive
                    ? "linear-gradient(135deg, rgba(0,200,200,0.13) 0%, rgba(0,0,0,0.45) 60%, rgba(0,180,180,0.08) 100%)"
                    : "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.35) 100%)",
                  border: isActive
                    ? "1.25px solid rgba(255,255,255,0.96)"
                    : "1px solid rgba(255,255,255,0.42)",
                  boxShadow: isActive
                    ? "inset 0 16px 36px -18px rgba(0,255,255,0.95), inset 0 -18px 38px -18px rgba(255,255,255,0.7), inset 16px 0 34px -26px rgba(0,255,255,0.45), inset -16px 0 34px -26px rgba(255,255,255,0.36), 0 18px 34px -28px rgba(0,0,0,0.85)"
                    : "0 8px 32px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                }}
              >
                {/* 3D Floating Shadow */}
                <div
                  className="pointer-events-none absolute -inset-4 rounded-[50px] opacity-0 transition-opacity duration-300"
                  style={{
                    // background: 'radial-gradient(ellipse at center, rgba(0,200,200,0.2), transparent 70%)',
                    filter: "blur(20px)",
                    opacity: 0,
                    transform: "translateZ(0px)",
                  }}
                />

                {/* ── CORNER BRACKETS (active only) ── */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[40px]"
                  style={{
                    padding: isActive ? 1.25 : 1,
                    background: isActive
                      ? "linear-gradient(180deg, rgba(0,255,255,0.9) 0%, rgba(0,255,255,0.42) 18%, rgba(255,255,255,0.28) 55%, rgba(255,255,255,0.98) 100%)"
                      : "linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04), rgba(255,255,255,0.08))",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                    filter: "none",
                    zIndex: 12,
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-[1px] rounded-[39px] transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,255,255,0.18) 0%, transparent 22%, transparent 72%, rgba(255,255,255,0.18) 100%)",
                    boxShadow:
                      "inset 0 22px 36px -26px rgba(0,255,255,0.95), inset 0 -24px 36px -26px rgba(255,255,255,0.95)",
                    opacity: isActive ? 1 : 0,
                    zIndex: 1,
                  }}
                />

                {false && isActive && (
                  <>
                    {/* Top-Left */}
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        top: -1,
                        left: -1,
                        width: 26,
                        height: 26,
                        borderTop: "2px solid rgba(0,230,255,0.85)",
                        borderLeft: "2px solid rgba(0,230,255,0.85)",
                        borderTopLeftRadius: 28, // ← must match card's border-radius
                        filter: "drop-shadow(0 0 6px rgba(0,220,255,0.75))",
                        zIndex: 10,
                      }}
                    />

                    {/* Top-Right */}
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        top: -1,
                        right: -1,
                        width: 26,
                        height: 26,
                        borderTop: "2px solid rgba(0,230,255,0.85)",
                        borderRight: "2px solid rgba(0,230,255,0.85)",
                        borderTopRightRadius: 28,
                        filter: "drop-shadow(0 0 6px rgba(0,220,255,0.75))",
                        zIndex: 10,
                      }}
                    />

                    {/* Bottom-Left */}
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        bottom: -1,
                        left: -1,
                        width: 26,
                        height: 26,
                        borderBottom: "2px solid rgba(0,230,255,0.85)",
                        borderLeft: "2px solid rgba(0,230,255,0.85)",
                        borderBottomLeftRadius: 28,
                        filter: "drop-shadow(0 0 6px rgba(0,220,255,0.75))",
                        zIndex: 10,
                      }}
                    />

                    {/* Bottom-Right */}
                    <div
                      className="pointer-events-none absolute"
                      style={{
                        bottom: -1,
                        right: -1,
                        width: 26,
                        height: 26,
                        borderBottom: "2px solid rgba(0,230,255,0.85)",
                        borderRight: "2px solid rgba(0,230,255,0.85)",
                        borderBottomRightRadius: 28,
                        filter: "drop-shadow(0 0 6px rgba(0,220,255,0.75))",
                        zIndex: 10,
                      }}
                    />

                    {/* Inner top glow */}
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-20"
                      style={{
                        borderRadius: "28px 28px 0 0",
                        background:
                          "linear-gradient(180deg, rgba(0,210,255,0.16) 0%, transparent 100%)",
                        zIndex: 1,
                      }}
                    />
                  </>
                )}

                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full"
                  style={{
                    background: isActive
                      ? "linear-gradient(90deg, transparent, rgba(0,255,255,0.5), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                    zIndex: 2,
                  }}
                />

                <div
                  className={`pointer-events-none absolute inset-0 rounded-[40px] ${
                    isActive
                      ? "bg-[linear-gradient(145deg,rgba(0,255,255,0.06),transparent_40%,rgba(0,0,0,0.15))]"
                      : "bg-[linear-gradient(145deg,rgba(255,255,255,0.06),transparent_40%,rgba(0,0,0,0.1))]"
                  }`}
                />

                <div className="pointer-events-none absolute -right-16 top-[-20%] h-[140%] w-28 rotate-[18deg] bg-white/20 blur-2xl transition-opacity duration-500" />

                <div
                  className={`pointer-events-none absolute -bottom-12 left-0 h-32 w-full blur-2xl ${
                    isActive ? "bg-cyan-400/20" : "bg-white/[0.05]"
                  }`}
                />

                <div className="pointer-events-none absolute inset-x-4 top-3 h-12 rounded-[26px] bg-white/[0.05] blur-xl" />

                <div
                  className="relative z-10 flex min-h-[540px] flex-col justify-between px-7 pb-8 pt-9 md:h-full"
                  style={{
                    transformStyle: "preserve-3d",
                    // transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)',
                    transition: "transform 0.3s ease",
                  }}
                >
                  {plan.discountBadge && (
                    <div className="absolute top-4 right-4 z-20">
                      <span
                        className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
                        style={{
                          boxShadow: "0 0 18px rgba(103,232,249,0.22)",
                        }}
                      >
                        {plan.discountBadge}
                      </span>
                    </div>
                  )}

                  {plan.name !== "" && (
                    <h3 className="font-geist-reference text-xl font-medium leading-none tracking-normal text-white/86">
                      {plan.name}
                    </h3>
                  )}

                  <div className="mt-2">
                    <div className="flex items-end gap-1">
                      <p className="font-geist-reference text-[34px] font-semibold leading-none tracking-normal text-white md:text-[42px]">
                        {plan.price}
                      </p>
                      {plan.period && (
                        <span className="pb-0.5 font-geist-reference text-[30px] font-semibold leading-none text-white">
                          {plan.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {plan.description && (
                    <p className="max-w-[270px] font-geist-reference text-xs leading-relaxed text-white/62">
                      {plan.description}
                    </p>
                  )}

                  {plan.features.length > 0 && (
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.16] text-white shadow-[inset_0_1px_0_rgba(0,0,0,0.18),0_0_10px_rgba(0,0,0,0.16)]">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="m6 12 4 4 8-8" />
                            </svg>
                          </span>
                          <span className="w-auto font-geist-reference text-xs font-medium leading-5 tracking-normal text-white/78">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex justify-center pt-6">
                    <CtaButton
                      size="sm"
                      showArrow={false}
                      onClick={(e: MouseEvent<HTMLButtonElement>) => {
                        e.stopPropagation();
                        setActivePricingIndex(index);
                        handleBuyNow(plan);
                      }}
                      className="relative z-10 w-[56%] min-w-[140px] justify-center"
                    >
                      Choose Plan
                    </CtaButton>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Purchase Modal */}
      {showCreditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] rounded-4xl border p-8 my-4 overflow-y-auto bg-secondary"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              boxShadow:
                "0 8px 32px color-mix(in srgb, var(--color-primary) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)",
            }}
          >
            <button
              onClick={() => {
                setShowCreditModal(false);
                setCreditAmount("");
                setSelectedPlan(null);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Buy Credits</h3>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Summary
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-600 space-y-2">
                  {(() => {
                    const baseAmount = parseFloat(creditAmount || "0");
                    const gstAmount = baseAmount * 0.18;
                    const totalAmount = baseAmount + gstAmount;

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">
                            Amount (excl. GST):
                          </span>
                          <span className="font-medium">
                            ₹{baseAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">GST @ 18%:</span>
                          <span className="font-medium">
                            ₹{gstAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                          <span className="text-primary font-semibold">
                            Total (incl. GST):
                          </span>
                          <span className="text-primary font-bold text-lg">
                            ₹{totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {selectedPlan && selectedPlan.credits && (
                <div className="p-4 rounded-xl border border-[var(--color-primary)]">
                  <p className="text-sm mb-1 text-gray-600">You will receive</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedPlan.credits}
                  </p>
                  {selectedPlan.discountBadge && (
                    <p className="text-xs mt-1 font-medium text-gray-600">
                      {selectedPlan.discountBadge}
                    </p>
                  )}
                </div>
              )}

              <CtaButton
                onClick={handleCreditPayment}
                disabled={
                  !creditAmount ||
                  isNaN(parseFloat(creditAmount)) ||
                  parseFloat(creditAmount) <= 0 ||
                  isProcessing
                }
                className="w-full justify-center"
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </CtaButton>

              <div className="flex items-center justify-center gap-4 text-sm">
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 transition-colors underline"
                >
                  Terms & Conditions
                </a>
                <span className="text-gray-600">|</span>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 transition-colors underline"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <AuthModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={(user: User) => {
            localStorage.setItem("user", JSON.stringify(user));
            setShowLoginModal(false);
          }}
        />
      )}

      {showMobileModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] rounded-4xl border p-8 my-4 overflow-y-auto bg-secondary"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-primary) 30%, transparent)",
              boxShadow:
                "0 8px 32px color-mix(in srgb, var(--color-primary) 30%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-primary) 20%, transparent)",
            }}
          >
            <button
              onClick={() => {
                setShowMobileModal(false);
                setMobileNumber("");
                setPendingAction(null);
              }}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Setup Mobile Number</h3>
              <p className="text-gray-600 text-sm">
                Please provide your mobile number to continue with the payment.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    if (value.length <= 10) {
                      setMobileNumber(value);
                    }
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 text-gray-600 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                <p className="mt-2 text-xs text-gray-600">
                  Enter your 10-digit mobile number without country code
                </p>
              </div>

              <CtaButton
                onClick={handleSaveMobile}
                disabled={
                  !mobileNumber || mobileNumber.length !== 10 || isSavingMobile
                }
                className="w-full justify-center"
              >
                {isSavingMobile ? "Saving..." : "Save & Continue"}
              </CtaButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PricingSection;
