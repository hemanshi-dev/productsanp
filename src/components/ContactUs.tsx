import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Mail, MapPin, Phone, Home } from "lucide-react";
import { gsap } from "gsap";
import CtaButton from "./CtaButton";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorFollowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Your message has been sent successfully!");
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
      setSubmitting(false);
    }, 1500);
  };

  // Interactive Dot Grid Canvas logic (exactly like FeaturesSection/HowItWorks/Explore)
  useEffect(() => {
    const section = sectionRef.current;
    const cursor = cursorFollowRef.current;
    const dot = dotRef.current;
    const canvas = canvasRef.current;
    const ctxCanvas = canvas?.getContext("2d");
    if (!section || !cursor || !dot || !canvas || !ctxCanvas) return;

    const xSetterDot = gsap.quickSetter(dot, "x", "px");
    const ySetterDot = gsap.quickSetter(dot, "y", "px");
    const dotsGrid: {
      x: number;
      y: number;
      originalX: number;
      originalY: number;
      size: number;
    }[] = [];
    const spacing = 40;
    const mousePos = {
      x: section.offsetWidth / 2,
      y: section.offsetHeight / 2,
    };
    let animationFrameId: number;
    let lastTime = 0;
    let lastX = mousePos.x;
    let lastY = mousePos.y;

    const initGrid = () => {
      dotsGrid.length = 0;
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;

      for (let x = spacing / 2; x < canvas.width; x += spacing) {
        for (let y = spacing / 2; y < canvas.height; y += spacing) {
          dotsGrid.push({ x, y, originalX: x, originalY: y, size: 0.8 });
        }
      }
    };

    const render = (time: number) => {
      ctxCanvas.clearRect(0, 0, canvas.width, canvas.height);

      const deltaTime = time - lastTime;
      lastTime = time;
      const dxMouse = mousePos.x - lastX;
      const dyMouse = mousePos.y - lastY;
      const velocity =
        Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse) / (deltaTime || 1);
      lastX = mousePos.x;
      lastY = mousePos.y;

      dotsGrid.forEach((gridDot, i) => {
        const dx = mousePos.x - gridDot.x;
        const dy = mousePos.y - gridDot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 200;
        const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.5 + 0.5;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          gridDot.x = gridDot.originalX - dx * force * 0.15;
          gridDot.y = gridDot.originalY - dy * force * 0.15;
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`;
          ctxCanvas.beginPath();
          ctxCanvas.arc(
            gridDot.x,
            gridDot.y,
            gridDot.size + force * 2,
            0,
            Math.PI * 2,
          );
          ctxCanvas.fill();
        } else {
          gridDot.x += (gridDot.originalX - gridDot.x) * 0.1;
          gridDot.y += (gridDot.originalY - gridDot.y) * 0.1;
          ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`;
          ctxCanvas.beginPath();
          ctxCanvas.arc(
            gridDot.x,
            gridDot.y,
            gridDot.size + pulse * 0.5,
            0,
            Math.PI * 2,
          );
          ctxCanvas.fill();
        }
      });

      const stretch = Math.min(1 + velocity * 0.1, 1.8);
      const rotation = (Math.atan2(dyMouse, dxMouse) * 180) / Math.PI;
      gsap.set(dot, {
        scaleX: stretch,
        scaleY: 1 / Math.sqrt(stretch),
        rotation: velocity > 0.5 ? rotation : 0,
        transformOrigin: "center center",
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos.x = x;
      mousePos.y = y;

      gsap.to(cursor, { x, y, duration: 0.6, ease: "power3.out" });
      xSetterDot(x);
      ySetterDot(y);
    };

    initGrid();
    gsap.set(cursor, { x: mousePos.x, y: mousePos.y });
    gsap.set(dot, { x: mousePos.x, y: mousePos.y });
    animationFrameId = requestAnimationFrame(render);

    window.addEventListener("resize", initGrid);
    section.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", initGrid);
      section.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden min-h-screen bg-black text-white pt-20"
    >
      {/* Dynamic Background dots canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Cursor and dot followers */}
      <div
        ref={cursorFollowRef}
        className="pointer-events-none absolute z-50 hidden h-20 w-20 -ml-10 -mt-10 rounded-full border border-[#00FFFF]/20 bg-white/5"
        style={{ backdropFilter: "blur(4px)" }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none absolute z-50 hidden h-1.5 w-1.5 -ml-[3px] -mt-[3px] rounded-full bg-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.5)]"
      />

      {/* 1. Header Banner */}
      <div className="relative z-10 overflow-hidden bg-[#00FFFF] py-12 text-black px-4 sm:px-6 lg:px-8 md:py-16">
        {/* Large Translucent background text */}
        <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none">
          <span className="text-[18vw] font-extrabold text-black/5 leading-none translate-y-4 font-clash-display uppercase tracking-normal pl-4 md:text-[12vw]">
            CONTACT
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <h1 className="font-clash-display text-4xl font-bold tracking-normal text-black md:text-6xl">
              Contact Us
            </h1>
          </div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm font-semibold font-geist-reference bg-black/5 px-4 py-2 rounded-full backdrop-blur-sm w-fit border border-black/10 text-black/80">
            <a
              href="/"
              className="hover:opacity-70 transition-opacity flex items-center gap-1 text-black"
            >
              <Home className="w-3.5 h-3.5" /> Home
            </a>
            <span className="text-black/60">/</span>
            <span className="opacity-70 text-black">Contact Us</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-12 pt-0 md:pb-16">
        {/* 2. Main Form Card */}
        <div className="relative mx-auto mb-14 w-full max-w-[1320px] overflow-hidden rounded-b-[28px] rounded-t-none border border-t-0 border-white/10 bg-[#030405] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.75)] md:p-10 lg:px-[134px] lg:py-12">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFFF]/35 to-transparent" />
          <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
            {/* Left side info */}
            <div className="flex flex-col justify-between text-left">
              <div className="flex w-full flex-col items-start md:pl-0">
                <div className="mb-6 flex items-center gap-3">
                  {/* Small neon accent */}
                  {/* <span className="w-1.5 h-6 bg-[#00FFFF] rounded-full" /> */}
                  {/* <span className="font-geist-reference text-xs font-bold uppercase tracking-[0.28em] text-[#00FFFF]">
                    Let's Connect
                  </span> */}
                </div>

                <h2 className="relative mb-6 pl-6 font-clash-display text-4xl font-semibold leading-[1.22] text-white select-none md:text-5xl lg:text-[40px]">
                  {/* Decorative hand-drawn sunburst rays (custom SVG matching Figma) */}
                  <svg
                    className="absolute -top-7 -left-1 w-8 h-8 text-[#00FFFF]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="8" y1="18" x2="2" y2="17" />
                    {/* <line x1="16" y1="16" x2="21" y2="11" /> */}
                    <line x1="12" y1="14" x2="14" y2="5" />
                    <line x1="9" y1="15" x2="5" y2="8" />
                    {/* <line x1="8"  y1="18" x2="2"  y2="17" /> */}
                    <line x1="16" y1="16" x2="21" y2="11" />
                  </svg>
                  Let's <br />
                  <span className="mt-1 inline-block border-b border-[#00FFFF] pb-0.5 text-[#00FFFF]">
                    Contact
                  </span>{" "}
                  <br />
                  For <br />
                  <span className="mt-1 inline-block border-b border-[#00FFFF] pb-0.5 text-[#00FFFF]">
                    Better
                  </span>{" "}
                  <br />
                  <span className="mt-1 inline-block border-b border-[#00FFFF] pb-0.5 text-[#00FFFF]">
                    Result
                  </span>
                </h2>

                {/* Left-aligned wrapper for Vertical Line and Centered Address Block */}
                <div className="mt-1 flex w-full max-w-[190px] flex-col items-center md:mt-4">
                  {/* Thin vertical separator line */}
                  <div className="h-20 w-[1px] bg-white/20" />

                  {/* Address & Email info centered relative to the vertical line above it */}
                  <div className="mt-5 w-full space-y-2 text-center font-geist-reference">
                    <a
                      href="mailto:support@shuchiai.com"
                      className="group relative inline-block pb-0.5 text-sm font-semibold text-white transition-colors hover:text-[#00FFFF] md:text-base"
                    >
                      support@shuchiai.com
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00FFFF]/30 group-hover:bg-[#00FFFF] transition-colors" />
                    </a>
                    <p className="text-xs font-medium leading-relaxed text-white/58">
                      Monday to Friday, 10:00 AM - 6:00 PM IST
                      <br />
                      Replies within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side form */}
            <div>
              <h3 className="mb-6 font-clash-display text-2xl font-bold text-white md:text-3xl">
                Contact Us:
              </h3>

              <form
                onSubmit={handleSubmit}
                className="space-y-4 font-geist-reference"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Name*"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-14 w-full rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-0 focus:ring-[#00FFFF]"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Email*"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="h-14 w-full rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-0 focus:ring-[#00FFFF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-14 w-full rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-0 focus:ring-[#00FFFF]"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={formData.service}
                      onChange={(e) =>
                        setFormData({ ...formData, service: e.target.value })
                      }
                      className="h-14 w-full cursor-pointer appearance-none rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white/82 transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-0 focus:ring-[#00FFFF]"
                    >
                      <option value="" disabled>
                        Service*
                      </option>
                      <option value="photoshoot">Product Photoshoot</option>
                      <option value="marketing">Marketing Ads Visuals</option>
                      <option value="modelling">Personal Modelling</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-white/50">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    required
                    placeholder="Type your message..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="min-h-32 w-full resize-none rounded-[2rem] border border-white/12 bg-black px-5 py-4 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-0 focus:ring-[#00FFFF]"
                  />
                </div>

                <CtaButton
                  type="submit"
                  disabled={submitting}
                  showArrow={false}
                >
                  {submitting ? "Sending..." : "Send Now"}
                </CtaButton>
              </form>
            </div>
          </div>
        </div>

        {/* 3. Map & Get In Touch Card Section */}
        <div className="mx-auto mt-24 w-full max-w-[1320px]">
          <div className="relative mb-24 pl-12 md:mb-28 md:pl-20">
            <h2 className="font-clash-display text-left text-4xl font-bold leading-[1.12] text-white md:text-6xl lg:text-[64px]">
              <span className="inline-block border-b-2 border-white leading-[0.95]">
                Stay
              </span>{" "}
              <span className="inline-block border-b-2 border-[#00FFFF] leading-[0.95] text-[#00FFFF]">
                Connected
              </span>
              <br />
              <span className="mt-4 inline-block border-b-2 border-white leading-[0.95]">
                with Us
              </span>
            </h2>
            <svg
              className="absolute left-[41%] top-[78%] hidden h-14 w-24 text-[#00FFFF] md:block"
              viewBox="0 0 116 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 20C18 46 48 42 50 18C52 -4 24 6 34 30C42 50 76 58 106 58" />
              <path d="M97 52L107 58L96 63" />
            </svg>
          </div>

          <div className="relative overflow-visible">
            {/* Map representation (Standard colored Google Map Iframe) */}
            <div className="rounded-[32px] overflow-hidden border border-white/10 h-[480px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-black">
              <iframe
                title="Map location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2528082184!2d-74.11976375740332!3d40.697670063273936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1653600000000!5m2!1sen!2sin"
                className="w-full h-full border-none filter invert-[90%] hue-rotate-[180deg] grayscale opacity-80"
                allowFullScreen={false}
                loading="lazy"
              />
            </div>

            {/* Absolute positioned "Get In Touch" Neon Card, overlapping map top-right */}
            <div className="absolute -top-[120px] right-6 md:right-[8%] z-20 w-[calc(100%-3rem)] rounded-[43px] border-[14px] border-black bg-[#00FFFF] p-8 text-black shadow-none md:h-[380px] md:w-[380px] font-geist-reference">
              <h3 className="font-clash-display text-3xl font-bold mb-2 text-center">
                Get In Touch
              </h3>
              <p className="font-geist-reference text-xs font-medium text-center opacity-70 mb-6">
                Got a question? Reach out, and we'll reply soon!!
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-geist-reference text-[22px] font-medium capitalize leading-[1.35]">
                      Address
                    </h4>
                    <p className="font-geist-reference text-[13px] font-normal capitalize leading-[1.45] opacity-80">
                      16117 Manuela Plain, Basilburgh, SD 05289-5886
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-geist-reference text-[22px] font-medium capitalize leading-[1.35]">
                      Phone
                    </h4>
                    <p className="font-geist-reference text-[13px] font-normal capitalize leading-[1.45] opacity-80">
                      +1 (615) 765-7510
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-geist-reference text-[22px] font-medium capitalize leading-[1.35]">
                      Email
                    </h4>
                    <p className="font-geist-reference text-[13px] font-normal capitalize leading-[1.45] opacity-80">
                      Fimik90823@janfab.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

// import { useState, useEffect, useRef } from 'react'
// import { toast } from 'react-toastify'
// import { Mail, MapPin, Phone, Home } from 'lucide-react'
// import CtaButton from './CtaButton'

// const ContactUs = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     service: '',
//     message: ''
//   })
//   const [submitting, setSubmitting] = useState(false)

//   const sectionRef = useRef<HTMLDivElement | null>(null)
//   const canvasRef = useRef<HTMLCanvasElement>(null)

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!formData.name || !formData.email || !formData.message) {
//       toast.error('Please fill in all required fields.')
//       return
//     }
//     setSubmitting(true)
//     setTimeout(() => {
//       toast.success('Your message has been sent successfully!')
//       setFormData({ name: '', email: '', phone: '', service: '', message: '' })
//       setSubmitting(false)
//     }, 1500)
//   }

//   // Interactive Dot Grid Canvas logic (exactly like FeaturesSection/HowItWorks/Explore)
//   useEffect(() => {
//     const section = sectionRef.current
//     const canvas = canvasRef.current
//     const ctxCanvas = canvas?.getContext('2d')
//     if (!section || !canvas || !ctxCanvas) return

//     document.body.style.cursor = 'auto'

//     const dotsGrid: {
//       x: number
//       y: number
//       originalX: number
//       originalY: number
//       size: number
//     }[] = []
//     const spacing = 40
//     const mousePos = { x: section.offsetWidth / 2, y: section.offsetHeight / 2 }
//     let animationFrameId: number

//     const initGrid = () => {
//       dotsGrid.length = 0
//       canvas.width = section.offsetWidth
//       canvas.height = section.offsetHeight

//       for (let x = spacing / 2; x < canvas.width; x += spacing) {
//         for (let y = spacing / 2; y < canvas.height; y += spacing) {
//           dotsGrid.push({ x, y, originalX: x, originalY: y, size: 0.8 })
//         }
//       }
//     }

//     const render = (time: number) => {
//       ctxCanvas.clearRect(0, 0, canvas.width, canvas.height)

//       dotsGrid.forEach((gridDot, i) => {
//         const dx = mousePos.x - gridDot.x
//         const dy = mousePos.y - gridDot.y
//         const dist = Math.sqrt(dx * dx + dy * dy)
//         const maxDist = 200
//         const pulse = Math.sin(time * 0.002 + i * 0.1) * 0.5 + 0.5

//         if (dist < maxDist) {
//           const force = (maxDist - dist) / maxDist
//           gridDot.x = gridDot.originalX - dx * force * 0.15
//           gridDot.y = gridDot.originalY - dy * force * 0.15
//           ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.1 + force * 0.5})`
//           ctxCanvas.beginPath()
//           ctxCanvas.arc(gridDot.x, gridDot.y, gridDot.size + force * 2, 0, Math.PI * 2)
//           ctxCanvas.fill()
//         } else {
//           gridDot.x += (gridDot.originalX - gridDot.x) * 0.1
//           gridDot.y += (gridDot.originalY - gridDot.y) * 0.1
//           ctxCanvas.fillStyle = `rgba(0, 255, 255, ${0.05 + pulse * 0.1})`
//           ctxCanvas.beginPath()
//           ctxCanvas.arc(gridDot.x, gridDot.y, gridDot.size + pulse * 0.5, 0, Math.PI * 2)
//           ctxCanvas.fill()
//         }
//       })

//       animationFrameId = requestAnimationFrame(render)
//     }

//     const handleMouseMove = (e: MouseEvent) => {
//       const rect = section.getBoundingClientRect()
//       const x = e.clientX - rect.left
//       const y = e.clientY - rect.top
//       mousePos.x = x
//       mousePos.y = y
//     }

//     initGrid()
//     animationFrameId = requestAnimationFrame(render)

//     window.addEventListener('resize', initGrid)
//     section.addEventListener('mousemove', handleMouseMove)

//     return () => {
//       document.body.style.cursor = ''
//       cancelAnimationFrame(animationFrameId)
//       window.removeEventListener('resize', initGrid)
//       section.removeEventListener('mousemove', handleMouseMove)
//     }
//   }, [])

//   return (
//     <div ref={sectionRef} className="relative overflow-hidden min-h-screen bg-black text-white pt-20 cursor-auto">
//       {/* Dynamic Background dots canvas */}
//       <canvas
//         ref={canvasRef}
//         className="pointer-events-none absolute inset-0 z-0"
//         style={{ mixBlendMode: 'screen' }}
//       />

//       {/* 1. Header Banner */}
//       <div className="relative z-10 overflow-hidden bg-[#00FFFF] py-12 text-black px-4 sm:px-6 lg:px-8 md:py-16">
//         {/* Large Translucent background text */}
//         <div className="absolute inset-0 flex items-center justify-start pointer-events-none select-none">
//           <span className="text-[18vw] font-extrabold text-black/5 leading-none translate-y-4 font-clash-display uppercase tracking-normal pl-4 md:text-[12vw]">
//             CONTACT
//           </span>
//         </div>

//         <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//           <div>
//             <h1 className="font-clash-display text-4xl font-bold tracking-normal text-black md:text-6xl">
//               Contact Us
//             </h1>
//           </div>
//           {/* Breadcrumbs */}
//           <div className="flex items-center gap-2 text-sm font-semibold font-geist-reference bg-black/5 px-4 py-2 rounded-full backdrop-blur-sm w-fit border border-black/10 text-black/80">
//             <a href="/" className="hover:opacity-70 transition-opacity flex items-center gap-1 text-black">
//               <Home className="w-3.5 h-3.5" /> Home
//             </a>
//             <span className="text-black/60">/</span>
//             <span className="opacity-70 text-black">Contact Us</span>
//           </div>
//         </div>
//       </div>

//       <div className="relative z-10 px-5 pb-12 pt-0 md:pb-16">
//         {/* 2. Main Form Card */}
//         <div
//           className="relative mx-auto mb-14 w-full max-w-[1320px] overflow-hidden rounded-b-[28px] rounded-t-none border border-t-0 border-white/10 bg-[#030405] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.75)] md:p-10 lg:px-[134px] lg:py-12"
//         >
//           <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFFF]/35 to-transparent" />
//           <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">

//             {/* Left side info */}
//             <div className="flex flex-col justify-between text-left">
//               <div className="flex w-full flex-col items-start md:pl-0">
//                 <div className="mb-6 flex items-center gap-3">
//                   {/* Small neon accent */}
//                   {/* <span className="w-1.5 h-6 bg-[#00FFFF] rounded-full" /> */}
//                   {/* <span className="font-geist-reference text-xs font-bold uppercase tracking-[0.28em] text-[#00FFFF]">
//                     Let's Connect
//                   </span> */}
//                 </div>

//                 <h2 className="relative mb-6 pl-6 font-clash-display text-4xl font-semibold leading-[1.22] text-white select-none md:text-5xl lg:text-[40px]">
//                   {/* Decorative hand-drawn sunburst rays (custom SVG matching Figma) */}
//                   <svg
//                     className="absolute -top-7 -left-1 w-8 h-8 text-[#00FFFF]"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                   >
//                     <line x1="8" y1="16" x2="3" y2="11" />
//                     <line x1="12" y1="14" x2="10" y2="5" />
//                     <line x1="15" y1="15" x2="19" y2="8" />
//                     <line x1="16" y1="18" x2="22" y2="17" />
//                   </svg>
//                   Let's <br />
//                   <span className="mt-1 inline-block border-b border-[#00FFFF] pb-0.5 text-[#00FFFF]">Contact</span> <br />
//                   For <br />
//                   <span className="mt-1 inline-block border-b border-[#00FFFF] pb-0.5 text-[#00FFFF]">Better</span> <br />
//                   <span className="mt-1 inline-block border-b border-[#00FFFF] pb-0.5 text-[#00FFFF]">Result</span>
//                 </h2>

//                 {/* Left-aligned wrapper for Vertical Line and Centered Address Block */}
//                 <div className="mt-1 flex w-full max-w-[190px] flex-col items-center md:mt-4">
//                   {/* Thin vertical separator line */}
//                   <div className="h-20 w-[1px] bg-white/20" />

//                   {/* Address & Email info centered relative to the vertical line above it */}
//                   <div className="mt-5 w-full space-y-2 text-center font-geist-reference">
//                     <a
//                       href="mailto:support@shuchiai.com"
//                       className="group relative inline-block pb-0.5 text-sm font-semibold text-white transition-colors hover:text-[#00FFFF] md:text-base"
//                     >
//                       support@shuchiai.com
//                       <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#00FFFF]/30 group-hover:bg-[#00FFFF] transition-colors" />
//                     </a>
//                     <p className="text-xs font-medium leading-relaxed text-white/58">
//                       Monday to Friday, 10:00 AM - 6:00 PM IST<br />Replies within 24-48 hours
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right side form */}
//             <div>
//               <h3 className="mb-6 font-clash-display text-2xl font-bold text-white md:text-3xl">
//                 Contact Us:
//               </h3>

//               <form onSubmit={handleSubmit} className="space-y-4 font-geist-reference">
//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                   <div className="relative">
//                     <input
//                       type="text"
//                       required
//                       placeholder="Name*"
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       className="h-14 w-full rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
//                     />
//                   </div>
//                   <div className="relative">
//                     <input
//                       type="email"
//                       required
//                       placeholder="Email*"
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                       className="h-14 w-full rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                   <div className="relative">
//                     <input
//                       type="tel"
//                       placeholder="Phone"
//                       value={formData.phone}
//                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                       className="h-14 w-full rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
//                     />
//                   </div>
//                   <div className="relative">
//                     <select
//                       value={formData.service}
//                       onChange={(e) => setFormData({ ...formData, service: e.target.value })}
//                       className="h-14 w-full cursor-pointer appearance-none rounded-full border border-white/12 bg-black px-5 text-sm font-medium text-white/82 transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
//                     >
//                       <option value="" disabled>Service*</option>
//                       <option value="photoshoot">Product Photoshoot</option>
//                       <option value="marketing">Marketing Ads Visuals</option>
//                       <option value="modelling">Personal Modelling</option>
//                       <option value="other">Other Inquiry</option>
//                     </select>
//                     {/* Custom dropdown arrow */}
//                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-white/50">
//                       <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
//                         <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="relative">
//                   <textarea
//                     rows={4}
//                     required
//                     placeholder="Type your message..."
//                     value={formData.message}
//                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                     className="min-h-32 w-full resize-none rounded-[2rem] border border-white/12 bg-black px-5 py-4 text-sm font-medium text-white transition-all placeholder:text-white/36 focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
//                   />
//                 </div>

//                 <CtaButton
//                   type="submit"
//                   disabled={submitting}
//                   showArrow={false}
//                 >
//                   {submitting ? 'Sending...' : 'Send Now'}
//                 </CtaButton>
//               </form>
//             </div>

//           </div>
//         </div>

//         {/* 3. Map & Get In Touch Card Section */}
//         <div className="mx-auto mt-24 w-full max-w-[1320px]">
//           <div className="relative mb-24 pl-12 md:mb-28 md:pl-20">
//             <h2 className="font-clash-display text-left text-4xl font-bold leading-[1.12] text-white md:text-6xl lg:text-[64px]">
//               <span className="inline-block border-b-2 border-white leading-[0.95]">Stay</span>{' '}
//               <span className="inline-block border-b-2 border-[#00FFFF] leading-[0.95] text-[#00FFFF]">Connected</span>
//               <br />
//               <span className="mt-4 inline-block border-b-2 border-white leading-[0.95]">with Us</span>
//             </h2>
//             <svg
//               className="absolute left-[41%] top-[78%] hidden h-14 w-24 text-[#00FFFF] md:block"
//               viewBox="0 0 116 70"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               aria-hidden="true"
//             >
//               <path d="M2 20C18 46 48 42 50 18C52 -4 24 6 34 30C42 50 76 58 106 58" />
//               <path d="M97 52L107 58L96 63" />
//             </svg>
//           </div>

//           <div className="relative overflow-visible">
//             {/* Map representation (Standard colored Google Map Iframe) */}
//             <div className="rounded-[32px] overflow-hidden border border-white/10 h-[480px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-black">
//               <iframe
//                 title="Map location"
//                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2528082184!2d-74.11976375740332!3d40.697670063273936!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1653600000000!5m2!1sen!2sin"
//                 className="w-full h-full border-none filter invert-[90%] hue-rotate-[180deg] grayscale opacity-80"
//                 allowFullScreen={false}
//                 loading="lazy"
//               />
//             </div>

//             {/* Absolute positioned "Get In Touch" Neon Card, overlapping map top-right */}
//             <div className="absolute -top-[120px] right-6 md:right-[8%] z-20 w-[calc(100%-3rem)] rounded-[43px] border-[14px] border-black bg-[#00FFFF] p-8 text-black shadow-none md:h-[380px] md:w-[380px] font-geist-reference">
//               <h3 className="font-clash-display text-3xl font-bold mb-2 text-center">Get In Touch</h3>
//               <p className="font-geist-reference text-xs font-medium text-center opacity-70 mb-6">
//                 Got a question? Reach out, and we'll reply soon!!
//               </p>

//               <div className="space-y-4">
//                 <div className="flex items-start gap-3.5">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
//                     <MapPin className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <h4 className="font-geist-reference text-[22px] font-medium capitalize leading-[1.35]">Address</h4>
//                     <p className="font-geist-reference text-[13px] font-normal capitalize leading-[1.45] opacity-80">16117 Manuela Plain, Basilburgh, SD 05289-5886</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3.5">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
//                     <Phone className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <h4 className="font-geist-reference text-[22px] font-medium capitalize leading-[1.35]">Phone</h4>
//                     <p className="font-geist-reference text-[13px] font-normal capitalize leading-[1.45] opacity-80">+1 (615) 765-7510</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3.5">
//                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-white">
//                     <Mail className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <h4 className="font-geist-reference text-[22px] font-medium capitalize leading-[1.35]">Email</h4>
//                     <p className="font-geist-reference text-[13px] font-normal capitalize leading-[1.45] opacity-80">Fimik90823@janfab.com</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default ContactUs
