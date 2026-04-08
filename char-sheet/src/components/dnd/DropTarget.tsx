import { cloneElement, ReactNode } from 'react';
import { useDrop } from 'react-dnd';

export function DropTarget({onDrop, accept = 'item', enabled = true, hoverClass = '', wrappingElement = <div></div>, children}: {
  onDrop(item: any): void,
  accept?: string,
  enabled?: boolean,
  hoverClass?: string,
  wrappingElement?: JSX.Element,
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

  return <>{cloneElement(wrappingElement, {
    ref: drop,
    className: `${wrappingElement.props.className ?? ''} drop-item ${(isOver && canDrop) ? hoverClass : ''}`,
  }, children)}</>;
}
