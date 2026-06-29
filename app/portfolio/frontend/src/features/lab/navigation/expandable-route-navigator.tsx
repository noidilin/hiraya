import type { ReactNode } from "react"

import {
  ExpandableTabs,
  type ExpandableTabsClassNames,
} from "@/components/motion/expandable-tabs"
import { cn } from "@/lib/utils"

export type ExpandableRouteNavigatorItem = {
  id: string
  label: string
  icon: ReactNode
  panel: ReactNode
}

export type ExpandableRouteNavigatorClassNames = {
  root?: string
  panel?: string
  bar?: string
  tabList?: string
  controls?: string
  tab?: string
  activeTab?: string
  icon?: string
  label?: string
  pill?: string
}

export type ExpandableRouteNavigatorProps = {
  items: readonly ExpandableRouteNavigatorItem[]
  activeItemId?: string | null
  currentItemId?: string | null
  defaultActiveItemId?: string | null
  onActiveItemChange?: (id: string | null) => void
  controls?: ReactNode
  leadingControls?: ReactNode
  className?: string
  classNames?: ExpandableRouteNavigatorClassNames
  closedHeight?: number
  "aria-label"?: string
}

export function ExpandableRouteNavigator({
  items,
  activeItemId,
  currentItemId,
  defaultActiveItemId = null,
  onActiveItemChange,
  controls,
  leadingControls,
  className,
  classNames,
  closedHeight,
  "aria-label": ariaLabel = "Route navigation",
}: ExpandableRouteNavigatorProps) {
  const tabClassNames: ExpandableTabsClassNames = {
    root: classNames?.root,
    panel: classNames?.panel,
    bar: classNames?.bar,
    tabList: classNames?.tabList,
    controls: classNames?.controls,
    tab: classNames?.tab,
    activeTab: classNames?.activeTab,
    icon: classNames?.icon,
    label: classNames?.label,
    pill: classNames?.pill,
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("fixed inset-x-0 bottom-4 z-40 flex justify-center px-3", className)}
    >
      <ExpandableTabs
        items={items.map((item) => ({
          id: item.id,
          label: item.label,
          icon: item.icon,
          content: item.panel,
        }))}
        value={activeItemId}
        currentValue={currentItemId}
        defaultValue={defaultActiveItemId}
        onValueChange={onActiveItemChange}
        leadingControls={leadingControls}
        trailingControls={controls}
        closedHeight={closedHeight}
        classNames={tabClassNames}
      />
    </nav>
  )
}
