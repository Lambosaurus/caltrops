// External imports
import { useEffect, useRef, useState } from 'react'

// Components
import IconButton from './IconButton'
import EquipmentSelectModal from './EquipmentSelectModal'
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
        const unsub = equipmentView.view('communal').subscribe('', () => {
            if (selfWriting.current) { selfWriting.current = false; return }
            if (cancelled) return
            const remaining: SheetEquipment[] = (equipmentView.read('communal') ?? []).filter(Boolean)
            setCampaign(prev => {
                if (!prev) return prev
                if (!token) return { ...prev, items: remaining }
                // Find the removed item by uid if available, else by name
                const remainingUids = new Set(remaining.map(r => r.uid).filter(Boolean))
                const remainingNames = [...remaining]
                let removedUid: string | null = null
                let removedName: string | null = null
                for (const item of prev.items) {
                    if (item.uid) {
                        if (!remainingUids.has(item.uid)) { removedUid = item.uid; break }
                    } else {
                        const idx = remainingNames.findIndex(r => r.name === item.name)
                        if (idx === -1) { removedName = item.name; break }
                        remainingNames.splice(idx, 1)
                    }
                }
                if (!removedUid && !removedName) return prev
                const uidToRemove = removedUid
                const nameToRemove = removedName
                server.patchCampaign(token, campaignId, current => {
                    if (uidToRemove) {
                        return { ...current, items: current.items.filter(item => item.uid !== uidToRemove) }
                    }
                    const i = current.items.findIndex(item => item.name === nameToRemove)
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
        equipmentView.publish(dragItem.container, listUtil.delete(sourceItems, dragItem.index))
        // Assign a uid if the item doesn't have one (came from local sheet which predates uid)
        const droppedCopy = { ...dropped, uid: dropped.uid ?? uuidv4() }
        applyPatch(
            { ...campaign, items: [...campaign.items, droppedCopy] },
            c => ({ ...c, items: [...c.items, droppedCopy] }),
        )
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
        </DropTarget>
    )
}

export default CampaignPanel
