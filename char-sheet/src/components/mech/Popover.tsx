// External imports
import { useState } from 'react'
import { createPortal } from 'react-dom'

// Internal imports
import type { PopText } from './mechText'

const OFFSET = 14
const MARGIN = 8

/*
 * Hover popover. Shows a fixed-position box that follows the cursor and flips at the viewport edges.
 * Wraps children in a layout-neutral span, so it can go around any inline or block content.
 */
function Popover({ content, children }: { content: PopText | null | undefined, children: React.ReactNode }): JSX.Element {
  const [pos, setPos] = useState(null as { x: number, y: number, flipX: boolean, flipY: boolean } | null)

  function track(e: React.MouseEvent) {
    // Rough box size is enough to decide which side of the cursor to use; the box is anchored from its far edge.
    setPos({
      x: e.clientX, y: e.clientY,
      flipX: e.clientX + OFFSET + 300 + MARGIN > window.innerWidth,
      flipY: e.clientY + OFFSET + 200 + MARGIN > window.innerHeight,
    })
  }

  const empty = !content || (!content.title && !content.lines.length)

  return <span
    className='contents'
    onMouseEnter={track}
    onMouseMove={track}
    onMouseLeave={() => setPos(null)}
  >
    {children}
    {pos && !empty ? createPortal(
      <div
        className='fixed z-50 max-w-xs bg-base-300 border border-accent px-3 py-2 pointer-events-none shadow-xl text-sm leading-snug'
        style={{
          ...(pos.flipX ? { right: window.innerWidth - pos.x + OFFSET } : { left: pos.x + OFFSET }),
          ...(pos.flipY ? { bottom: window.innerHeight - pos.y + OFFSET } : { top: pos.y + OFFSET }),
        }}
      >
        <div className='font-bold text-primary'>{content!.title}</div>
        {content!.sub ? <div className='opacity-60 mb-1'>{content!.sub}</div> : null}
        {content!.lines.map((l, i) => <div key={i} className='mt-1'>{l}</div>)}
      </div>,
      document.body
    ) : null}
  </span>
}

export default Popover
