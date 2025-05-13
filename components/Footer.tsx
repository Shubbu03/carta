"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  IconSun,
  IconMoon,
  IconHistory,
  IconDownload,
} from "@tabler/icons-react";

interface FooterProps {
  fontSize: string;
  fontFamily: string;
  fontFamilies: string[];
  toggleFontSize: () => void;
  toggleFontFamily: (font: SetStateAction<string>) => void;
  createNewDocument: () => void;
  downloadAsPdf: () => void;
  toggleHistory: () => void;
}

export default function Footer({
  fontSize,
  fontFamily,
  fontFamilies,
  toggleFontSize,
  toggleFontFamily,
  createNewDocument,
  downloadAsPdf,
  toggleHistory,
}: FooterProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleFontSize}
          className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
        >
          {fontSize}
        </button>
        <span>•</span>

        {fontFamilies.map((font, index) => (
          <>
            <button
              key={font}
              onClick={() => toggleFontFamily(font)}
              className={`hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer ${
                fontFamily === font ? "text-blue-500" : ""
              }`}
            >
              {font}
            </button>
            {index < fontFamilies.length - 1 && <span>•</span>}
          </>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={createNewDocument}
          className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
        >
          Create New
        </button>
        <span>•</span>
        <button
          className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <IconSun size={20} strokeWidth={1.5} />
          ) : (
            <IconMoon size={20} strokeWidth={1.5} />
          )}
        </button>
        <span>•</span>
        <button
          onClick={downloadAsPdf}
          className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
        >
          <IconDownload size={20} strokeWidth={1.5} />
        </button>
        <span>•</span>
        <button
          onClick={toggleHistory}
          className="hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
        >
          <IconHistory size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
