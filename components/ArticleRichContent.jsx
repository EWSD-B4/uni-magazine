"use client";

import * as React from "react";
import {
  getTiptapDocument,
  normalizeParagraphs,
} from "@/lib/helpers/contribution";

function asText(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function normalizeKey(value) {
  const text = asText(value).trim();
  if (!text) return "";

  try {
    const decoded = decodeURIComponent(text).trim().toLowerCase();
    return decoded.replace(/^https?:\/\/[^/]+\//, "").replace(/^\/+/, "");
  } catch {
    return text
      .toLowerCase()
      .replace(/^https?:\/\/[^/]+\//, "")
      .replace(/^\/+/, "");
  }
}

function isRenderableSrc(value) {
  const src = asText(value).trim();
  if (!src) return false;
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("/")
  );
}

function basenameOf(pathLike) {
  const normalized = normalizeKey(pathLike);
  if (!normalized) return "";
  const parts = normalized.split("/");
  return parts[parts.length - 1] || "";
}

function resolveMappedImageUrl(rawSrc, imageMap) {
  const normalizedRawKey = normalizeKey(rawSrc);
  if (!normalizedRawKey || !imageMap?.size) return "";
  if (imageMap.has(normalizedRawKey)) {
    return imageMap.get(normalizedRawKey);
  }

  const rawBase = basenameOf(normalizedRawKey);
  let bestUrl = "";
  let bestScore = -1;

  for (const [candidateKey, candidateUrl] of imageMap.entries()) {
    if (!candidateKey || !candidateUrl) continue;

    if (
      candidateKey.endsWith(normalizedRawKey) ||
      normalizedRawKey.endsWith(candidateKey)
    ) {
      const score = Math.min(candidateKey.length, normalizedRawKey.length);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = candidateUrl;
      }
      continue;
    }

    const candidateBase = basenameOf(candidateKey);
    if (
      rawBase &&
      candidateBase &&
      rawBase === candidateBase &&
      bestScore < 0
    ) {
      bestScore = 0;
      bestUrl = candidateUrl;
    }
  }

  return bestUrl;
}

function renderChildren(content, keyPrefix, context) {
  if (!Array.isArray(content) || !content.length) return null;
  return content.map((child, index) => (
    <React.Fragment key={`${keyPrefix}-${index}`}>
      {renderNode(child, `${keyPrefix}-${index}`, context)}
    </React.Fragment>
  ));
}

function applyMarksToText(textNode, keyPrefix) {
  let result = asText(textNode?.text);
  const marks = Array.isArray(textNode?.marks) ? textNode.marks : [];

  marks.forEach((mark, index) => {
    const markType = asText(mark?.type).toLowerCase();
    const key = `${keyPrefix}-mark-${index}`;

    if (markType === "bold") {
      result = <strong key={key}>{result}</strong>;
      return;
    }

    if (markType === "italic") {
      result = <em key={key}>{result}</em>;
      return;
    }

    if (markType === "underline") {
      result = <u key={key}>{result}</u>;
      return;
    }

    if (markType === "strike") {
      result = <s key={key}>{result}</s>;
      return;
    }

    if (markType === "code") {
      result = (
        <code key={key} className="rounded bg-muted px-1 py-0.5">
          {result}
        </code>
      );
      return;
    }

    if (markType === "link") {
      const href = asText(mark?.attrs?.href);
      result = (
        <a
          key={key}
          href={href || "#"}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary underline"
        >
          {result}
        </a>
      );
      return;
    }

    if (markType === "superscript") {
      result = <sup key={key}>{result}</sup>;
      return;
    }

    if (markType === "subscript") {
      result = <sub key={key}>{result}</sub>;
    }
  });

  return result;
}

function renderNode(node, key, context) {
  if (!node || typeof node !== "object") return null;

  const type = asText(node.type).toLowerCase();

  if (type === "text") {
    return applyMarksToText(node, key);
  }

  if (type === "paragraph") {
    return <p key={key}>{renderChildren(node.content, key, context)}</p>;
  }

  if (type === "heading") {
    const level = Math.min(Math.max(Number(node?.attrs?.level || 1), 1), 6);
    if (level === 1)
      return <h1 key={key}>{renderChildren(node.content, key, context)}</h1>;
    if (level === 2)
      return <h2 key={key}>{renderChildren(node.content, key, context)}</h2>;
    if (level === 3)
      return <h3 key={key}>{renderChildren(node.content, key, context)}</h3>;
    if (level === 4)
      return <h4 key={key}>{renderChildren(node.content, key, context)}</h4>;
    if (level === 5)
      return <h5 key={key}>{renderChildren(node.content, key, context)}</h5>;
    return <h6 key={key}>{renderChildren(node.content, key, context)}</h6>;
  }

  if (type === "bulletlist") {
    return <ul key={key}>{renderChildren(node.content, key, context)}</ul>;
  }

  if (type === "orderedlist") {
    return <ol key={key}>{renderChildren(node.content, key, context)}</ol>;
  }

  if (type === "listitem") {
    return <li key={key}>{renderChildren(node.content, key, context)}</li>;
  }

  if (type === "blockquote") {
    return (
      <blockquote key={key}>
        {renderChildren(node.content, key, context)}
      </blockquote>
    );
  }

  if (type === "codeblock") {
    return (
      <pre key={key} className="overflow-x-auto rounded bg-muted p-3">
        <code>{renderChildren(node.content, key)}</code>
      </pre>
    );
  }

  if (type === "hardbreak") {
    return <br key={key} />;
  }

  if (type === "horizontalrule") {
    return <hr key={key} className="my-6 border-border" />;
  }

  if (type === "image") {
    const rawSrc =
      asText(node?.attrs?.src) ||
      asText(node?.attrs?.url) ||
      asText(node?.attrs?.path);

    let src = isRenderableSrc(rawSrc) ? rawSrc : "";
    if (!src) {
      src = resolveMappedImageUrl(rawSrc, context?.imageMap);
    }

    const alt =
      asText(node?.attrs?.alt) || asText(node?.attrs?.title) || "Article image";
    const title = asText(node?.attrs?.title);
    const looksExtracted =
      alt.toLowerCase().includes("extracted image") ||
      title.toLowerCase().includes("extracted image");

    if (!src && looksExtracted && context?.extractedImageFallbackUrl) {
      src = context.extractedImageFallbackUrl;
    }

    if (!src) return null;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={key}
        src={src}
        alt={alt}
        className="my-5 mx-auto block max-w-full rounded-lg border border-slate-200 object-cover"
        style={{ width: "640px", height: "240px" }}
      />
    );
  }

  if (type === "table") {
    return (
      <div key={key} className="overflow-x-auto">
        <table>{renderChildren(node.content, key, context)}</table>
      </div>
    );
  }

  if (type === "tablerow") {
    return <tr key={key}>{renderChildren(node.content, key, context)}</tr>;
  }

  if (type === "tableheader") {
    return <th key={key}>{renderChildren(node.content, key, context)}</th>;
  }

  if (type === "tablecell") {
    return <td key={key}>{renderChildren(node.content, key, context)}</td>;
  }

  return renderChildren(node.content, key, context);
}

export default function ArticleRichContent({ source }) {
  const tiptapDoc = React.useMemo(() => getTiptapDocument(source), [source]);
  const fallbackParagraphs = React.useMemo(
    () => normalizeParagraphs(source),
    [source],
  );

  const imageMap = React.useMemo(() => {
    const map = new Map();
    const docEntry = Array.isArray(source?.documents)
      ? source.documents[0]
      : null;
    const collections = [
      source?.uploadedImages,
      source?.extractedImages,
      docEntry?.uploadedImages,
      docEntry?.extractedImages,
    ].filter(Array.isArray);

    collections.flat().forEach((item) => {
      if (!item || typeof item !== "object") return;
      const url = asText(item.url || item.src || item.path);
      if (!isRenderableSrc(url)) return;

      const keys = [
        item.s3Key,
        item.key,
        item.path,
        item.url,
        item.src,
        asText(item.alt).replace(/\s+/g, "-"),
      ]
        .map((value) => normalizeKey(value))
        .filter(Boolean);

      keys.forEach((entryKey) => map.set(entryKey, url));
    });

    return map;
  }, [source]);

  const extractedImageFallbackUrl = React.useMemo(() => {
    const docEntry = Array.isArray(source?.documents) ? source.documents[0] : null;
    const uploaded = Array.isArray(docEntry?.uploadedImages)
      ? docEntry.uploadedImages
      : [];

    for (let index = uploaded.length - 1; index >= 0; index -= 1) {
      const url = asText(uploaded[index]?.url || uploaded[index]?.src);
      if (isRenderableSrc(url)) {
        return url;
      }
    }

    return "";
  }, [source]);

  return (
    <div className="text-base leading-8 text-slate-700 [&_h1]:mb-4 [&_h1]:mt-7 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-4 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-4 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_strong]:font-bold [&_b]:font-bold [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:bg-muted/60 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:p-2">
      {tiptapDoc &&
      Array.isArray(tiptapDoc.content) &&
      tiptapDoc.content.length ? (
        renderChildren(tiptapDoc.content, "doc", {
          imageMap,
          extractedImageFallbackUrl,
        })
      ) : fallbackParagraphs.length ? (
        fallbackParagraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))
      ) : (
        <p>No body content returned from API.</p>
      )}
    </div>
  );
}
