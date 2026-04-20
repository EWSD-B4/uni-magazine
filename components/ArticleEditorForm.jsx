"use client"

import * as React from "react"
import { Extension } from "@tiptap/core"
import FileHandler from "@tiptap/extension-file-handler"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { Table } from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor } from "@tiptap/react"
import Suggestion from "@tiptap/suggestion"
import {
  Bold,
  ChevronDown,
  Code2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Underline as UnderlineIcon,
  Unlink2,
  Undo2,
  Link2,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatTimestampToMinute } from "@/lib/helpers/date"
import { cn } from "@/lib/utils"

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function paragraphsToHtml(paragraphs) {
  return paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")
}

function getSlashCommandItems(query = "") {
  const normalized = query.trim().toLowerCase()

  const items = [
    {
      title: "Paragraph",
      description: "Switch to regular paragraph text",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setParagraph().run(),
    },
    {
      title: "Heading 1",
      description: "Large section heading",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Create a bulleted list",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Create an ordered list",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
    },
    {
      title: "Blockquote",
      description: "Highlight quoted text",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
    },
    {
      title: "Code Block",
      description: "Insert a block of code",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
    },
    {
      title: "Divider",
      description: "Insert a horizontal rule",
      command: ({ editor, range }) =>
        editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
    },
    {
      title: "Table",
      description: "Insert a 3x3 table with header row",
      command: ({ editor, range }) =>
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      title: "Image URL",
      description: "Insert an image from URL",
      command: ({ editor, range }) => {
        const src = window.prompt("Enter image URL")
        if (!src) return

        editor.chain().focus().deleteRange(range).setImage({ src: src.trim() }).run()
      },
    },
  ]

  if (!normalized) return items.slice(0, 8)

  return items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized)
    )
    .slice(0, 8)
}

function createSlashCommandExtension() {
  return Extension.create({
    name: "slash-command",
    addOptions() {
      return {
        suggestion: {
          char: "/",
          startOfLine: false,
          items: ({ query }) => getSlashCommandItems(query),
          command: ({ editor, range, props }) => {
            props.command({ editor, range })
          },
          render: () => {
            let popup
            let currentProps
            let selectedIndex = 0

            const removePopup = () => {
              if (popup?.parentNode) {
                popup.parentNode.removeChild(popup)
              }
              popup = null
            }

            const positionPopup = () => {
              const clientRect = currentProps?.clientRect?.()

              if (!clientRect || !popup) return

              popup.style.left = `${clientRect.left + window.scrollX}px`
              popup.style.top = `${clientRect.bottom + window.scrollY + 8}px`
            }

            const selectItem = (index) => {
              const item = currentProps?.items?.[index]

              if (!item) return

              currentProps.command(item)
            }

            const renderPopup = () => {
              if (!popup || !currentProps) return

              popup.innerHTML = ""

              popup.style.position = "absolute"
              popup.style.zIndex = "60"
              popup.style.minWidth = "250px"
              popup.style.maxWidth = "300px"
              popup.style.padding = "6px"
              popup.style.borderRadius = "10px"
              popup.style.border = "1px solid rgba(100, 116, 139, 0.35)"
              popup.style.background = "#f8f4ec"
              popup.style.boxShadow =
                "0 22px 40px -24px rgba(15, 23, 42, 0.45), 0 10px 20px -18px rgba(15, 23, 42, 0.35)"

              if (!currentProps.items.length) {
                const emptyState = document.createElement("p")
                emptyState.textContent = "No commands found"
                emptyState.style.margin = "6px"
                emptyState.style.fontSize = "13px"
                emptyState.style.color = "#64748b"
                popup.appendChild(emptyState)
                positionPopup()
                return
              }

              currentProps.items.forEach((item, index) => {
                const button = document.createElement("button")
                const isSelected = index === selectedIndex

                button.type = "button"
                button.style.display = "flex"
                button.style.width = "100%"
                button.style.flexDirection = "column"
                button.style.alignItems = "flex-start"
                button.style.gap = "2px"
                button.style.padding = "8px 10px"
                button.style.border = "0"
                button.style.borderRadius = "8px"
                button.style.cursor = "pointer"
                button.style.background = isSelected
                  ? "#e7dece"
                  : "transparent"
                button.style.color = isSelected
                  ? "#0f172a"
                  : "#111827"

                const title = document.createElement("span")
                title.textContent = item.title
                title.style.fontSize = "13px"
                title.style.fontWeight = "600"

                const description = document.createElement("span")
                description.textContent = item.description
                description.style.fontSize = "12px"
                description.style.opacity = "0.72"

                button.appendChild(title)
                button.appendChild(description)

                button.addEventListener("mouseenter", () => {
                  selectedIndex = index
                  renderPopup()
                })

                button.addEventListener("mousedown", (event) => {
                  event.preventDefault()
                  selectItem(index)
                })

                popup.appendChild(button)
              })

              positionPopup()
            }

            return {
              onStart: (props) => {
                currentProps = props
                selectedIndex = 0
                popup = document.createElement("div")
                document.body.appendChild(popup)
                renderPopup()
                window.addEventListener("scroll", positionPopup, true)
                window.addEventListener("resize", positionPopup)
              },

              onUpdate: (props) => {
                currentProps = props
                selectedIndex = 0
                renderPopup()
              },

              onKeyDown: ({ event }) => {
                if (event.key === "Escape") {
                  removePopup()
                  return true
                }

                const itemCount = currentProps?.items?.length || 0
                if (!itemCount) return false

                if (event.key === "ArrowUp") {
                  event.preventDefault()
                  selectedIndex = (selectedIndex + itemCount - 1) % itemCount
                  renderPopup()
                  return true
                }

                if (event.key === "ArrowDown") {
                  event.preventDefault()
                  selectedIndex = (selectedIndex + 1) % itemCount
                  renderPopup()
                  return true
                }

                if (event.key === "Enter" || event.key === "Tab") {
                  event.preventDefault()
                  selectItem(selectedIndex)
                  return true
                }

                return false
              },

              onExit: () => {
                removePopup()
                window.removeEventListener("scroll", positionPopup, true)
                window.removeEventListener("resize", positionPopup)
              },
            }
          },
        },
      }
    },
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ]
    },
  })
}

function ToolbarButton({ label, icon: Icon, onClick, disabled, active }) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={label}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="size-4" />
    </Button>
  )
}

function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px bg-border" />
}

function getBlockTypeLabel(editor) {
  if (!editor) return "Paragraph"
  if (editor.isActive("heading", { level: 1 })) return "H1"
  if (editor.isActive("heading", { level: 2 })) return "H2"
  if (editor.isActive("heading", { level: 3 })) return "H3"
  return "Paragraph"
}

const editorMenuContentClass =
  "bg-[#f8f4ec] text-slate-900 border border-slate-300 shadow-lg"
const editorMenuItemClass =
  "text-slate-900 [&_svg]:text-slate-600 focus:bg-slate-200 focus:text-slate-900"
const editorMenuLabelClass = "text-slate-900"
const editorMenuSeparatorClass = "bg-slate-300"

export default function ArticleEditorForm({ article }) {
  const imageUploadRef = React.useRef(null)
  const slashCommandExtension = React.useMemo(() => createSlashCommandExtension(), [])
  const initialBodyHtml = React.useMemo(
    () => paragraphsToHtml(article.body),
    [article.body]
  )
  const [title, setTitle] = React.useState(article.title)
  const [excerpt, setExcerpt] = React.useState(article.excerpt)
  const [section, setSection] = React.useState(article.section)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Subscript,
      Superscript,
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      FileHandler.configure({
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
        onDrop: (activeEditor, files, pos) => {
          files
            .filter((file) => file.type.startsWith("image/"))
            .forEach(async (file) => {
              try {
                const src = await fileToDataUrl(file)
                if (!src) return
                activeEditor
                  .chain()
                  .focus()
                  .insertContentAt(pos, {
                    type: "image",
                    attrs: { src, alt: file.name },
                  })
                  .run()
              } catch {
                // ignore unsupported file reads
              }
            })
        },
        onPaste: (activeEditor, files) => {
          files
            .filter((file) => file.type.startsWith("image/"))
            .forEach(async (file) => {
              try {
                const src = await fileToDataUrl(file)
                if (!src) return
                activeEditor
                  .chain()
                  .focus()
                  .setImage({
                    src,
                    alt: file.name,
                  })
                  .run()
              } catch {
                // ignore unsupported file reads
              }
            })
        },
      }),
      slashCommandExtension,
      Placeholder.configure({
        placeholder: "Type '/' for commands or start writing...",
      }),
    ],
    content: initialBodyHtml,
    editorProps: {
      attributes: {
        class:
          "min-h-[28rem] px-6 py-6 text-[17px] leading-8 text-foreground focus:outline-none [&_h1]:mb-4 [&_h1]:mt-7 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mb-4 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mb-4 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_blockquote]:my-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline [&_img]:my-5 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_img]:border [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:bg-muted/60 [&_th]:p-2 [&_th]:text-left [&_td]:border [&_td]:p-2",
      },
    },
  })

  async function insertImageFiles(files, position) {
    if (!editor) return

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue

      try {
        const src = await fileToDataUrl(file)
        if (!src) continue

        const chain = editor.chain().focus()
        if (typeof position === "number") {
          chain.insertContentAt(position, {
            type: "image",
            attrs: { src, alt: file.name },
          })
        } else {
          chain.setImage({ src, alt: file.name })
        }
        chain.run()
      } catch {
        // ignore unsupported file reads
      }
    }
  }

  function setBlockType(type) {
    if (!editor) return
    if (type === "paragraph") {
      editor.chain().focus().setParagraph().run()
      return
    }
    editor.chain().focus().setHeading({ level: type }).run()
  }

  function handleSetLink() {
    if (!editor) return
    const currentHref = editor.getAttributes("link").href || ""
    const nextHref = window.prompt("Enter URL", currentHref)

    if (nextHref === null) return
    const cleaned = nextHref.trim()

    if (!cleaned) {
      editor.chain().focus().unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: cleaned }).run()
  }

  function handleAddImageFromUrl() {
    if (!editor) return
    const src = window.prompt("Enter image URL")
    if (!src) return
    editor.chain().focus().setImage({ src: src.trim() }).run()
  }

  function handleImageUploadChange(event) {
    const files = Array.from(event.target.files || [])
    void insertImageFiles(files)
    event.target.value = ""
  }

  function restoreOriginal() {
    setTitle(article.title)
    setExcerpt(article.excerpt)
    setSection(article.section)
    if (editor) {
      editor.commands.setContent(initialBodyHtml)
    }
  }

  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="article-title">Title</Label>
          <Input
            id="article-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="article-section">Section</Label>
          <Input
            id="article-section"
            value={section}
            onChange={(event) => setSection(event.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="article-excerpt">Excerpt</Label>
          <Textarea
            id="article-excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            className="min-h-24 bg-background"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="article-body">Body</Label>
        <p className="text-xs text-muted-foreground">
          Tip: use &quot;/&quot; for quick commands, or drag and drop images directly into
          the editor.
        </p>
        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="flex flex-wrap items-center gap-1 border-b px-3 py-2">
            <ToolbarButton
              label="Undo"
              icon={Undo2}
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
            />
            <ToolbarButton
              label="Redo"
              icon={Redo2}
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
            />
            <ToolbarDivider />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  disabled={!editor}
                >
                  {getBlockTypeLabel(editor)}
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={editorMenuContentClass}>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={() => setBlockType("paragraph")}
                >
                  Paragraph
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={() => setBlockType(1)}
                >
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={() => setBlockType(2)}
                >
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={() => setBlockType(3)}
                >
                  Heading 3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ToolbarButton
              label="Bulleted list"
              icon={List}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              active={editor?.isActive("bulletList")}
            />
            <ToolbarButton
              label="Numbered list"
              icon={ListOrdered}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              active={editor?.isActive("orderedList")}
            />
            <ToolbarButton
              label="Blockquote"
              icon={Quote}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              active={editor?.isActive("blockquote")}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Bold"
              icon={Bold}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              active={editor?.isActive("bold")}
            />
            <ToolbarButton
              label="Italic"
              icon={Italic}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              active={editor?.isActive("italic")}
            />
            <ToolbarButton
              label="Underline"
              icon={UnderlineIcon}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              active={editor?.isActive("underline")}
            />
            <ToolbarButton
              label="Strikethrough"
              icon={Strikethrough}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              active={editor?.isActive("strike")}
            />
            <ToolbarButton
              label="Inline code"
              icon={Code2}
              onClick={() => editor?.chain().focus().toggleCode().run()}
              active={editor?.isActive("code")}
            />
            <ToolbarButton
              label="Insert link"
              icon={Link2}
              onClick={handleSetLink}
              active={editor?.isActive("link")}
            />
            <ToolbarButton
              label="Remove link"
              icon={Unlink2}
              onClick={() => editor?.chain().focus().unsetLink().run()}
              disabled={!editor?.isActive("link")}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Superscript"
              icon={SuperscriptIcon}
              onClick={() => editor?.chain().focus().toggleSuperscript().run()}
              active={editor?.isActive("superscript")}
            />
            <ToolbarButton
              label="Subscript"
              icon={SubscriptIcon}
              onClick={() => editor?.chain().focus().toggleSubscript().run()}
              active={editor?.isActive("subscript")}
            />
            <ToolbarDivider />
            <ToolbarButton
              label="Align left"
              icon={TextAlignStart}
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
              active={editor?.isActive({ textAlign: "left" })}
            />
            <ToolbarButton
              label="Align center"
              icon={TextAlignCenter}
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
              active={editor?.isActive({ textAlign: "center" })}
            />
            <ToolbarButton
              label="Align right"
              icon={TextAlignEnd}
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
              active={editor?.isActive({ textAlign: "right" })}
            />
            <ToolbarButton
              label="Justify"
              icon={TextAlignJustify}
              onClick={() =>
                editor?.chain().focus().setTextAlign("justify").run()
              }
              active={editor?.isActive({ textAlign: "justify" })}
            />
            <ToolbarDivider />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              disabled={!editor}
            >
              Divider
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:bg-muted hover:text-foreground"
                  disabled={!editor}
                >
                  <Plus className="size-4" />
                  Add
                  <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={editorMenuContentClass}>
                <DropdownMenuLabel className={editorMenuLabelClass}>
                  Insert
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={(event) => {
                    event.preventDefault()
                    handleAddImageFromUrl()
                  }}
                >
                  <ImagePlus className="size-4" />
                  Image URL
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={(event) => {
                    event.preventDefault()
                    imageUploadRef.current?.click()
                  }}
                >
                  <ImagePlus className="size-4" />
                  Upload image
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={(event) => {
                    event.preventDefault()
                    editor
                      ?.chain()
                      .focus()
                      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                      .run()
                  }}
                >
                  Table
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={editorMenuItemClass}
                  onSelect={(event) => {
                    event.preventDefault()
                    editor?.chain().focus().setHorizontalRule().run()
                  }}
                >
                  Divider
                </DropdownMenuItem>

                {editor?.isActive("table") && (
                  <>
                    <DropdownMenuSeparator className={editorMenuSeparatorClass} />
                    <DropdownMenuLabel className={editorMenuLabelClass}>
                      Table
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().addRowBefore().run()
                      }}
                    >
                      Add row above
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().addRowAfter().run()
                      }}
                    >
                      Add row below
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().addColumnBefore().run()
                      }}
                    >
                      Add column left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().addColumnAfter().run()
                      }}
                    >
                      Add column right
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().deleteRow().run()
                      }}
                    >
                      Delete row
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().deleteColumn().run()
                      }}
                    >
                      Delete column
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={editorMenuItemClass}
                      onSelect={(event) => {
                        event.preventDefault()
                        editor?.chain().focus().deleteTable().run()
                      }}
                    >
                      Delete table
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <EditorContent
            id="article-body"
            editor={editor}
            className="[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
          />
        </div>
        <input
          ref={imageUploadRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUploadChange}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/20 p-4">
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Owner ID: {article.ownerId}</p>
          <p>
            {article.faculty} • {article.readTime} • Published{" "}
            {formatTimestampToMinute(article.publishedAt)}
          </p>
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
    </div>
  )
}
