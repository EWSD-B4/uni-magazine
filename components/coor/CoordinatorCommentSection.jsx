"use client";

import * as React from "react";

import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from "@/lib/actions/contribution.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

function asString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function formatDate(value) {
  const raw = asString(value);
  if (!raw) return "N/A";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString();
}

export default function CoordinatorCommentSection({
  initialComments,
  coordinatorName,
  contributionId,
}) {
  const [comments, setComments] = React.useState(initialComments || []);
  const [editingCommentId, setEditingCommentId] = React.useState("");
  const [editingDraft, setEditingDraft] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const [error, setError] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [pendingCommentId, setPendingCommentId] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [createState, createFormAction, isCreatePending] = React.useActionState(
    createCommentAction,
    {
      ok: false,
      message: "",
      comment: null,
    },
  );

  React.useEffect(() => {
    setComments(initialComments || []);
  }, [initialComments]);

  React.useEffect(() => {
    if (!createState?.message) return;

    if (createState.ok && createState.comment) {
      setComments((prev) => [createState.comment, ...prev]);
      setDraft("");
      setError("");
      setInfo(createState.message);
      return;
    }

    if (!createState.ok) {
      setInfo("");
      setError(createState.message);
    }
  }, [createState]);

  function beginEdit(comment) {
    setEditingCommentId(comment.id);
    setEditingDraft(asString(comment.body));
    setError("");
    setInfo("");
  }

  function cancelEdit() {
    setEditingCommentId("");
    setEditingDraft("");
  }

  function handleUpdate(commentId) {
    const next = editingDraft.trim();
    if (!next) {
      setError("Comment is required.");
      return;
    }

    setError("");
    setInfo("");
    setPendingCommentId(commentId);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("commentId", commentId);
      formData.set("content", next);
      const result = await updateCommentAction(null, formData);

      if (!result?.ok) {
        setError(result?.message || "Failed to update comment.");
        setPendingCommentId("");
        return;
      }

      setComments((prev) =>
        prev.map((item) =>
          item.id === commentId
            ? {
                ...item,
                ...(result.comment || {}),
                id: commentId,
                body: asString(result.comment?.body, next),
                author: asString(
                  result.comment?.author,
                  asString(item.author, coordinatorName || "Coordinator"),
                ),
                date: asString(result.comment?.date, new Date().toISOString()),
              }
            : item,
        ),
      );
      setPendingCommentId("");
      setEditingCommentId("");
      setEditingDraft("");
      setInfo(result?.message || "Comment updated.");
    });
  }

  function handleDelete(commentId) {
    setError("");
    setInfo("");
    setPendingCommentId(commentId);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("commentId", commentId);
      const result = await deleteCommentAction(null, formData);

      if (!result?.ok) {
        setError(result?.message || "Failed to delete comment.");
        setPendingCommentId("");
        return;
      }

      setComments((prev) => prev.filter((item) => item.id !== commentId));
      setPendingCommentId("");
      setInfo(result?.message || "Comment deleted.");
    });
  }

  function handleSubmit(event) {
    const next = draft.trim();
    setError("");
    setInfo("");
    if (!next) {
      event.preventDefault();
      setError("Comment is required.");
    }
  }

  return (
    <Card className="border-slate-200/80 bg-white/95 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Coordinator Comments</CardTitle>
        <CardDescription>
          Add and review comments for this contribution.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={createFormAction} onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="contributionId" value={contributionId} />
          <Textarea
            name="content"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a comment for this article..."
            className="min-h-28"
            disabled={isCreatePending}
          />
          <div className="flex items-center justify-between gap-3">
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : info ? (
              <p className="text-sm text-emerald-700">{info}</p>
            ) : (
              <span className="text-xs text-slate-500">
                Comment will appear below after submit.
              </span>
            )}
            <Button type="submit" disabled={isCreatePending}>
              {isCreatePending ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.length ? (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-lg border border-slate-200 bg-slate-50/80 p-4"
              >
                {editingCommentId === comment.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingDraft}
                      onChange={(event) => setEditingDraft(event.target.value)}
                      className="min-h-24"
                      disabled={isPending && pendingCommentId === comment.id}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => handleUpdate(comment.id)}
                        disabled={isPending && pendingCommentId === comment.id}
                      >
                        {isPending && pendingCommentId === comment.id
                          ? "Saving..."
                          : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isPending && pendingCommentId === comment.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-700">{comment.body}</p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {asString(comment.author, "Coordinator")} •{" "}
                  {formatDate(comment.date)}
                </p>
                {editingCommentId !== comment.id ? (
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => beginEdit(comment)}
                      disabled={isPending && pendingCommentId === comment.id}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending && pendingCommentId === comment.id}
                    >
                      {isPending && pendingCommentId === comment.id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No comments yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
