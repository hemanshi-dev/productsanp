// // import { useState, useEffect } from "react";
// // import a1 from "../../assets/images/uifaces-human-avatar (4).jpg"
// // import a2 from "../../assets/images/uifaces-human-avatar (5).jpg"
// // import a3 from "../../assets/images/uifaces-human-avatar (6).jpg"
// // import a4 from "../../assets/images/uifaces-human-avatar (7).jpg"
// // import a5 from "../../assets/images/uifaces-human-avatar (7).jpg"
// // import a6 from "../../assets/images/uifaces-human-avatar (8).jpg"
// // import a7 from "../../assets/images/uifaces-human-avatar (9).jpg"
// // import a8 from "../../assets/images/uifaces-human-avatar (10).jpg"
// // import a9 from "../../assets/images/uifaces-human-avatar (11).jpg"
// // import a10 from "../../assets/images/uifaces-human-avatar (12).jpg"
// // import a11 from "../../assets/images/uifaces-human-avatar (13).jpg"
// // import a12 from "../../assets/images/uifaces-human-avatar (14).jpg"
// // import a13 from "../../assets/images/uifaces-human-avatar (15).jpg"
// // import a14 from "../../assets/images/uifaces-human-avatar (16).jpg"

// // interface AvatarItem {
// //   id: string;
// //   name: string;
// //   image: string;
// //   gender: string;
// //   age: string;
// //   ethnicity: string;
// //   aspectRatio: string;
// // }

// // const AVATARS: AvatarItem[] = [
// //   { id: "oliver", name: "Oliver", image: a1, gender: "Male", age: "24", ethnicity: "Caucasian", aspectRatio: "4:5" },
// //   { id: "sophia", name: "Sophia", image: a2, gender: "Female", age: "27", ethnicity: "Caucasian", aspectRatio: "4:5" },
// //   { id: "matilda", name: "Matilda", image: a3, gender: "Male", age: "29", ethnicity: "Mixed", aspectRatio: "4:5" },
// //   { id: "dominic", name: "Dominic", image: a4, gender: "Female", age: "30", ethnicity: "African", aspectRatio: "4:5" },
// //   { id: "patricia", name: "Patricia", image: a5, gender: "Female", age: "32", ethnicity: "Hispanic", aspectRatio: "4:5" },
// //   { id: "saoirse", name: "Saoirse", image: a6, gender: "Male", age: "23", ethnicity: "Asian", aspectRatio: "4:5" },
// //   { id: "simon", name: "Simon", image: a7, gender: "Female", age: "35", ethnicity: "Caucasian", aspectRatio: "4:5" },
// //   { id: "simon-standing", name: "Simon-Standing-Front View", image: a8, gender: "Female", age: "35", ethnicity: "Caucasian", aspectRatio: "4:5" },
// //   { id: "genev", name: "Genevieve", image: a9, gender: "Male", age: "28", ethnicity: "Hispanic", aspectRatio: "4:5" },
// //   { id: "wendy", name: "Wendy", image: a10, gender: "Female", age: "26", ethnicity: "Asian", aspectRatio: "4:5" },
// //   { id: "adrian", name: "Adrian", image: a11, gender: "Female", age: "29", ethnicity: "Asian", aspectRatio: "4:5" },
// //   { id: "seraphina", name: "Seraphina", image: a12, gender: "Female", age: "31", ethnicity: "Caucasian", aspectRatio: "4:5" },
// //   { id: "kid1", name: "Billy", image: a13, gender: "Male", age: "8", ethnicity: "Caucasian", aspectRatio: "4:5" },
// //   { id: "kid2", name: "Emma", image: a14, gender: "Male", age: "10", ethnicity: "Caucasian", aspectRatio: "4:5" },
// // ];

// // export default function AvatarPage() {
// //   const [search, setSearch] = useState("");
// //   const [activeTab, setActiveTab] = useState("All");
// //   const [currentSlide, setCurrentSlide] = useState(0);
// //   const totalSlides = AVATARS.length;

// //   // Auto-scroll effect
// //   useEffect(() => {
// //     const timer = setInterval(() => {
// //       setCurrentSlide((prev) => (prev + 1) % totalSlides);
// //     }, 5000);
// //     return () => clearInterval(timer);
// //   }, [totalSlides]);

// //   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
// //   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

// //   const filteredAvatars = AVATARS.filter((avatar) => {
// //     const matchesSearch = avatar.name.toLowerCase().includes(search.toLowerCase());
// //     const matchesTab = activeTab === "All" || avatar.gender === activeTab;
// //     return matchesSearch && matchesTab;
// //   });


// //   return (
// //     <div className="min-h-screen bg-black text-white">
// //       <div className="mx-6 mt-6 rounded-[32px] bg-[#000000] overflow-hidden">
// //         <div className="mx-auto max-w-[1400px] px-10 py-20 pb-0 pt-0 pl-0 pr-0">
// //           <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] items-center">
// //             <div className="space-y-10">
// //               <div className="space-y-5">
// //                 <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#00FFFF]">
// //                   My Avatars
// //                 </p>
// //                 <h1 className="text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
// //                   Your avatars,<br />
// //                   <span className="bg-[#00FFFF] bg-clip-text text-transparent">your identity</span>
// //                 </h1>
// //                 <p className="max-w-md text-base leading-relaxed text-slate-400 font-geist-reference">
// //                   Explore your collection of AI-generated avatars or discover curated styles for any vibe or occasion.
// //                 </p>
// //               </div>

// //               {/* <div className="flex items-center gap-4">
// //                 <button className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#12141c] px-7 py-3.5 text-[13px] font-geist-reference font-semibold text-white transition-all hover:bg-[#1a1d29] hover:border-white/20">
// //                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
// //                   Explore public avatars
// //                 </button>
// //               </div> */}
// //             </div>

// //             <div className="relative rounded-[48px] bg-[#0c0d13] p-10 shadow-2xl border border-white/2">
// //               {/* Navigation Arrows */}
// //               <button 
// //                 onClick={prevSlide}
// //                 className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/3 border border-white/10 text-[#00FFFF] backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 active:scale-95 group shadow-lg"
// //               >
// //                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
// //                   <path d="M15 18l-6-6 6-6" />
// //                 </svg>
// //               </button>
              
// //               <button 
// //                 onClick={nextSlide}
// //                 className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/3 border border-white/10 text-[#00FFFF] backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 active:scale-95 group shadow-lg"
// //               >
// //                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
// //                   <path d="M9 18l6-6-6-6" />
// //                 </svg>
// //               </button>

// //               <div className="relative overflow-hidden w-[500px] mx-auto">
// //                 <div 
// //                   className="flex transition-transform duration-1000 ease-in-out gap-8"
// //                   style={{ transform: `translateX(-${currentSlide * (230 + 32)}px)` }}
// //                 >
// //                   {AVATARS.map((avatar, index) => (
// //                     <div key={index} className="shrink-0 w-[230px]">
// //                       <div className="group relative aspect-3/4 overflow-hidden rounded-[32px] border border-white/10 shadow-2xl transition-all duration-700 hover:-translate-y-2">
// //                         <img 
// //                           src={avatar.image} 
// //                           alt={avatar.name} 
// //                           className="h-full w-full object-cover transition-all duration-700 group-hover:scale-110" 
// //                         />
// //                          {/* Subtle overlay for depth */}
// //                          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
              
// //               {/* Slider Meta - 4 Dashes */}
// //               <div className="mt-8 flex items-center justify-center gap-3">
// //                 {[...Array(totalSlides)].map((_, i) => (
// //                   <button
// //                     key={i}
// //                     onClick={() => setCurrentSlide(i)}
// //                     className={`h-1.5 transition-all duration-500 rounded-full ${
// //                       currentSlide === i 
// //                         ? "w-8 bg-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.6)]" 
// //                         : "w-4 bg-white/10 hover:bg-white/20"
// //                     }`}
// //                   />
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <main className="mx-auto">
// //         <section className="mt-8 rounded-[32px] ml-5 mr-8 pr-0 pl-0 p-6">
// //           <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
// //             <div className="flex items-center gap-8">
// //               <div className="flex items-center gap-1 bg-white/3 backdrop-blur-md p-1.5 rounded-3xl border border-white/5">
// //                 {["All", "Male", "Female", "Kids"].map((tab) => (
// //                   <button
// //                     key={tab}
// //                     onClick={() => setActiveTab(tab)}
// //                     className={`px-5 py-2 rounded-3xl text-xs font-bold tracking-wide transition-all duration-300 ${
// //                       activeTab === tab 
// //                         ? "bg-[#00FFFF] text-black shadow-[0_8px_16px_-6px_rgba(0,255,255,0.3)] scale-[1.02]" 
// //                         : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-95"
// //                     }`}
// //                   >
// //                     {tab}
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>
// //             <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
// //               <div className="relative w-full max-w-sm">
// //                 <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="none">
// //                   <path d="M8.5 14A5.5 5.5 0 1 1 14 8.5 5.506 5.506 0 0 1 8.5 14Zm7.5 5-4.5-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
// //                 </svg>
// //                 <input
// //                   type="search"
// //                   value={search}
// //                   onChange={(event) => setSearch(event.target.value)}
// //                   placeholder="Search variations..."
// //                   className="w-full rounded-2xl border border-white/10 bg-[#0c0d13] py-3.5 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-[#00FFFF]/40 focus:ring-4 focus:ring-[#00FFFF]/10"
// //                 />
// //               </div>
// //             </div>
// //           </div>

          

// //           <div className="mt-8 grid gap-3 sm:grid-cols-5 xl:grid-cols-6">
// //             {filteredAvatars.length > 0 ? (
// //               filteredAvatars.map((avatar) => (
// //                 <div key={avatar.id} className="group">
// //                   <article className="relative aspect-3/4 overflow-hidden rounded-xl transition-all duration-300">
// //                     <img
// //                       src={avatar.image}
// //                       alt={avatar.name}
// //                       className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
// //                     />

// //                     {/* Star toggle icon at top right */}
                    
// //                     {/* Hover Overlay */}
// //                     <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ">
// //                       <div className="flex gap-2">
// //                         <button className="flex-1 rounded-3xl bg-black px-3 py-2 text-[14px] font-bold text-[#00FFFF] transition ">
// //                           Create with AI
// //                         </button>
// //                         {/* <button className="h-9 w-9 flex items-center justify-center rounded-lg bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20">
// //                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
// //                         </button> */}
// //                       </div>
// //                     </div>
// //                   </article>
// //                   <p className="mt-3 text-center text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
// //                     {avatar.name}
// //                   </p>
// //                 </div>
// //               ))
// //             ) : (
// //               <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-slate-950/70 p-12 text-center text-slate-400">
// //                 No avatars match these filters. Try a different search or filter.
// //               </div>
// //             )}
// //           </div>
// //         </section>
// //       </main>
// //     </div>
// //   );
// // }





// import { useState, useEffect } from "react";
// import a1 from "../../assets/images/uifaces-human-avatar (4).jpg"
// import a2 from "../../assets/images/uifaces-human-avatar (5).jpg"
// import a3 from "../../assets/images/uifaces-human-avatar (6).jpg"
// import a4 from "../../assets/images/uifaces-human-avatar (7).jpg"
// import a5 from "../../assets/images/uifaces-human-avatar (7).jpg"
// import a6 from "../../assets/images/uifaces-human-avatar (8).jpg"
// import a7 from "../../assets/images/uifaces-human-avatar (9).jpg"
// import a8 from "../../assets/images/uifaces-human-avatar (10).jpg"
// import a9 from "../../assets/images/uifaces-human-avatar (11).jpg"
// import a10 from "../../assets/images/uifaces-human-avatar (12).jpg"
// import a11 from "../../assets/images/uifaces-human-avatar (13).jpg"
// import a12 from "../../assets/images/uifaces-human-avatar (14).jpg"
// import a13 from "../../assets/images/uifaces-human-avatar (15).jpg"
// import a14 from "../../assets/images/uifaces-human-avatar (16).jpg"

// interface AvatarItem {
//   id: string;
//   name: string;
//   image: string;
//   gender: string;
//   age: string;
//   ethnicity: string;
//   aspectRatio: string;
// }

// const AVATARS: AvatarItem[] = [
//   { id: "oliver", name: "Oliver", image: a1, gender: "Male", age: "24", ethnicity: "Caucasian", aspectRatio: "4:5" },
//   { id: "sophia", name: "Sophia", image: a2, gender: "Female", age: "27", ethnicity: "Caucasian", aspectRatio: "4:5" },
//   { id: "matilda", name: "Matilda", image: a3, gender: "Male", age: "29", ethnicity: "Mixed", aspectRatio: "4:5" },
//   { id: "dominic", name: "Dominic", image: a4, gender: "Female", age: "30", ethnicity: "African", aspectRatio: "4:5" },
//   { id: "patricia", name: "Patricia", image: a5, gender: "Female", age: "32", ethnicity: "Hispanic", aspectRatio: "4:5" },
//   { id: "saoirse", name: "Saoirse", image: a6, gender: "Male", age: "23", ethnicity: "Asian", aspectRatio: "4:5" },
//   { id: "simon", name: "Simon", image: a7, gender: "Female", age: "35", ethnicity: "Caucasian", aspectRatio: "4:5" },
//   { id: "simon-standing", name: "Simon-Standing-Front View", image: a8, gender: "Female", age: "35", ethnicity: "Caucasian", aspectRatio: "4:5" },
//   { id: "genev", name: "Genevieve", image: a9, gender: "Male", age: "28", ethnicity: "Hispanic", aspectRatio: "4:5" },
//   { id: "wendy", name: "Wendy", image: a10, gender: "Female", age: "26", ethnicity: "Asian", aspectRatio: "4:5" },
//   { id: "adrian", name: "Adrian", image: a11, gender: "Female", age: "29", ethnicity: "Asian", aspectRatio: "4:5" },
//   { id: "seraphina", name: "Seraphina", image: a12, gender: "Female", age: "31", ethnicity: "Caucasian", aspectRatio: "4:5" },
//   { id: "kid1", name: "Billy", image: a13, gender: "Male", age: "8", ethnicity: "Caucasian", aspectRatio: "4:5" },
//   { id: "kid2", name: "Emma", image: a14, gender: "Male", age: "10", ethnicity: "Caucasian", aspectRatio: "4:5" },
// ];

// // Only 4 trending avatars shown in the hero carousel
// const TRENDING_AVATARS = AVATARS.filter(a =>
//   ["oliver", "sophia", "wendy", "seraphina"].includes(a.id)
// );

// export default function AvatarPage() {
//   const [search, setSearch] = useState("");
//   const [activeTab, setActiveTab] = useState("All");
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const totalSlides = TRENDING_AVATARS.length;

//   // Auto-scroll effect
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % totalSlides);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, [totalSlides]);

//   const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
//   const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

//   const filteredAvatars = AVATARS.filter((avatar) => {
//     const matchesSearch = avatar.name.toLowerCase().includes(search.toLowerCase());
//     const matchesTab = activeTab === "All" || avatar.gender === activeTab;
//     return matchesSearch && matchesTab;
//   });

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* ── Hero Section ── */}
//       <div className="mx-3 sm:mx-4 lg:mx-6 mt-4 sm:mt-6 rounded-[24px] sm:rounded-[32px] bg-[#000000] overflow-hidden">
//         <div className="mx-auto max-w-[1400px]">
//           <div className="grid gap-8 lg:gap-16 lg:grid-cols-[1fr_1.2fr] items-center p-4 sm:p-6 lg:p-0">

//             {/* Left: Text */}
//             <div className="space-y-6 lg:space-y-10 lg:pl-10 lg:py-10">
//               <div className="space-y-3 sm:space-y-5">
//                 <p className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.24em] text-[#00FFFF]">
//                   My Avatars
//                 </p>
//                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
//                   Your avatars,<br />
//                   <span className="bg-[#00FFFF] bg-clip-text text-transparent">your identity</span>
//                 </h1>
//                 <p className="max-w-md text-sm sm:text-base leading-relaxed text-slate-400 font-geist-reference">
//                   Explore your collection of AI-generated avatars or discover curated styles for any vibe or occasion.
//                 </p>
//               </div>
//             </div>

//             {/* Right: Carousel */}
//             <div className="relative rounded-[32px] sm:rounded-[48px] bg-[#030405] p-5 sm:p-8 lg:p-10 shadow-2xl border border-white/2">
//               {/* Prev Arrow */}
//               <button
//                 onClick={prevSlide}
//                 className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/3 border border-white/10 text-[#00FFFF] backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 active:scale-95 shadow-lg"
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M15 18l-6-6 6-6" />
//                 </svg>
//               </button>

//               {/* Next Arrow */}
//               <button
//                 onClick={nextSlide}
//                 className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/3 border border-white/10 text-[#00FFFF] backdrop-blur-md transition-all hover:bg-white/10 hover:scale-110 active:scale-95 shadow-lg"
//               >
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M9 18l6-6-6-6" />
//                 </svg>
//               </button>

//               {/* Slides */}
//               <div className="relative overflow-hidden w-full max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto">
//                 <div
//                   className="flex transition-transform duration-1000 ease-in-out gap-4 sm:gap-6 lg:gap-8"
//                   style={{ transform: `translateX(-${currentSlide * (160 + 16)}px)` }}
//                 >
//                   {TRENDING_AVATARS.map((avatar, index) => (
//                     <div key={index} className="shrink-0 w-[150px] sm:w-[180px] lg:w-[230px]">
//                       <div className="group relative aspect-3/4 overflow-hidden rounded-[24px] sm:rounded-[32px] border border-white/10 shadow-2xl transition-all duration-700">
//                         <img
//                           src={avatar.image}
//                           alt={avatar.name}
//                           className="h-full w-full object-cover transition-all duration-700"
//                         />
//                         <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Dots */}
//               <div className="mt-5 sm:mt-8 flex items-center justify-center gap-2 sm:gap-3">
//                 {TRENDING_AVATARS.map((_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => setCurrentSlide(i)}
//                     className={`h-1.5 transition-all duration-500 rounded-full ${
//                       currentSlide === i
//                         ? "w-6 sm:w-8 bg-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.6)]"
//                         : "w-3 sm:w-4 bg-white/10 hover:bg-white/20"
//                     }`}
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Grid Section ── */}
//       <main className="mx-auto">
//         <section className="mt-4 sm:mt-6 lg:mt-8 rounded-[24px] sm:rounded-[32px] ">

//           {/* Filters + Search */}
//           <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
//             {/* Tabs */}
//             <div className="flex items-center gap-1 bg-[#030405] backdrop-blur-md p-1 sm:p-1.5 rounded-3xl border border-white/5 w-fit">
//               {["All", "Male", "Female", "Kids"].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-3xl text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 ${
//                     activeTab === tab
//                       ? "bg-[#00FFFF] text-black shadow-[0_8px_16px_-6px_rgba(0,255,255,0.3)] scale-[1.02]"
//                       : "text-slate-400 hover:text-white hover:bg-white/5 active:scale-95"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>

//             {/* Search */}
//             <div className="relative w-full sm:max-w-sm">
//               <svg className="pointer-events-none absolute left-3 sm:left-4 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 20 20" fill="none">
//                 <path d="M8.5 14A5.5 5.5 0 1 1 14 8.5 5.506 5.506 0 0 1 8.5 14Zm7.5 5-4.5-4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
//               </svg>
//               <input
//                 type="search"
//                 value={search}
//                 onChange={(event) => setSearch(event.target.value)}
//                 placeholder="Search variations..."
//                 className="w-full rounded-2xl border border-white/10 bg-[#030405] py-3 pl-10 sm:pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-[#00FFFF]/40 focus:ring-4 focus:ring-[#00FFFF]/10"
//               />
//             </div>
//           </div>

//           {/* Avatar Grid */}
//           <div className="mt-5 sm:mt-8 grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
//             {filteredAvatars.length > 0 ? (
//               filteredAvatars.map((avatar) => (
//                 <div key={avatar.id} className="group">
//                   <article className="relative aspect-3/4 overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300">
//                     <img
//                       src={avatar.image}
//                       alt={avatar.name}
//                       className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
//                     />
//                     {/* Hover Overlay */}
//                     <div className="absolute inset-0 z-10 flex flex-col justify-end p-2 sm:p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
//                       <div className="flex gap-2">
//                         <button className="flex-1 rounded-3xl bg-black px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-[14px] font-bold text-[#00FFFF] transition">
//                           Create with AI
//                         </button>
//                       </div>
//                     </div>
//                   </article>
//                   <p className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs font-medium text-slate-400 group-hover:text-white transition-colors">
//                     {avatar.name}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <div className="col-span-full rounded-[28px] border border-dashed border-white/10 bg-slate-950/70 p-8 sm:p-12 text-center text-slate-400 text-sm">
//                 No avatars match these filters. Try a different search or filter.
//               </div>
//             )}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import AvatarPage from "./AvatarPage";
import logo from "../../assets/images/logo2.png"
import CtaButton from "../CtaButton";
import { HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import f1 from "../../assets/images/f1.png";
import f2 from "../../assets/images/f2.png";
import f3 from "../../assets/images/f3.png";
import f4 from "../../assets/images/f4.png";
import f5 from "../../assets/images/f4.png";
import aiImage from "../../assets/images/bg-main.png"


// ─── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  icon: string;
  label: string;
  id: string;
}

interface HeroCard {
  id: string;
  title: string;
  highlight: string;
  subtitle: string;
}

interface ToolCard {
  id: string;
  icon: string;
  label: string;
  hoverLabel: string;
  iconBg: string;
}

interface InspoCard {
  id: number;
  image: string;
  title: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { icon: "fi fi-rr-home", label: "Home", id: "home" },
];

const ASSET_ITEMS: NavItem[] = [
  { icon: "fi fi-rr-add-image", label: "My Creations", id: "creations" },
  { icon: "fi fi-tr-circle-user", label: "Avatars", id: "avatars" },
];

const HERO_CARDS = [
  {
    id: "image",
    title: "Generate ",
    highlight: "AI Image",
    subtitle: "Create stunning visuals from your imagination in just a few seconds with AI.",
  },
];

const TOOL_CARDS: (ToolCard & {arrowColor: string })[] = [
  {
    id: "product",
    icon: "fi fi-rr-camera",
    label: "Product Photography",
    hoverLabel: "AI product photo",
    iconBg: "bg-cyan-500/10",
    arrowColor: "text-cyan-400",
  },
  {
    id: "marketing",
    icon: "fi fi-tr-megaphone",
    label: "Marketing Banner",
    hoverLabel: "Design eye-catching banners",
    iconBg: "bg-cyan-500/10",
    arrowColor: "text-cyan-400",
  },
  {
    id: "popular",
    icon: "fi fi-tr-fire-flame-curved",
    label: "Popular Images",
    hoverLabel: "Explore trending creations",
    iconBg: "bg-cyan-500/10",
    arrowColor: "text-cyan-400",
  },
];

const INSPO_CARDS: InspoCard[] = [
  { id: 1, image: f1, title: "Hand-Drawn Illustration"},
  { id: 2, image: f2, title: "Elegant Product Shot"},
  { id: 3, image: f3, title: "Fashion Portrait" },
  { id: 4, image: f4, title: "Premium Packaging" },
  { id: 5, image: f5, title: "Lifestyle Scene"},
  { id: 6, image: f5, title: "Creative Mockup" },
  { id: 7, image: f5, title: "Studio Poster"},
  { id: 8, image: f5, title: "Luxury Still Life" },
  { id: 9, image: f5, title: "Minimal Display" },
  { id: 10, image: f5, title: "Premium Creator"},
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  active,
  onClick,
  disabled = false,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 font-geist-reference py-4 rounded-xl text-md font-medium transition-all duration-200 text-left relative overflow-hidden group
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${active
          ? "bg-[#161618] text-white shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]"
          : !disabled 
            ? "text-slate-300 hover:bg-[#111113] hover:text-white" 
            : "text-slate-200"
        }`}
    >
      <span className={`w-5 flex items-center justify-center text-xl text-white transition-transform duration-200 ${!disabled && !active ? "group-hover:scale-110" : ""}`}>
        <i className={`${item.icon} leading-none`}></i>
      </span>
      <span className="relative z-10">{item.label}</span>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-r-full" />
      )}
    </button>
  );
}

function Sidebar({
  activeNav,
  setActiveNav,
  isAuthenticated,
  onLoginClick,
  isOpen,
  onClose,
}: {
  activeNav: string;
  setActiveNav: (id: string) => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  const handleNavClick = (id: string) => {
    if (id === "creations") {
      if (!isAuthenticated) {
        onLoginClick();
        return;
      }
      navigate("/gallery");
      onClose();
      return;
    }
    setActiveNav(id);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-[250px] bg-[#030405] border-r border-white/[0.07] flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-5 border-b border-white/[0.07]">
          <span className="font-black text-lg tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            <img src={logo} alt="Stotage Logo" className="w-full h-auto" />
          </span>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Create Button */}
        <div className="px-4 pt-5 pb-2">
          <CtaButton
            onClick={() => {
              if (!isAuthenticated) {
                onLoginClick();
              } else {
                navigate("/app");
              }
              onClose();
            }}
            size="sm"
            showArrow={false}
            className="w-full justify-between font-geist-reference"
            icon={<HiPlus className="w-4 h-4" />}
          >
            Create
          </CtaButton>
        </div>

        {/* Main Nav */}
        <nav className="px-3 py-3 flex flex-col gap-0.5 font-geist-reference">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={activeNav === item.id}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </nav>

        {/* Assets */}
        <div className="px-3 pb-2">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.14em] text-slate-500">Assets</p>
          {ASSET_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.id}
              item={item}
              active={activeNav === item.id}
              disabled={item.id === "creations" && !isAuthenticated}
              onClick={() => handleNavClick(item.id)}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function Topbar({
  isAuthenticated,
  user,
  onLoginClick,
  onMenuClick,
}: {
  isAuthenticated: boolean;
  user: any;
  onLoginClick: () => void;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-2.5 pt-5 pb-5 px-4 sm:px-6 py-2.5 bg-black/60 backdrop-blur-xl border-b border-white/3 font-geist-reference">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Mobile logo — center on mobile */}
      <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
        <img src={logo} alt="Logo" className="h-6 w-auto" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {isAuthenticated ? (
          <>
            <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-purple-600 to-blue-600 text-white text-xm font-semibold transition-opacity hover:opacity-90">
              ⚡ Upgrade
            </button>
            <div className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xm font-bold">
              ◆ {user?.credits ?? 0}
            </div>
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 cursor-pointer" />
            )}
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="hero-cta-btn hero-cta-btn--sm w-[80px]"
          >
            <span className="hero-cta-btn-label font-geist-reference">Login</span>
          </button>
        )}
      </div>
    </header>
  );
}

function ToolCardComponent({ card }: { card: ToolCard & { arrowColor: string } }) {
  const navigate = useNavigate();
  const glowColor = '#06b6d4';

  return (
    <button
      onClick={() => navigate('/app')}
      className="relative h-[100px] sm:h-[110px] lg:h-[126px] w-full rounded-[20px] sm:rounded-[26px] text-left isolate overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1.5px solid ${glowColor}65`,
        boxShadow: `
          inset 0 0 40px ${glowColor}18,
          inset 0 1px 0 rgba(255,255,255,0.15),
          inset 0 -1px 0 ${glowColor}30,
          inset 1px 0 0 ${glowColor}12,
          inset -1px 0 0 ${glowColor}12
        `,
      }}
    >
      {/* Top specular highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-[40%] rounded-t-[20px] sm:rounded-t-[26px] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.11) 0%, transparent 100%)' }}
      />
      {/* Inner depth vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none"
        style={{ background: `linear-gradient(0deg, ${glowColor}12 0%, transparent 100%)` }}
      />
      {/* Ambient neon bloom */}
      <div
        className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full -z-10 pointer-events-none"
        style={{ background: glowColor, filter: 'blur(55px)', opacity: 0.28 }}
      />
      {/* Bottom neon edge line */}
      <div
        className="absolute bottom-0 left-10 right-10 h-[2px] pointer-events-none"
        style={{ background: `linear-gradient(to right, transparent, ${glowColor}BB, transparent)`, filter: 'blur(3px)', opacity: 0.85 }}
      />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-4 sm:px-7 gap-3 sm:gap-5">
        {/* Icon box */}
        <div className="relative shrink-0">
          <div
            className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] lg:w-[62px] lg:h-[62px] rounded-[14px] sm:rounded-[16px] flex items-center justify-center text-[20px] sm:text-[24px] lg:text-[26px]"
            style={{
              border: `1.5px solid ${glowColor}CC`,
              boxShadow: `0 0 6px 1px ${glowColor}70, 0 0 12px 2px ${glowColor}35, inset 0 0 6px 1px ${glowColor}40, inset 0 1px 0 ${glowColor}80`,
            }}
          >
            <i className={card.icon} style={{ marginTop: "5px" }}></i>
          </div>
          <div
            className="absolute inset-0 rounded-[16px] -z-10 pointer-events-none"
            style={{ background: glowColor, filter: 'blur(20px)', opacity: 0.25 }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[13px] sm:text-[15px] lg:text-[18px] font-geist-reference font-bold text-white tracking-tight leading-snug">
            {card.label}
          </span>
          <span className="hidden sm:block text-[11px] lg:text-[13px] font-geist-reference mt-1 font-normal text-slate-400">
            {card.hoverLabel}
          </span>
        </div>

        {/* Arrow */}
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0"
          style={{
            border: `1.5px solid ${glowColor}70`,
            boxShadow: `0 0 14px ${glowColor}35, inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 10px ${glowColor}20`,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={glowColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function HeroCardComponent({ card }: { card: HeroCard }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] lg:rounded-[48px] w-full group border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] isolate flex flex-col justify-between min-h-[380px] sm:min-h-[440px] lg:min-h-auto">
      {/* Background Image */}
      <img
        src={aiImage}
        alt="Cosmic Portal"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-3000"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-[#030405] via-[#030405]/80 to-transparent flex flex-col justify-between" />

      {/* Floating Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px] animate-pulse"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.5}s`, opacity: 0.3 }}
          />
        ))}
        <div className="absolute bottom-[160px] left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent blur-sm" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-12 space-y-5 lg:space-y-7">
        <div className="space-y-3 lg:space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-white leading-[1.05] transition-transform duration-700">
            {card.title}
            <span className="bg-linear-to-r from-cyan-400 via-cyan-200 to-cyan-400 bg-clip-text pl-2 text-transparent drop-shadow-[0_0_15px_rgba(0,255,255,0.3)] bg-size-[200%_auto] animate-gradient">
              {card.highlight}
            </span>
          </h1>
          <p className="text-slate-400 font-geist-reference text-sm sm:text-base lg:text-lg leading-relaxed max-w-md font-medium opacity-90">
            {card.subtitle}
          </p>
        </div>
      </div>

      {/* Tool Cards */}
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
          {TOOL_CARDS.map((tool) => (
            <ToolCardComponent key={tool.id} card={tool} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InspoCardComponent({ card, index }: { card: InspoCard; index: number }) {
  const heights = [
    'h-[220px] sm:h-[280px] lg:h-[320px]',
    'h-[280px] sm:h-[340px] lg:h-[400px]',
    'h-[200px] sm:h-[240px] lg:h-[280px]',
    'h-[250px] sm:h-[300px] lg:h-[360px]',
    'h-[210px] sm:h-[260px] lg:h-[300px]',
    'h-[270px] sm:h-[320px] lg:h-[380px]',
    'h-[190px] sm:h-[220px] lg:h-[260px]',
    'h-[240px] sm:h-[290px] lg:h-[340px]',
    'h-[290px] sm:h-[360px] lg:h-[420px]',
    'h-[200px] sm:h-[250px] lg:h-[290px]',
  ];
  const heightClass = heights[index % heights.length];

  return (
    <div className={`group relative z-0 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 mb-3 break-inside-avoid ${heightClass}`}>
      <img
        src={card.image}
        alt={`Inspiration ${card.id}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
        style={{ transformOrigin: 'center center' }}
      />
      <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />

      <div className="absolute left-2 right-2 sm:left-3 sm:right-3 bottom-2 sm:bottom-3 z-20 opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-black/75 backdrop-blur-xl px-3 sm:px-4 py-2 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex flex-col gap-0.5">
            <p className="text-xs sm:text-sm font-semibold text-white truncate leading-snug">
              {card.title}
            </p>
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-black transition-all duration-200 shadow-[0_4px_14px_rgba(0,255,255,0.35)] shrink-0"
          >
            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Remix it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OpenStudio({
  isAuthenticated = false,
  user = null,
  onLoginClick = () => {}
}: {
  isAuthenticated?: boolean;
  user?: any;
  onLoginClick?: () => void;
}) {
  const [activeNav, setActiveNav] = useState<string>(() => {
    const saved = localStorage.getItem("openstudio-activeNav");
    return saved || "home";
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("openstudio-activeNav", activeNav);
  }, [activeNav]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAvatarPage = activeNav === "avatars";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');`}</style>

      <div className="min-h-screen bg-[#0b0d14] text-white flex">
        <Sidebar
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          isAuthenticated={isAuthenticated}
          onLoginClick={onLoginClick}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <div className="ml-0 lg:ml-[250px] flex-1 flex flex-col min-h-screen">
          <Topbar
            isAuthenticated={isAuthenticated}
            user={user}
            onLoginClick={onLoginClick}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="p-0 pl-2 sm:pl-3 lg:pl-4 ml-0 pr-2 sm:pr-3 lg:pr-4 pt-0 flex-1 bg-black">
            {isAvatarPage ? (
              <AvatarPage />
            ) : (
              <>
                {/* Hero Banner */}
                <div className="grid grid-cols-1 mb-4 sm:mb-6 lg:mb-8">
                  {HERO_CARDS.map((card) => (
                    <HeroCardComponent key={card.id} card={card} />
                  ))}
                </div>

                {/* Inspiration Hub */}
                <div className="flex items-end justify-between mb-3 sm:mb-4">
                  <div>
                    <span className="block text-[12px] sm:text-[14px] uppercase tracking-widest text-cyan-400 mb-1.5">
                      Inspiration Hub
                    </span>
                  </div>
                </div>

                <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3">
                  {INSPO_CARDS.map((card, index) => (
                    <InspoCardComponent key={card.id} card={card} index={index} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
