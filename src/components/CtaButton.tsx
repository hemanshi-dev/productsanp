import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { Link, type LinkProps } from "react-router-dom";

type CtaButtonBaseProps = {
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
  size?: "default" | "sm";
  icon?: ReactNode;
  variant?: "default" | "black";
};

type CtaButtonAsButton = CtaButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type CtaButtonAsAnchor = CtaButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a";
  };

type CtaButtonAsLink = CtaButtonBaseProps &
  Omit<LinkProps, "className" | "children"> & {
    as?: "link";
  };

type CtaButtonProps = CtaButtonAsButton | CtaButtonAsAnchor | CtaButtonAsLink;

const CtaButton = ({
  children,
  className = "",
  showArrow = true,
  size = "default",
  as = "button",
  icon,
  variant = "default",
  ...props
}: CtaButtonProps) => {
  const classes = [
    "hero-cta-btn",
    "font-geist-reference",
    size === "sm" ? "hero-cta-btn--sm" : "",
    variant === "black" ? "hero-cta-btn--black" : "",
    (!showArrow && !icon) ? "hero-cta-btn--no-arrow" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="hero-cta-btn-label">{children}</span>
      {(showArrow || icon) && (
        <span className="hero-cta-btn-icon" aria-hidden="true">
          {icon ? (
            icon
          ) : (
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      )}
    </>
  );

  if (as === "a") {
    const anchorProps = props as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  if ("to" in props) {
    const linkProps = props as Omit<LinkProps, "className" | "children">;
    return (
      <Link className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } =
    props as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
};

export default CtaButton;
