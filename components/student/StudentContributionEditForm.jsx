"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";

import { updateContribution } from "@/lib/actions/student.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_IMAGES = 5;

function asString(value) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function isImageFile(file) {
  if (!file) return false;
  const name = asString(file.name).toLowerCase();
  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png")
  );
}

function isWordFile(file) {
  if (!file) return false;
  const name = asString(file.name).toLowerCase();
  return name.endsWith(".doc") || name.endsWith(".docx");
}

const INITIAL_EDIT_STATE = {
  ok: false,
  message: "",
};

export default function StudentContributionEditForm({
  contributionId,
  initialTitle,
  existingImages,
  wordFileLabel,
}) {
  const [title, setTitle] = React.useState(initialTitle || "");
  const [savedImages, setSavedImages] = React.useState(existingImages || []);
  const [removedImageIds, setRemovedImageIds] = React.useState([]);
  const [newImages, setNewImages] = React.useState([]);
  const [newWordFile, setNewWordFile] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [infoMessage, setInfoMessage] = React.useState("");
  const [actionState, formAction, isPending] = React.useActionState(
    updateContribution,
    INITIAL_EDIT_STATE,
  );
  const photosInputRef = React.useRef(null);
  const totalImages = savedImages.length + newImages.length;
  const remainingSlots = Math.max(0, MAX_IMAGES - totalImages);

  React.useEffect(() => {
    if (!photosInputRef.current) return;
    const dataTransfer = new DataTransfer();
    newImages.forEach((item) => {
      if (item?.file) {
        dataTransfer.items.add(item.file);
      }
    });
    photosInputRef.current.files = dataTransfer.files;
  }, [newImages]);

  React.useEffect(() => {
    return () => {
      newImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [newImages]);

  React.useEffect(() => {
    if (!actionState?.message) return;
    if (actionState.ok) {
      setErrorMessage("");
      setInfoMessage(actionState.message);
      return;
    }
    setInfoMessage("");
    setErrorMessage(actionState.message);
  }, [actionState]);

  function removeExistingImage(id) {
    setSavedImages((prev) => prev.filter((item) => item.id !== id));
    setRemovedImageIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removeNewImage(id) {
    setNewImages((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found?.previewUrl) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }

  function handleWordFileChange(event) {
    setErrorMessage("");
    setInfoMessage("");

    const file = event.target.files?.[0];
    if (!file) {
      setNewWordFile(null);
      return;
    }

    if (!isWordFile(file)) {
      setNewWordFile(null);
      setErrorMessage("Word file must be .doc or .docx.");
      event.target.value = "";
      return;
    }

    setNewWordFile(file);
  }

  function handleNewImagesChange(event) {
    setErrorMessage("");
    setInfoMessage("");

    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const invalid = files.find((file) => !isImageFile(file));
    if (invalid) {
      setErrorMessage("Only .jpg, .jpeg, and .png are allowed.");
      event.target.value = "";
      return;
    }

    const totalAfterUpload = savedImages.length + newImages.length + files.length;
    if (totalAfterUpload > MAX_IMAGES) {
      setErrorMessage(`Maximum ${MAX_IMAGES} photos are allowed.`);
      event.target.value = "";
      return;
    }

    const nextItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...nextItems]);
    event.target.value = "";
  }

  function handleClientValidate(event) {
    setErrorMessage("");
    setInfoMessage("");

    if (!title.trim()) {
      event.preventDefault();
      setErrorMessage("Title is required.");
      return;
    }

    if (newImages.length > MAX_IMAGES) {
      event.preventDefault();
      setErrorMessage(`Maximum ${MAX_IMAGES} photos are allowed.`);
      return;
    }
  }

  function handleSaveClick() {
    setErrorMessage("");
    setInfoMessage("");
  }

  function handleAddMoreImagesClick() {
    if (!photosInputRef.current || isPending || remainingSlots <= 0) return;
    photosInputRef.current.click();
  }

  return (
    <form
      action={formAction}
      onSubmit={handleClientValidate}
      className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm"
    >
      <input type="hidden" name="contributionId" value={contributionId} />
      <input
        type="hidden"
        name="removedImageIds"
        value={JSON.stringify(removedImageIds)}
      />

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isPending}
            className="bg-background"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="replace-docx">Replace Word File</Label>
          <Input
            id="replace-docx"
            name="docx"
            type="file"
            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleWordFileChange}
            disabled={isPending}
            className="bg-background file:mr-3 file:rounded-full file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white hover:file:bg-red-600"
          />
          <p className="text-xs text-slate-500">
            Current file: {wordFileLabel || "Uploaded Word document"}
          </p>
          {newWordFile ? (
            <p className="text-sm font-medium text-slate-700">
              New file: {newWordFile.name}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-photos">Upload New Photos</Label>
          <Input
            id="new-photos"
            ref={photosInputRef}
            name="photos"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleNewImagesChange}
            disabled={isPending}
            className="bg-background file:mr-3 file:rounded-full file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white hover:file:bg-red-600"
          />
          <p className="text-xs text-slate-500">
            Optional. Max {MAX_IMAGES} photos total after edits.
          </p>
        </div>

        {totalImages > 0 || remainingSlots > 0 ? (
          <div className="space-y-3">
            <Label>Photos</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {savedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-md border bg-white"
                >
                  <div className="relative h-24 w-full">
                    <Image
                      src={image.src}
                      alt={image.alt || "Contribution image"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label={`Remove ${image.alt || "image"}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {newImages.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-md border bg-white"
                >
                  <div className="relative h-24 w-full">
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewImage(item.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              {Array.from({ length: remainingSlots }).map((_, index) => (
                <button
                  key={`empty-slot-${index}`}
                  type="button"
                  onClick={handleAddMoreImagesClick}
                  disabled={isPending}
                  className="flex h-24 w-full items-center justify-center rounded-md border border-dashed bg-background text-muted-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Add more photos"
                >
                  <Plus className="size-5" />
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Contribution ID: {contributionId}</p>
          <p>
            Removed photos: {removedImageIds.length} • New photos: {newImages.length}
          </p>
        </div>
        <Button type="submit" onClick={handleSaveClick} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>

      {errorMessage ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {infoMessage ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {infoMessage}
        </p>
      ) : null}
    </form>
  );
}
