// External imports
import { useEffect, useRef, useState } from 'react'

// Components
import IconButton from './IconButton'
import EquipmentSelectModal from './EquipmentSelectModal'
import ActionModal from './ActionModal'
import PointEntryBox from './PointEntryBox'
import { DragSource } from './dnd/DragSource'
import { DropTarget } from './dnd/DropTarget'

// Internal imports
import { Campaign, Equipment, Rules, SheetEquipment } from '../lib/rules'
import server, { ServerItem } from '../lib/server'
import { alertError } from '../lib/alerts'
import { View } from '../lib/objectservice'
import { listUtil } from '../lib/util'
import { v4 as uuidv4 } from 'uuid'

const POLL_INTERVAL_MS = 5000

interface PendingTransfer {
    item: SheetEquipment,
    direction: 'toLocal' | 'toCommunal',
    sourceContainer?: string,
    quantity: number,
}

function CampaignPanel({ campaignId, sheetId, token, rules, equipmentView }: {
    campaignId: string,
    sheetId: string | null,
    token: string | null,
    rules: Rules,
    equipmentView: View,
}): JSX.Element {

    const [campaign, setCampaign] = useState<Campaign | null>(null)
    const [meta, setMeta] = useState<{ title: string, owner: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null)
    const selfWriting = useRef(false)
    const metaRef = useRef<{ title: string, owner: string } | null>(null)

    const canEdit = !!(token && campaign)

    useEffect(() => {
        let cancelled = false

        function refresh() {
            server.read(campaignId)
                .then((item: ServerItem) => {
                    if (cancelled) return
                    if (item?.content?.type === 'campaign') {
                        const c: Campaign = { ...item.content, members: item.content.members ?? [], items: item.content.items ?? [] }
                        setCampaign(c)
                        metaRef.current = { title: item.title, owner: item.owner }
                        setMeta(metaRef.current)
                        setNotFound(false)
                        selfWriting.current = true
                        equipmentView.publish('communal', c.items)
                    } else {
                        setNotFound(true)
                    }
                })
                .catch(() => {
                    if (!cancelled) setNotFound(true)
                })
        }

        // Watch for EquipmentTable dropping communal items into local containers
        // (non-stackable only — stackable transfers go through confirmTransfer)
        const unsub = equipmentView.view('communal').subscribe('', () => {
            if (selfWriting.current) { selfWriting.current = false; return }
            if (cancelled) return
            const remaining: SheetEquipment[] = (equipmentView.read('communal') ?? []).filter(Boolean)
            setCampaign(prev => {
                if (!prev) return prev
                // Find the removed item by uid if available, else by name
                const remainingUids = new Set(remaining.map(r => r.uid).filter(Boolean))
                const remainingNames = [...remaining]
                let removedItem: SheetEquipment | null = null
                for (const item of prev.items) {
                    if (item.uid) {
                        if (!remainingUids.has(item.uid)) { removedItem = item; break }
                    } else {
                        const idx = remainingNames.findIndex(r => r.name === item.name)
                        if (idx === -1) { removedItem = item; break }
                        remainingNames.splice(idx, 1)
                    }
                }
                if (!removedItem) return prev
                if (removedItem.stack && (removedItem.count ?? 0) > 1 && token) {
                    // Stackable: restore communal view and show quantity picker instead
                    selfWriting.current = true
                    equipmentView.publish('communal', prev.items)
                    setPendingTransfer({
                        item: removedItem,
                        direction: 'toLocal',
                        quantity: 1,
                    })
                    return prev
                }
                if (!token) return { ...prev, items: remaining }
                const uid = removedItem.uid
                const name = removedItem.name
                server.patchCampaign(token, campaignId, current => {
                    if (uid) return { ...current, items: current.items.filter(item => item.uid !== uid) }
                    const i = current.items.findIndex(item => item.name === name)
                    if (i === -1) return current
                    return { ...current, items: current.items.filter((_, idx) => idx !== i) }
                }).then(patched => {
                    if (cancelled) return
                    selfWriting.current = true
                    setCampaign(patched)
                    equipmentView.publish('communal', patched.items)
                }).catch(e => alertError(`Error syncing campaign: ${e.message}`))
                return { ...prev, items: remaining }
            })
        })

        refresh()
        const id = setInterval(refresh, POLL_INTERVAL_MS)
        return () => {
            cancelled = true
            clearInterval(id)
            unsub()
            equipmentView.delete('communal')
        }
    }, [campaignId])

    function lookupDescription(name: string): string {
        for (const e of rules.equipment) {
            if (e.name === name) return e.description ?? name
        }
        return name
    }

    function applyPatch(
        optimistic: Campaign,
        patch: (c: Campaign) => Campaign,
    ) {
        setCampaign(optimistic)
        selfWriting.current = true
        equipmentView.publish('communal', optimistic.items)
        if (!token) return
        server.patchCampaign(token, campaignId, patch)
            .then(patched => {
                // Reconcile: server state may differ if another user wrote concurrently
                if (JSON.stringify(patched.items) !== JSON.stringify(optimistic.items)) {
                    selfWriting.current = true
                    setCampaign(patched)
                    equipmentView.publish('communal', patched.items)
                }
            })
            .catch(e => alertError(`Error updating campaign: ${e.message}`))
    }

    function addItem(equipment: Equipment) {
        if (!campaign) return
        const newItem: SheetEquipment = { name: equipment.name, uid: uuidv4() }
        if (equipment.custom) newItem.custom = true
        if (equipment.stack) { newItem.count = 1; newItem.stack = equipment.stack }
        applyPatch(
            { ...campaign, items: [...campaign.items, newItem] },
            c => ({ ...c, items: [...c.items, newItem] }),
        )
    }

    function removeItem(index: number) {
        if (!campaign) return
        const uid = campaign.items[index]?.uid
        applyPatch(
            { ...campaign, items: campaign.items.filter((_, i) => i !== index) },
            c => ({ ...c, items: uid ? c.items.filter(item => item.uid !== uid) : c.items.filter((_, i) => i !== index) }),
        )
    }

    function setItemCount(index: number, count: number) {
        if (!campaign) return
        const uid = campaign.items[index]?.uid
        applyPatch(
            { ...campaign, items: campaign.items.map((item, i) => i === index ? { ...item, count } : item) },
            c => ({
                ...c,
                items: uid
                    ? c.items.map(item => item.uid === uid ? { ...item, count } : item)
                    : c.items.map((item, i) => i === index ? { ...item, count } : item),
            }),
        )
    }

    // Drop from local equipment container into communal
    function onDropFromLocal(dragItem: { container: string, index: number }) {
        if (!campaign) return
        const sourceItems: SheetEquipment[] = (equipmentView.read(dragItem.container) ?? []).filter(Boolean)
        const dropped = sourceItems[dragItem.index]
        if (!dropped) return
        if (dropped.stack && (dropped.count ?? 0) > 1) {
            setPendingTransfer({
                item: { ...dropped, uid: dropped.uid ?? uuidv4() },
                direction: 'toCommunal',
                sourceContainer: dragItem.container,
                quantity: 1,
            })
            return
        }
        // Non-stackable: transfer immediately
        equipmentView.publish(dragItem.container, listUtil.delete(sourceItems, dragItem.index))
        const droppedCopy = { ...dropped, uid: dropped.uid ?? uuidv4() }
        applyPatch(
            { ...campaign, items: [...campaign.items, droppedCopy] },
            c => ({ ...c, items: [...c.items, droppedCopy] }),
        )
    }

    function confirmTransfer() {
        if (!pendingTransfer || !campaign || !token) return
        const { item, direction, sourceContainer, quantity } = pendingTransfer
        setPendingTransfer(null)

        if (direction === 'toCommunal') {
            const sourceItems: SheetEquipment[] = (equipmentView.read(sourceContainer!) ?? []).filter(Boolean)
            const srcIdx = sourceItems.findIndex(i => i.uid ? i.uid === item.uid : i.name === item.name)
            if (srcIdx === -1) return
            const src = sourceItems[srcIdx]
            const remaining = (src.count ?? 0) - quantity
            if (remaining <= 0) {
                equipmentView.publish(sourceContainer!, listUtil.delete(sourceItems, srcIdx))
            } else {
                const updated = sourceItems.map((i, idx) => idx === srcIdx ? { ...i, count: remaining } : i)
                equipmentView.publish(sourceContainer!, updated)
            }
            const communalItem: SheetEquipment = { ...item, count: quantity, uid: item.uid ?? uuidv4() }
            applyPatch(
                { ...campaign, items: [...campaign.items, communalItem] },
                c => ({ ...c, items: [...c.items, communalItem] }),
            )
        } else {
            // toLocal: decrement or remove from communal, add to local container
            const uid = item.uid
            const name = item.name
            const remaining = (item.count ?? 0) - quantity
            applyPatch(
                {
                    ...campaign,
                    items: remaining <= 0
                        ? campaign.items.filter(i => uid ? i.uid !== uid : i.name !== name)
                        : campaign.items.map(i => (uid ? i.uid === uid : i.name === name) ? { ...i, count: remaining } : i),
                },
                c => {
                    const idx = uid ? c.items.findIndex(i => i.uid === uid) : c.items.findIndex(i => i.name === name)
                    if (idx === -1) return c
                    const cur = c.items[idx]
                    const rem = (cur.count ?? 0) - quantity
                    if (rem <= 0) return { ...c, items: c.items.filter((_, i) => i !== idx) }
                    return { ...c, items: c.items.map((i, n) => n === idx ? { ...i, count: rem } : i) }
                },
            )
            // Add taken quantity to local container (first available personal container)
            const destContainer = equipmentView.read('') != null
                ? Object.keys(equipmentView.read('') ?? {}).find(k => k !== 'communal') ?? 'personal'
                : 'personal'
            const destItems: SheetEquipment[] = (equipmentView.read(destContainer) ?? []).filter(Boolean)
            const takenItem: SheetEquipment = { ...item, count: quantity, uid: uuidv4() }
            equipmentView.publish(destContainer, [...destItems, takenItem])
        }
    }

    const title = campaign?.stashName?.trim() || 'Communal'

    if (notFound) {
        return (
            <table className="table table-compact w-80">
                <thead><tr><th>Items: Communal</th></tr></thead>
                <tbody><tr><td className='text-error'>Campaign not found.</td></tr></tbody>
            </table>
        )
    }

    if (!campaign) {
        return (
            <table className="table table-compact w-80">
                <thead><tr><th>Items: Communal</th></tr></thead>
                <tbody><tr><td>Loading...</td></tr></tbody>
            </table>
        )
    }

    return (
        <DropTarget accept='equipment' enabled={canEdit} onDrop={onDropFromLocal}>
            <table className="table table-compact w-80">
                <thead>
                    <tr><th colSpan={3}>Items: {title}</th></tr>
                </thead>
                <tbody>
                    {campaign.items.map((item, i) => (
                        <tr
                            className='hover tooltip tooltip-left w-full'
                            data-tip={lookupDescription(item.name)}
                            key={item.uid ?? i}
                        >
                            <td className='w-full text-left'>
                                <DragSource type='communal' item={{ index: i }} enabled={canEdit}>
                                    {item.name}
                                </DragSource>
                            </td>
                            <td>
                                <PointEntryBox
                                    value={item.count ?? 0}
                                    setValue={v => setItemCount(i, v)}
                                    max={item.stack ?? 1}
                                    visible={(item.stack ?? 1) > 1}
                                    editable={canEdit}
                                />
                            </td>
                            <td>
                                <IconButton
                                    icon='cross'
                                    onClick={() => removeItem(i)}
                                    btnStyle='btn-outline btn-error'
                                    enabled={canEdit}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={3}>
                            <div className='flex justify-center'>
                                <IconButton
                                    icon='plus'
                                    enabled={canEdit}
                                    onClick={() => setModalOpen(true)}
                                />
                            </div>
                        </th>
                    </tr>
                </tfoot>
            </table>

            <EquipmentSelectModal
                open={modalOpen}
                close={() => setModalOpen(false)}
                enabled={canEdit}
                equipment={modalOpen ? rules.equipment : []}
                addEquipment={addItem}
            />

            <ActionModal
                open={!!pendingTransfer}
                close={() => setPendingTransfer(null)}
                title={pendingTransfer?.direction === 'toCommunal' ? 'Add to communal stash' : 'Take from communal stash'}
                actions={[
                    {
                        name: 'Confirm',
                        type: 'primary',
                        callback: confirmTransfer,
                        disabled: !pendingTransfer || pendingTransfer.quantity < 1 || pendingTransfer.quantity > (pendingTransfer.item.count ?? 0),
                    }
                ]}
            >
                {pendingTransfer && (
                    <div className='flex flex-col gap-3 py-2'>
                        <p className='text-sm'>{pendingTransfer.item.name} — {pendingTransfer.item.count ?? 0} available</p>
                        <div className='flex items-center gap-3'>
                            <label className='text-sm'>Quantity:</label>
                            <input
                                type='number'
                                className='input input-bordered w-24'
                                min={1}
                                max={pendingTransfer.item.count ?? 1}
                                value={pendingTransfer.quantity}
                                onChange={e => setPendingTransfer({
                                    ...pendingTransfer,
                                    quantity: Math.max(1, Math.min(pendingTransfer.item.count ?? 1, parseInt(e.target.value) || 1))
                                })}
                            />
                            <span className='text-sm opacity-60'>/ {pendingTransfer.item.count ?? 0}</span>
                        </div>
                    </div>
                )}
            </ActionModal>
        </DropTarget>
    )
}

export default CampaignPanel
