import { View } from './objectservice'
import { listUtil } from './util'

/* What an equipment row carries while dragged. `path` is the source container's absolute view path. */
export type EquipmentDrag = {
  container: string,
  index: number,
  path?: string,
}

/*
 * Applies a drop of `item` onto the container behind `dest` at position `dropIdx`.
 * Source and destination are resolved by absolute path from the root view, so containers
 * living under different roots (the pilot's inventory and a mech's stowage) work like any other pair.
 * Drags without a path fall back to a sibling of the destination, found by name.
 * Returns true when something moved. A cross-container drop into a full container is refused.
 */
export function applyEquipmentDrop(dest: View, item: EquipmentDrag, dropIdx: number, destSize?: number): boolean {
  const depth = dest.path.split('/').filter(Boolean).length
  const root = dest.view('../'.repeat(depth))
  const destPath = dest.path
  const sourcePath = item.path ?? dest.view(`../${item.container}`).path

  const sourceItems = root.read(sourcePath)
  const destItems = root.read(destPath) ?? []
  if (!sourceItems || sourceItems[item.index] === undefined) return false

  if (sourcePath === destPath) {
    root.publish(sourcePath, listUtil.move(sourceItems, item.index, dropIdx))
    return true
  }
  if (destSize !== undefined && destItems.length >= destSize) return false
  root.publish(sourcePath, listUtil.delete(sourceItems, item.index))
  root.publish(destPath, listUtil.insert(destItems, dropIdx, sourceItems[item.index]))
  return true
}
