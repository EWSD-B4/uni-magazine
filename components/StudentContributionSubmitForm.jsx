"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Images, Upload, X } from "lucide-react";

import { submitContribution } from "@/lib/actions/student.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MAX_IMAGES = 5;

const INITIAL_SUBMIT_STATE = {
  ok: false,
  message: "",
};

function isWordFile(file) {
  if (!file) return false;

  const lower = file.name.toLowerCase();
  return lower.endsWith(".doc") || lower.endsWith(".docx");
}

function isValidImage(file) {
  if (!file) return false;

  const lower = file.name.toLowerCase();
  return (
    lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")
  );
}

export default function StudentContributionSubmitForm() {
  const [title, setTitle] = React.useState("");
  const [wordFile, setWordFile] = React.useState(null);
  const [imageItems, setImageItems] = React.useState([]);
  const [agreed, setAgreed] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const [submitState, formAction, isPending] = React.useActionState(
    submitContribution,
    INITIAL_SUBMIT_STATE,
  );

  const wordInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);

  React.useEffect(() => {
    return () => {
      imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [imageItems]);

  React.useEffect(() => {
    if (!submitState?.message) return;

    if (submitState.ok) {
      setErrorMessage("");
      setSuccessMessage(submitState.message);
      setTitle("");
      setWordFile(null);
      setAgreed(false);
      imageItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setImageItems([]);
      if (wordInputRef.current) wordInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    setSuccessMessage("");
    setErrorMessage(submitState.message);
  }, [submitState, imageItems]);

  function handleWordFileChange(event) {
    const file = event.target.files?.[0];
    setSuccessMessage("");

    if (!file) {
      setWordFile(null);
      return;
    }

    if (!isWordFile(file)) {
      setWordFile(null);
      setErrorMessage("Word file must be .doc or .docx");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setWordFile(file);
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files || []);
    setSuccessMessage("");

    if (!files.length) return;

    const invalidFile = files.find((file) => !isValidImage(file));
    if (invalidFile) {
      setErrorMessage("Only .jpg, .jpeg, and .png images are allowed.");
      event.target.value = "";
      return;
    }

    if (imageItems.length + files.length > MAX_IMAGES) {
      setErrorMessage(`You can upload maximum ${MAX_IMAGES} photos.`);
      event.target.value = "";
      return;
    }

    const nextItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setErrorMessage("");
    setImageItems((prev) => [...prev, ...nextItems]);
    event.target.value = "";
  }

  function removeImage(id) {
    setImageItems((prev) => {
      const found = prev.find((item) => item.id === id);
      if (found) {
        URL.revokeObjectURL(found.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }

  function handleClientValidate(event) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim()) {
      event.preventDefault();
      setErrorMessage("Title is required.");
      return;
    }

    if (!wordFile) {
      event.preventDefault();
      setErrorMessage("Word document is required.");
      return;
    }

    if (imageItems.length > MAX_IMAGES) {
      event.preventDefault();
      setErrorMessage(`Maximum ${MAX_IMAGES} photos are allowed.`);
      return;
    }

    if (!agreed) {
      event.preventDefault();
      setErrorMessage("Please agree to Terms & Conditions.");
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleClientValidate}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full border bg-white px-3 py-1 font-medium">
          One Word file is required
        </span>
        <span className="rounded-full border bg-white px-3 py-1 font-medium">
          Max photos: {MAX_IMAGES}
        </span>
        <span className="rounded-full border bg-white px-3 py-1 font-medium">
          Max 3 contributions by policy
        </span>
      </div>

      <Card className="border-dashed my-6">
        <CardContent className="space-y-3 p-5">
          <div className="space-y-2">
            <p className="font-medium">Title *</p>
            <input
              name="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isPending}
              required
              className="h-11 w-full rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60"
              placeholder="Enter contribution title"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed my-6">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-1 size-6 text-slate-600" />
            <div className="space-y-2">
              <p className="font-medium">Upload Word Document *</p>
              <input
                ref={wordInputRef}
                name="wordFile"
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleWordFileChange}
                disabled={isPending}
                className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white hover:file:bg-red-600 disabled:opacity-60"
              />
              <p className="text-xs text-slate-500">Allowed: .doc, .docx</p>
              {wordFile ? (
                <p className="text-sm font-medium text-slate-700">
                  {wordFile.name}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed my-6">
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start gap-3">
            <Images className="mt-1 size-6 text-slate-600" />
            <div className="space-y-2">
              <p className="font-medium">Upload Photos (optional)</p>
              <input
                ref={imageInputRef}
                name="photos"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleImageChange}
                disabled={isPending}
                className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-red-500 file:px-4 file:py-2 file:text-white hover:file:bg-red-600 disabled:opacity-60"
              />
              <p className="text-xs text-slate-500">
                Allowed: .jpg, .jpeg, .png (max 5)
              </p>
            </div>
          </div>

          {imageItems.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {imageItems.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-md border bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-24 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <label className="flex items-start gap-2 text-sm my-6">
        <input
          name="agreed"
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
          disabled={isPending}
          className="mt-0.5 size-4"
        />
        <span>
          I agree to the{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 text-red-500"
          >
            Terms & Conditions
          </Link>
        </span>
      </label>

      {errorMessage ? (
        <p className="my-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="my-6 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="h-11 rounded-full bg-red-500 px-6 hover:bg-red-600"
      >
        <Upload className="mr-2 size-4" />
        {isPending ? "Submitting..." : "Submit Contribution"}
      </Button>
    </form>
  );
}
