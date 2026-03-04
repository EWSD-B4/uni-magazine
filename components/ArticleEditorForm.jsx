"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ArticleEditorForm({ article }) {
  const [title, setTitle] = React.useState(article.title)
  const [excerpt, setExcerpt] = React.useState(article.excerpt)
  const [section, setSection] = React.useState(article.section)
  const [body, setBody] = React.useState(article.body.join("\n\n"))

  function restoreOriginal() {
    setTitle(article.title)
    setExcerpt(article.excerpt)
    setSection(article.section)
    setBody(article.body.join("\n\n"))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg">
        <div className="space-y-2">
          <Label htmlFor="article-title">Title</Label>
          <Input
            id="article-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-section">Section</Label>
          <Input
            id="article-section"
            value={section}
            onChange={(event) => setSection(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-excerpt">Excerpt</Label>
          <Textarea
            id="article-excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="min-h-28"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-body">Body</Label>
          <Textarea
            id="article-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="min-h-80"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" disabled>
            Save changes
          </Button>
          <Button type="button" variant="outline" onClick={restoreOriginal}>
            Restore original
          </Button>
        </div>
      </div>

      <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg">
        <div className="space-y-2">
          <h2 className="font-[var(--font-display)] text-2xl text-slate-900">
            Editor Preview
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            This is a frontend-only editor. You can adjust the draft locally,
            but there is no backend persistence yet.
          </p>
        </div>
        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Live draft
          </p>
          <h3 className="font-[var(--font-display)] text-2xl leading-tight text-slate-900">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-500">
            {section} • {article.faculty}
          </p>
          <p className="text-sm leading-6 text-slate-600">{excerpt}</p>
        </div>
        <div className="space-y-3 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
          <p>Owner ID: {article.ownerId}</p>
          <p>Read time: {article.readTime}</p>
          <p>Published date: {article.publishedAt}</p>
        </div>
      </aside>
    </div>
  )
}
