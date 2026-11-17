// External imports
import { useState } from 'react'
import { createPortal } from 'react-dom'

// Internal imports
import type { PopText, Tone } from './mechText'

const OFFSET = 14
const MARGIN = 8

const TONE: { [t in Tone]: string } = { good: 'text-success', warn: 'text-warning', bad: 'text-error' }
const CHIP_TONE: { [t in Tone]: string } = { good: 'border-success text-success', warn: 'border-warning text-warning', bad: 'border-error text-error' }

/** The popover box: title, dim sub line, headline numbers, coloured status, one line per tag, rule lines, note. */
export function PopBody({ content }: { content: PopText }): JSX.Element {
  return <>
    <div className='font-bold text-primary text-base leading-tight'>{content.title}</div>
    {content.sub ? <div className='text-xs opacity-60'>{content.sub}</div> : null}
    {content.stats?.length ? <div className='flex flex-wrap gap-1 mt-1.5'>
      {content.stats.map((s, i) => <span key={i} className={`border px-1.5 py-0.5 whitespace-nowrap ${s.tone ? CHIP_TONE[s.tone] : 'border-base-content/30'}`}>
        <b className='text-sm'>{s.value}</b>{s.label ? <span className='text-[11px] opacity-70 ml-1'>{s.label}</span> : null}
      </span>)}
    </div> : null}
    {content.status?.map((l, i) => <div key={i} className={`mt-1 font-bold text-xs ${l.tone ? TONE[l.tone] : ''}`}>{l.text}</div>)}
    {content.tags?.length ? <div className='mt-1.5 text-xs space-y-0.5'>
      {content.tags.map(t => <div key={t.name}><b>{t.name}</b>{t.text ? <span className='opacity-75'> · {t.text}</span> : null}</div>)}
    </div> : null}
    {content.lines.map((l, i) => <div key={i} className='mt-1 text-xs opacity-80'>{l}</div>)}
    {content.note ? <div className='mt-1.5 text-xs italic opacity-50'>{content.note}</div> : null}
  </>
}

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
      flipX: e.clientX + OFFSET + 320 + MARGIN > window.innerWidth,
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
        <PopBody content={content!}/>
      </div>,
      document.body
    ) : null}
  </span>
}

export default Popover
