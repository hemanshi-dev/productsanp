import { ArrowUpRight, Handshake, Mail, MapPin } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { GrInstagram } from "react-icons/gr";
import { TiSocialFacebook, TiSocialLinkedin } from "react-icons/ti";
import { Link } from "react-router-dom";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: TiSocialFacebook,
    size: 22,
  },
  { label: "X", href: "https://x.com/", icon: FaXTwitter, size: 15 },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: GrInstagram,
    size: 16,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/",
    icon: TiSocialLinkedin,
    size: 22,
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#00FFFF] px-6 pt-14 text-[#00020F] md:px-10 md:pt-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-12 md:grid-cols-[1fr_420px] md:items-center lg:gap-20">
          <div className="max-w-[680px]">
            <p className="font-geist-reference text-lg font-semibold leading-none text-[#00020F]/80 md:text-2xl">
              Reach Out
            </p>
            <h2 className="mt-5 font-heading text-[42px] font-bold leading-[1.05] tracking-normal text-[#00020F] sm:text-5xl md:text-[64px]">
              Let&apos;s Bring Ideas to Life.
            </h2>

            <div className="mt-14 space-y-0 md:mt-20">
              <a
                href="mailto:example@xyz.com"
                className="group flex items-center gap-6 border-t border-[#00020F]/40 py-8 transition-colors hover:text-[#00020F]/70"
              >
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#00020F] text-white">
                  <Mail size={26} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block font-geist-reference text-base font-semibold text-[#00020F]/55">
                    Email
                  </span>
                  <span className="mt-1 block font-geist-reference text-lg font-semibold leading-tight text-[#00020F]">
                    example@xyz.com
                  </span>
                </span>
              </a>

              <div className="flex items-center gap-6 border-y border-[#00020F]/40 py-8">
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#00020F] text-white">
                  <MapPin size={27} strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block font-geist-reference text-base font-semibold text-[#00020F]/55">
                    Location
                  </span>
                  <span className="mt-1 block font-geist-reference text-lg font-semibold leading-tight text-[#00020F]">
                    4236 Devils Hill Road, MS 39211
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center md:items-center">
            <Link
              to="/contact-us"
              aria-label="Contact ProductSnap AI"
              className="group relative isolate flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full bg-[#00020F] text-white transition-all duration-500 hover:-translate-y-2 hover:text-white hover:shadow-[0_0_0_10px_rgba(0,2,15,0.16)] sm:h-[220px] sm:w-[220px]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-[10px] rounded-full bg-[#00020F] opacity-0 scale-75 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-100"
              />
              <ArrowUpRight
                size={92}
                strokeWidth={1.2}
                className="relative z-10"
              />
            </Link>
            <Link
              to="/contact-us"
              className="mt-8 inline-flex items-center gap-2 font-geist-reference text-xl font-bold text-[#00020F] transition-colors hover:text-[white]"
            >
              <Handshake
                size={22}
                strokeWidth={2}
                aria-hidden="true"
                className="text-[#00020F]"
              />
              Let&apos;s Connect
            </Link>
          </div>
        </div>

        <div className="mt-16 border-t border-[#00020F]/45 py-8 md:mt-20">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <p className="font-geist-reference text-sm font-semibold text-[#00020F]">
              Powered by{" "}
              <a
                href="https://developerinfotech.com/"
                target="_blank"
                rel="noopener noreferrer"
                className=" transition-colors hover:text-[white]"
              >
                Developer Infotech.
              </a>
            </p>

            <p className="font-geist-reference text-sm font-semibold text-[#00020F]">
              Copyright &copy; {year} ProductSnap AI. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/privacy-policy"
                className="font-geist-reference text-sm font-semibold text-[#00020F]  transition-colors hover:text-[white]/100"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms-and-conditions"
                className="font-geist-reference text-sm font-semibold text-[#00020F]  transition-colors hover:text-[white]/100"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
