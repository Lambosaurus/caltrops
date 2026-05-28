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
                        setMeta({ title: item.title, owner: item.owner })
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
            const items: SheetEquipment[] = (equipmentView.read('communal') ?? []).filter(Boolean)
            setCampaign(prev => {
                if (!prev) return prev
                const updated = { ...prev, items }
                if (token) {
                    server.writeCampaign(token, campaignId, meta?.title ?? '', updated)
                        .catch(e => alertError(`Error syncing campaign: ${e.message}`))
                }
                return updated
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

    function saveUpdated(updated: Campaign) {
        setCampaign(updated)
        selfWriting.current = true
        equipmentView.publish('communal', updated.items)
        if (token) {
            server.writeCampaign(token, campaignId, meta?.title ?? '', updated)
                .catch(e => alertError(`Error updating campaign: ${e.message}`))
        }
    }

    function addItem(equipment: Equipment) {
        if (!campaign) return
        const item: SheetEquipment = { name: equipment.name }
        if (equipment.custom) item.custom = true
        if (equipment.stack) { item.count = 1; item.stack = equipment.stack }
        saveUpdated({ ...campaign, items: [...campaign.items, item] })
    }

    function removeItem(index: number) {
        if (!campaign) return
        saveUpdated({ ...campaign, items: campaign.items.filter((_, i) => i !== index) })
    }

    function setItemCount(index: number, count: number) {
        if (!campaign) return
        saveUpdated({ ...campaign, items: campaign.items.map((item, i) => i === index ? { ...item, count } : item) })
    }

    // Drop from local equipment container into communal
    function onDropFromLocal(dragItem: { container: string, index: number }) {
        if (!campaign) return
        const sourceItems: SheetEquipment[] = (equipmentView.read(dragItem.container) ?? []).filter(Boolean)
        const dropped = sourceItems[dragItem.index]
        if (!dropped) return
        equipmentView.publish(dragItem.container, listUtil.delete(sourceItems, dragItem.index))
        saveUpdated({ ...campaign, items: [...campaign.items, { ...dropped }] })
    }

    const title = 'Communal'

    if (notFound) {
        return (
            <table className="table table-compact w-80">
                <thead><tr><th>Items: {title}</th></tr></thead>
                <tbody><tr><td className='text-error'>Campaign not found.</td></tr></tbody>
            </table>
        )
    }

    if (!campaign) {
        return (
            <table className="table table-compact w-80">
                <thead><tr><th>Items: {title}</th></tr></thead>
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
                            key={i}
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
