"use client";

import { useParams } from "next/navigation";
import Editor from "@/components/Editor";

export default function LetterPage() {
  const params = useParams();
  const letterId = params.id as string;

  return <Editor initialLetterId={letterId} />;
}
