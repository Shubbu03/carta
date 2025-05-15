"use client";

import {
  useState,
  useRef,
  SetStateAction,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { jsPDF } from "jspdf";
import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createLetterAPI,
  updateLetterAPI,
  getLetterByIdAPI,
  getLettersForSidebarAPI,
} from "@/lib/apiService";
import { ILetter } from "@/lib/models/Letter";

const FONT_SIZES = ["16px", "18px", "20px", "24px", "28px"];
const FONT_FAMILIES = ["Lato", "Arial", "Serif", "Geist Mono", "Geist Sans"];
const DEBOUNCE_DELAY = 5000;

interface EditorProps {
  initialLetterId?: string;
}

function EditorWithSearchParams({ initialLetterId }: EditorProps) {
  const searchParams = useSearchParams();
  const urlLetterId = searchParams.get("id");
  const effectiveLetterId = initialLetterId || urlLetterId || null;

  return <EditorContent initialLetterId={effectiveLetterId} />;
}

function EditorContent({
  initialLetterId,
}: {
  initialLetterId: string | null;
}) {
  const [showContentPlaceholder, setShowContentPlaceholder] = useState(true);
  const [showTitlePlaceholder, setShowTitlePlaceholder] = useState(true);
  const [fontSize, setFontSize] = useState(FONT_SIZES[1]);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[3]);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(
    initialLetterId
  );
  const [isSaving, setIsSaving] = useState(false);
  const [letters, setLetters] = useState<ILetter[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (initialLetterId) {
      setCurrentLetterId(initialLetterId);
      loadLetterContent(initialLetterId);
    }
  }, [initialLetterId]);

  const loadLetterContent = async (letterId: string) => {
    try {
      const letterData = await getLetterByIdAPI(letterId);
      if (letterData) {
        if (titleRef.current) {
          titleRef.current.textContent = letterData.title || "";
          setShowTitlePlaceholder(!letterData.title);
        }
        if (contentRef.current) {
          contentRef.current.textContent = letterData.content || "";
          setShowContentPlaceholder(!letterData.content);
          handleContentInput();
        }
      }
    } catch (error) {
      console.error("Error loading letter:", error);
    }
  };

  const loadSidebarLetters = useCallback(async () => {
    setIsLoadingSidebar(true);
    try {
      const lettersData = await getLettersForSidebarAPI();
      setLetters(lettersData);
    } catch (error) {
      console.error("Error loading letters for sidebar:", error);
      setLetters([]);
    } finally {
      setIsLoadingSidebar(false);
    }
  }, []);

  useEffect(() => {
    if (showHistory) {
      loadSidebarLetters();
    }
  }, [loadSidebarLetters, showHistory]);

  const saveContent = useCallback(async () => {
    const title = titleRef.current?.textContent || "";
    const content = contentRef.current?.textContent || "";

    if (!title && !content) return;

    setIsSaving(true);

    try {
      if (currentLetterId) {
        await updateLetterAPI(currentLetterId, { title, content });
      } else {
        const newLetter = await createLetterAPI({ title, content });
        setCurrentLetterId(newLetter.id);

        router.push(`/letter/${newLetter.id}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error saving letter:", error);
    } finally {
      setIsSaving(false);
    }
  }, [currentLetterId, router]);

  const debouncedSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveContent();
    }, DEBOUNCE_DELAY);
  }, [saveContent]);

  const handleContentInput = useCallback(() => {
    const contentNode = contentRef.current;
    if (contentNode) {
      setShowContentPlaceholder(contentNode.textContent?.trim() === "");
      const text = contentNode.textContent || "";
      setCharCount(text.length);
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
      debouncedSave();
    }
  }, [debouncedSave]);

  const handleTitleInput = useCallback(() => {
    const titleNode = titleRef.current;
    if (titleNode) {
      setShowTitlePlaceholder(titleNode.textContent?.trim() === "");
      debouncedSave();
    }
  }, [debouncedSave]);

  const toggleFontSize = useCallback(() => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    const nextIndex = (currentIndex + 1) % FONT_SIZES.length;
    setFontSize(FONT_SIZES[nextIndex]);
  }, [fontSize]);

  const toggleFontFamily = useCallback((font: SetStateAction<string>) => {
    setFontFamily(font);
  }, []);

  const createNewDocument = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setCurrentLetterId(null);
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

    router.push("/");
  }, [router]);

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

      if (
        (event.metaKey || event.ctrlKey) &&
        (event.key === "s" || event.key === "S")
      ) {
        event.preventDefault();
        saveContent();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleHistory, saveContent]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    handleContentInput();
  }, [handleContentInput]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center text-center p-6">
        <div className="absolute top-0 left-0 p-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            carta.
          </h1>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Desktop Experience Recommended
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            This app is best experienced on a desktop/laptop device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-0 left-0 p-6 z-10">
        <h1
          className="relative inline-block text-xl font-bold text-gray-800 dark:text-gray-100 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          carta.
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-current group-hover:w-full transition-all duration-300"></span>
        </h1>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          show={showHistory}
          letters={letters}
          isLoading={isLoadingSidebar}
        />
        <div
          className={clsx(
            "flex-1 flex flex-col items-center overflow-y-auto transition-all duration-300 ease-in-out",
            showHistory ? "mr-60" : "mr-0"
          )}
        >
          <div className="w-full max-w-4xl px-4 sm:px-8 pt-12 sm:pt-16 pb-24">
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
                  begin writing.
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
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}

export default function Editor({ initialLetterId }: EditorProps) {
  return (
    <Suspense fallback={<div className="p-4">Loading editor...</div>}>
      <EditorWithSearchParams initialLetterId={initialLetterId} />
    </Suspense>
  );
}
