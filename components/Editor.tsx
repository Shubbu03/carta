"use client";

import { useState, useRef, SetStateAction, useEffect } from "react";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { jsPDF } from "jspdf";

export default function Editor() {
  const [showContentPlaceholder, setShowContentPlaceholder] = useState(true);
  const [showTitlePlaceholder, setShowTitlePlaceholder] = useState(true);
  const [fontSize, setFontSize] = useState("18px");
  const [fontFamily, setFontFamily] = useState("Geist Mono");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  const fontSizes = ["16px", "18px", "20px", "24px", "28px"];
  const fontFamilies = ["Lato", "Arial", "Serif", "Geist Mono", "Geist Sans"];

  const handleContentInput = () => {
    const contentNode = contentRef.current as HTMLElement | null;
    if (contentNode) {
      setShowContentPlaceholder(contentNode.textContent?.trim() === "");
      const text = contentNode.textContent || "";
      setCharCount(text.length);
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
    }
  };

  const handleTitleInput = () => {
    const titleNode = titleRef.current as HTMLElement | null;
    if (titleNode) {
      setShowTitlePlaceholder(titleNode.textContent?.trim() === "");
    }
  };

  const toggleFontSize = () => {
    const currentIndex = fontSizes.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % fontSizes.length;
    setFontSize(fontSizes[nextIndex]);
  };

  const toggleFontFamily = (font: SetStateAction<string>) => {
    setFontFamily(font);
  };

  const createNewDocument = () => {
    if (contentRef.current) {
      (contentRef.current as HTMLElement).textContent = "";
      setShowContentPlaceholder(true);
    }
    if (titleRef.current) {
      (titleRef.current as HTMLElement).textContent = "";
      setShowTitlePlaceholder(true);
    }
  };

  const downloadAsPdf = () => {
    try {
      const title = titleRef.current
        ? (titleRef.current as HTMLElement).textContent || "Letter1"
        : "Letter1";
      const content = contentRef.current
        ? (contentRef.current as HTMLElement).textContent || ""
        : "";

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

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(title, 20, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const pageWidth = doc.internal.pageSize.getWidth() - 40;
      const pageHeight = doc.internal.pageSize.getHeight();

      let yPosition = 30;

      const lineHeight = 12 * 0.352778 * 1.15;
      const splitText = doc.splitTextToSize(content, pageWidth);
      for (let i = 0; i < splitText.length; i++) {
        if (yPosition + lineHeight > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(splitText[i], 20, yPosition);
        yPosition += lineHeight;
      }

      const filename = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating your PDF. Please try again.");
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  useEffect(() => {
    handleContentInput();
  }, []);

  return (
    <div className="flex flex-col h-screen relative">
      <div className="flex flex-1 overflow-hidden">
        {showHistory && <Sidebar />}

        <div className="flex-1 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-4xl px-8 pt-16 pb-24">
            <div className="relative mb-6">
              <div
                ref={titleRef}
                contentEditable
                className="w-full text-3xl font-bold focus:outline-none"
                onInput={handleTitleInput}
                suppressContentEditableWarning={true}
              />

              {showTitlePlaceholder && (
                <div className="absolute top-0 text-3xl font-bold text-gray-400 dark:text-gray-600 pointer-events-none">
                  Title...
                </div>
              )}
            </div>

            <div className="relative">
              <div
                ref={contentRef}
                contentEditable
                className="w-full min-h-[400px] focus:outline-none"
                style={{ fontSize, fontFamily }}
                onInput={handleContentInput}
                suppressContentEditableWarning={true}
              />

              {showContentPlaceholder && (
                <div className="absolute top-0 text-gray-400 dark:text-gray-600 pointer-events-none">
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
          fontFamilies={fontFamilies}
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
