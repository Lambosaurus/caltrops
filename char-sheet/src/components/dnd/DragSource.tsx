import { useDrag } from 'react-dnd';
import { ReactNode } from 'react';

export function DragSource({type = 'item', item = null, enabled = true, children}: {
  type: string,
  item: any,
  enabled: boolean,
  children: ReactNode,
}): JSX.Element  {

  const [{ dragging }, drag] = useDrag(
    () => ({
      type: type,
      item: item,
      collect: (monitor) => ({
        dragging: monitor.isDragging()
      }),
      canDrag: () => enabled
    }), [type, enabled, item]
  )

  return <div className={enabled ? 'cursor-pointer' : ''} ref={drag} style={{ opacity: dragging ? 0.5 : 1 }}>{children}</div>
}