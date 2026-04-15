export function unwrapPayload(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    payload.data &&
    typeof payload.data === "object"
  ) {
    return payload.data;
  }
  return payload;
}

export function asString(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function toTiptapDoc(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return toTiptapDoc(parsed);
    } catch {
      return null;
    }
  }

  if (Array.isArray(value)) {
    const allNodes = value.every(
      (item) => item && typeof item === "object" && typeof item.type === "string",
    );
    if (allNodes) {
      return { type: "doc", content: value };
    }
    return null;
  }

  if (typeof value !== "object") return null;

  if (value.type === "doc" && Array.isArray(value.content)) {
    return value;
  }

  if (value.doc && typeof value.doc === "object") {
    return toTiptapDoc(value.doc);
  }

  return null;
}

function findTiptapDocDeep(value, depth = 0) {
  if (depth > 6 || !value) return null;

  const direct = toTiptapDoc(value);
  if (direct) return direct;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTiptapDocDeep(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object") {
    for (const nested of Object.values(value)) {
      const found = findTiptapDocDeep(nested, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

export function getTiptapDocument(source) {
  const candidates = [
    source?.documents?.[0]?.data,
    source?.documents?.[0]?.content,
    source?.content,
    source?.body,
    source?.document,
    source?.editorContent,
    source?.tiptap,
    source,
  ];

  for (const candidate of candidates) {
    const doc = findTiptapDocDeep(candidate);
    if (doc) return doc;
  }

  return null;
}

function collectDocImages(node, images) {
  if (!node || typeof node !== "object") return;

  if (node.type === "image") {
    const src = asString(node.attrs?.src || node.attrs?.url || node.attrs?.path);
    if (src) {
      images.push({
        src,
        alt: asString(node.attrs?.alt || node.attrs?.title || node.attrs?.caption),
      });
    }
  }

  if (Array.isArray(node.content)) {
    node.content.forEach((child) => collectDocImages(child, images));
  }
}

function getImagesFromTiptap(source, fallbackTitle) {
  const doc = getTiptapDocument(source);
  if (!doc) return [];

  const images = [];
  collectDocImages(doc, images);

  return images.map((image, index) => ({
    src: image.src,
    alt: image.alt || `${fallbackTitle} image ${index + 1}`,
  }));
}

export function normalizeImages(source, fallbackTitle) {
  const documentEntry = Array.isArray(source?.documents)
    ? source.documents[0]
    : null;

  const listCandidates = [
    source?.images,
    source?.photos,
    source?.media,
    source?.attachments,
    source?.uploadedImages,
    source?.extractedImages,
    documentEntry?.uploadedImages,
    documentEntry?.extractedImages,
  ];
  const nonEmptyList = listCandidates.find(
    (candidate) => Array.isArray(candidate) && candidate.length > 0,
  );
  const firstArray = listCandidates.find((candidate) => Array.isArray(candidate));
  const list = nonEmptyList || firstArray || [];

  const toImageSrc = (value) => {
    const raw = asString(value).trim();
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
    if (raw.startsWith("/")) return raw;
    return "";
  };

  const normalized = list
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          src: toImageSrc(item),
          alt: `${fallbackTitle} image ${index + 1}`,
        };
      }

      if (!item || typeof item !== "object") return null;

      const src = toImageSrc(item.url || item.src || item.path);
      if (!src) return null;

      const alt =
        asString(item.alt || item.caption || item.title || item.fileName) ||
        `${fallbackTitle} image ${index + 1}`;

      return { src, alt };
    })
    .filter(Boolean);

  if (normalized.length) {
    return normalized;
  }

  const tiptapImages = getImagesFromTiptap(source, fallbackTitle);
  if (tiptapImages.length) {
    return tiptapImages;
  }

  return normalized;
}

export function normalizeParagraphs(source) {
  if (Array.isArray(source?.body)) {
    return source.body.map((line) => asString(line)).filter(Boolean);
  }

  if (typeof source?.body === "string") {
    return source.body
      .split(/\n{2,}/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  if (typeof source?.content === "string") {
    return source.content
      .split(/\n{2,}/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}
