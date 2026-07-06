import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Palette, Eraser } from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
}

const RED = '#B33A3A'

export function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'tiptap' },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
              event.preventDefault()
              alert("Le collage d'images n'est pas supporté. Décrivez le contenu en texte.")
              return true
            }
          }
        }
        return false
      },
      transformPastedText: text =>
        text.replace(/data:[^;\s]+;base64,[A-Za-z0-9+/=]+/g, ''),
      transformPastedHTML: html =>
        html
          .replace(/<img\b[^>]*>/gi, '')
          .replace(/data:[^"';\s]+;base64,[A-Za-z0-9+/=]+/g, ''),
    },
  })

  if (!editor) return null

  const toggleRed = () => {
    const current = editor.getAttributes('textStyle').color
    if (current === RED) {
      editor.chain().focus().unsetColor().run()
    } else {
      editor.chain().focus().setColor(RED).run()
    }
  }

  const clearColor = () => editor.chain().focus().unsetColor().run()

  return (
    <div className="border border-[var(--color-parchment-line)] rounded-md bg-[var(--color-parchment-soft)]">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--color-parchment-line)]">
        <button
          type="button"
          onClick={toggleRed}
          className={`px-2 py-1 text-xs rounded flex items-center gap-1 hover:bg-[var(--color-parchment)] ${
            editor.getAttributes('textStyle').color === RED ? 'bg-[var(--color-parchment)]' : ''
          }`}
          title="Mettre en rouge"
          style={{ color: editor.getAttributes('textStyle').color === RED ? RED : undefined }}
        >
          <Palette size={14} />
          Rouge
        </button>
        <button
          type="button"
          onClick={clearColor}
          className="px-2 py-1 text-xs rounded flex items-center gap-1 hover:bg-[var(--color-parchment)]"
          title="Retirer la couleur"
        >
          <Eraser size={14} />
        </button>
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
