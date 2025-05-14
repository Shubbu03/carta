"use client";

import {
  useState,
  useRef,
  SetStateAction,
  useEffect,
  useCallback,
} from "react";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { jsPDF } from "jspdf";
import clsx from "clsx";

const FONT_SIZES = ["16px", "18px", "20px", "24px", "28px"];
const FONT_FAMILIES = ["Lato", "Arial", "Serif", "Geist Mono", "Geist Sans"];

export default function Editor() {
  const [showContentPlaceholder, setShowContentPlaceholder] = useState(true);
  const [showTitlePlaceholder, setShowTitlePlaceholder] = useState(true);
  const [fontSize, setFontSize] = useState(FONT_SIZES[1]);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[3]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const handleContentInput = useCallback(() => {
    const contentNode = contentRef.current;
    if (contentNode) {
      setShowContentPlaceholder(contentNode.textContent?.trim() === "");
      const text = contentNode.textContent || "";
      setCharCount(text.length);
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
    }
  }, []);

  const handleTitleInput = useCallback(() => {
    const titleNode = titleRef.current;
    if (titleNode) {
      setShowTitlePlaceholder(titleNode.textContent?.trim() === "");
    }
  }, []);

  const toggleFontSize = useCallback(() => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % FONT_SIZES.length;
    setFontSize(FONT_SIZES[nextIndex]);
  }, [fontSize]);

  const toggleFontFamily = useCallback((font: SetStateAction<string>) => {
    setFontFamily(font);
  }, []);

  const createNewDocument = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.textContent = "";
      setShowContentPlaceholder(true);
      setWordCount(0);
      setCharCount(0);
    }
    if (titleRef.current) {
      titleRef.current.textContent = "";
      setShowTitlePlaceholder(true);
    }
  }, []);

  const downloadAsPdf = useCallback(() => {
    try {
      const title = titleRef.current?.textContent?.trim() || "Letter1";
      const content = contentRef.current?.textContent || "";

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      doc.setProperties({
        title: title,
        subject: "Document created with Carta",
        author: "Carta User",
        creator: "Carta",
        keywords: "carta, document, notes",
      });

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const titleMaxWidth = doc.internal.pageSize.getWidth() - 40;
      const splitTitle = doc.splitTextToSize(title, titleMaxWidth);
      doc.text(splitTitle, 20, 20);

      let yPosition = 20 + splitTitle.length * (18 * 0.352778 * 1.15);
      yPosition = Math.max(yPosition, 35);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const contentMaxWidth = doc.internal.pageSize.getWidth() - 40;
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentMargin = 20;

      const lineHeight = 12 * 0.352778 * 1.15;
      const splitText = doc.splitTextToSize(content, contentMaxWidth);

      for (let i = 0; i < splitText.length; i++) {
        if (yPosition + lineHeight > pageHeight - contentMargin) {
          doc.addPage();
          yPosition = contentMargin;
        }
        doc.text(splitText[i], 20, yPosition);
        yPosition += lineHeight;
      }

      const filename = `${
        title
          .replace(/[^a-z0-9_-\s]/gi, "")
          .replace(/\s+/g, "_")
          .toLowerCase() || "document"
      }.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating your PDF. Please try again.");
    }
  }, []);

  const toggleHistory = useCallback(() => {
    setShowHistory((prevShow) => !prevShow);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "b" || event.key === "B")
      ) {
        event.preventDefault();
        toggleHistory();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleHistory]);

  useEffect(() => {
    handleContentInput();
  }, [handleContentInput]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-1 overflow-hidden relative">
        {" "}
        <Sidebar show={showHistory} />
        <div
          className={clsx(
            "flex-1 flex flex-col items-center overflow-y-auto transition-all duration-300 ease-in-out",
            showHistory ? "mr-60" : "mr-0"
          )}
        >
          <div className="w-full max-w-4xl px-4 sm:px-8 pt-12 sm:pt-16 pb-24">
            {" "}
            <div className="relative mb-6">
              <div
                ref={titleRef}
                contentEditable
                className="w-full text-3xl sm:text-4xl font-bold focus:outline-none text-gray-800 dark:text-gray-100 placeholder-transparent"
                onInput={handleTitleInput}
                suppressContentEditableWarning={true}
              />
              {showTitlePlaceholder && (
                <div className="absolute top-0 left-0 text-3xl sm:text-4xl font-bold text-gray-400 dark:text-gray-600 pointer-events-none select-none">
                  Title...
                </div>
              )}
            </div>

            <div className="relative">
              <div
                ref={contentRef}
                contentEditable
                className="w-full min-h-[calc(100vh-280px)] sm:min-h-[400px] focus:outline-none text-gray-700 dark:text-gray-300 placeholder-transparent"
                style={{ fontSize, fontFamily }}
                onInput={handleContentInput}
                suppressContentEditableWarning={true}
              />
              {showContentPlaceholder && (
                <div
                  className="absolute top-0 left-0 text-gray-400 dark:text-gray-600 pointer-events-none select-none"
                  style={{ fontSize, fontFamily }}
                >
                  Begin writing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 w-full">
        <Footer
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontFamilies={FONT_FAMILIES}
          toggleFontSize={toggleFontSize}
          toggleFontFamily={toggleFontFamily}
          createNewDocument={createNewDocument}
          downloadAsPdf={downloadAsPdf}
          toggleHistory={toggleHistory}
          wordCount={wordCount}
          charCount={charCount}
        />
      </div>
    </div>
  );
}
