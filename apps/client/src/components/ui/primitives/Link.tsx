import React from "react";
import NextLink from "next/link";
import Icon from "./Icon";

export type LinkVariant = "internal" | "external";

export interface LinkProps {
  variant: LinkVariant;
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
}

const baseClasses =
  "text-[--color-primary-500] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-primary-500] rounded-sm transition-colors duration-150";

export default function Link({
  variant,
  href,
  children,
  className,
  prefetch,
  replace,
}: LinkProps) {
  const classes = [
    baseClasses,
    variant === "external" ? "inline-flex items-center gap-1" : "inline",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "internal") {
    return (
      <NextLink href={href} prefetch={prefetch} replace={replace} className={classes}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
      <Icon name="external-link" size="sm" aria-label="(opens in new tab)" />
    </a>
  );
}
