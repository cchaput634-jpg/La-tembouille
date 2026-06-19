declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react'
  export interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
    size?: number | string
    absoluteStrokeWidth?: boolean
  }
  export type LucideIcon = ComponentType<LucideProps>
  export const Search: LucideIcon
  export const Plus: LucideIcon
  export const Trash2: LucideIcon
  export const ChevronRight: LucideIcon
  export const ArrowLeft: LucideIcon
  export const Pencil: LucideIcon
  export const X: LucideIcon
  export const Check: LucideIcon
  export const Image: LucideIcon
  export const Palette: LucideIcon
  export const Eraser: LucideIcon
}
