/* eslint-disable react-refresh/only-export-components */
import type { ComponentType, SVGProps } from 'react'
import * as P from 'pixelarticons/react'

type IconProps = SVGProps<SVGSVGElement>
export type PixelIcon = ComponentType<IconProps>

/**
 * Wraps a pixelarticons glyph so it can stand in for the lucide icon of the same name:
 * decorative by default (hidden from screen readers unless labelled) and rendered on the pixel grid.
 */
function px(Glyph: ComponentType<IconProps>): PixelIcon {
  return function Icon(props: IconProps) {
    const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined
    return <Glyph aria-hidden={labelled ? undefined : true} shapeRendering="crispEdges" focusable="false" {...props} />
  }
}

// App icons (names kept identical to the lucide icons they replace)
export const AlertTriangle = px(P.WarningDiamond)
export const BarChart3 = px(P.ChartBarBig)
export const BookOpen = px(P.BookOpen)
export const Check = px(P.Check)
export const CheckCircle2 = px(P.CheckboxOn)
export const Copy = px(P.Copy)
export const FileText = px(P.FileText)
export const FileUp = px(P.Upload)
export const Flame = px(P.Fire)
export const GraduationCap = px(P.CardText)
export const Layers = px(P.Card)
export const ListChecks = px(P.ListBox)
export const Loader2 = px(P.Loader)
export const Lock = px(P.Lock)
export const LogOut = px(P.Logout)
export const Menu = px(P.Menu)
export const Moon = px(P.Moon)
export const Pencil = px(P.Pencil)
export const Plus = px(P.Plus)
export const Search = px(P.Search)
export const Sparkles = px(P.Sparkles)
export const Sun = px(P.Sun)
export const Target = px(P.Target)
export const Trash2 = px(P.Trash)
export const Trophy = px(P.Trophy)
export const User = px(P.User)
export const X = px(P.Close)

// Names used inside the shadcn ui primitives
export const CheckIcon = Check
export const XIcon = X
export const ChevronDownIcon = px(P.ChevronDown)
export const ChevronUpIcon = px(P.ChevronUp)
export const ChevronRightIcon = px(P.ChevronRight)
export const CircleCheckIcon = CheckCircle2
export const InfoIcon = px(P.CircleInfo)
export const TriangleAlertIcon = AlertTriangle
export const OctagonXIcon = px(P.SquareAlert)
export const Loader2Icon = Loader2
