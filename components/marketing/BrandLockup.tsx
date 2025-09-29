"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {
  href?: string;
  showTitle?: boolean;
  showSlogan?: boolean;
  title?: string;
  slogan?: string;
  layout?: "row" | "column" | "responsive";
  align?: "start" | "center" | "end";
  minSize?: number;
  maxSize?: number;
  className?: string;
  imgSrc?: string;
  imgAlt?: string;
};

export default function BrandLockup({
  href = "/",
  showTitle = true,
  showSlogan = true,
  title = "NextYou>",
  slogan = "Ton futur, version toi",
  layout = "column",
  align = "start",
  minSize = 64,
  maxSize = 120,
  className = "",
  imgSrc = "/brand/nextyou-logo.png",
  imgAlt = "NextYou>",
}: Props) {
  const [ok, setOk] = useState(true);

  const sizeStyle = {
    width: `clamp(${minSize}px, 6vw, ${maxSize}px)`,
    height: `clamp(${minSize}px, 6vw, ${maxSize}px)`,
  };

  const dir =
    layout === "column"
      ? "flex-col"
      : layout === "responsive"
        ? "flex-col md:flex-row"
        : "flex-row";

  const alignCls =
    align === "center" ? "items-center" : align === "end" ? "items-end" : "items-start";
  const textAlign = align === "center" ? "text-center" : align === "end" ? "text-right" : "text-left";
  const textAlignFlex = align === "center" ? "items-center" : align === "end" ? "items-end" : "items-start";

  return (
    <Link
      href={href}
      className={`flex gap-2 ${dir} ${alignCls} ${className}`}
      aria-label={`${title} - ${slogan}`}
    >
      {ok ? (
        <Image
          src={imgSrc}
          alt={imgAlt}
          width={256}
          height={256}
          priority
          unoptimized
          style={sizeStyle}
          onError={() => setOk(false)}
        />
      ) : (
        <div
          className="grid place-items-center rounded bg-white/90 text-xs font-bold text-slate-900"
          style={sizeStyle}
        >
          N
        </div>
      )}

      {(showTitle || showSlogan) && (
        <div
          className={`flex flex-col gap-1 ${layout !== "row" ? "mt-1" : ""} ${textAlign} ${textAlignFlex}`}
        >
          {showTitle && (
            <div className="text-[18px] font-extrabold leading-tight tracking-tight text-white md:text-[22px]">
              {title}
            </div>
          )}
          {showSlogan && (
            <div className="text-[12px] leading-relaxed text-white/75 md:text-[14px]">{slogan}</div>
          )}
        </div>
      )}
    </Link>
  );
}