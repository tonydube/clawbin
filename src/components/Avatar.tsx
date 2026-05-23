"use client";
import Image from "next/image";
import { Author } from "@/types";

interface AvatarProps {
  author: Author;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizes = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-7 h-7 text-[11px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export default function Avatar({ author, size = "md" }: AvatarProps) {
  if (author.avatarUrl) {
    return (
      <Image
        src={author.avatarUrl}
        alt={author.name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
        width={40}
        height={40}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: author.avatarColor }}
      title={author.name}
    >
      {author.initials}
    </div>
  );
}
