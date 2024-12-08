import { ReactNode } from 'react';
import { useDrop } from 'react-dnd';

export function DropTarget({onDrop, accept = 'item', enabled = true, children}: {
  onDrop(item: any): void,
  accept: string,
  enabled: boolean,
  children: ReactNode,
}): JSX.Element  {

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: accept,
    drop: onDrop,
    canDrop: () => enabled,
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }, [enabled, accept, onDrop])

  return <div ref={drop}>{children}</div>
}