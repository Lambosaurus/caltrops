import { cloneElement, ReactNode } from 'react';
import { useDrop } from 'react-dnd';

export function DropTarget({onDrop, accept = 'item', enabled = true, canDrop: canDropItem, hoverClass = '', invalidClass = '', wrappingElement = <div></div>, children}: {
  onDrop(item: any): void,
  accept?: string,
  enabled?: boolean,
  // Optional per-item check, evaluated against the dragged item. Without it, `enabled` decides.
  canDrop?(item: any): boolean,
  hoverClass?: string,
  // Applied while an item that cannot be dropped here is hovering (only when canDrop is given).
  invalidClass?: string,
  wrappingElement?: JSX.Element,
  children: ReactNode,
}): JSX.Element  {

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: accept,
    drop: onDrop,
    canDrop: (item: any) => enabled && (canDropItem ? canDropItem(item) : true),
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }, [enabled, accept, onDrop, canDropItem])

  const hover = (isOver && canDrop) ? hoverClass : (isOver && canDropItem && enabled) ? invalidClass : ''

  return <>{cloneElement(wrappingElement, {
    ref: drop,
    className: `${wrappingElement.props.className ?? ''} drop-item ${hover}`,
  }, children)}</>;
}
