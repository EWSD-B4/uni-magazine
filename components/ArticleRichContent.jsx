"use client";

import * as React from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { getTiptapDocument, normalizeParagraphs } from "@/lib/helpers/contribution";

export default function ArticleRichContent({ source }) {
  const tiptapDoc = React.useMemo(() => getTiptapDocument(source), [source]);
  const fallbackParagraphs = React.useMemo(
    () => normalizeParagraphs(source),
    [source],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
      Image,
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: tiptapDoc,
    editorProps: {
      attributes: {
        class:
          "text-base leading-8 text-slate-700 focus:outline-none [&_h1]:mb-4 [&_h1]:mt-7 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-4 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-4 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:my-5 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_img]:border [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:bg-muted/60 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:p-2",
      },
    },
  });

  if (!tiptapDoc) {
    return (
      <div className="space-y-5 text-base leading-8 text-slate-700">
        {fallbackParagraphs.length ? (
          fallbackParagraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph}`}>{paragraph}</p>
          ))
        ) : (
          <p>No body content returned from API.</p>
        )}
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
