import { useDrag } from 'react-dnd';
import { cloneElement, ReactNode } from 'react';

export function DragSource({type = 'item', item = null, enabled = true, wrappingElement = <div></div>, previewRef, children}: {
  type?: string,
  item?: any,
  enabled?: boolean,
  wrappingElement?: JSX.Element,
  previewRef?: React.RefObject<HTMLElement>,
  children?: ReactNode,
}): JSX.Element  {

  const [{ dragging }, drag, preview] = useDrag(
    () => ({
      type: type,
      item: item,
      collect: (monitor) => ({
        dragging: monitor.isDragging()
      }),
      canDrag: () => enabled,
    }), [type, enabled, item]
  )

  if (previewRef) {
    preview(previewRef)
  }

  return <>{cloneElement(wrappingElement, {
    ref: drag,
    className: `${enabled ? 'cursor-pointer' : ''} ${wrappingElement.props.className ?? ''}`,
    style: { ...wrappingElement.props.style, opacity: dragging ? 0.5 : 1 }
  }, children)}</>;
}
