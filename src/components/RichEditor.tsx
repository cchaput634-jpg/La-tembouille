import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import { useRef } from 'react'
import { Image as ImageIcon, Palette, Eraser } from 'lucide-react'
import { api } from '@/lib/api'

interface Props {
  value: string
  onChange: (html: string) => void
  allowImages?: boolean
}

const RED = '#B33A3A'

export function RichEditor({ value, onChange, allowImages = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Image.configure({ inline: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: 'tiptap' },
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

  const uploadImage = async (file: File) => {
    try {
      const { url } = await api.uploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (e) {
      alert(`Upload échoué : ${(e as Error).message}`)
    }
  }

  const onFile: React.ChangeEventHandler<HTMLInputElement> = e => {
    const f = e.target.files?.[0]
    if (f) uploadImage(f)
    e.target.value = ''
  }

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
        {allowImages && (
          <>
            <div className="w-px h-4 bg-[var(--color-parchment-line)] mx-1" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-2 py-1 text-xs rounded flex items-center gap-1 hover:bg-[var(--color-parchment)]"
              title="Ajouter une image"
            >
              <ImageIcon size={14} />
              Image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={onFile}
            />
          </>
        )}
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
