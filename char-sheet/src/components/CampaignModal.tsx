// External imports
import { useEffect, useState } from 'react'

// Components
import ActionModal from './ActionModal'
import IconButton from './IconButton'
import LoadingSpinner from './LoadingSpinner'
import EquipmentSelectModal from './EquipmentSelectModal'
import { ImCross } from 'react-icons/im'

// Internal imports
import { Campaign, Equipment, Rules, SheetEquipment } from '../lib/rules'
import server, { ServerItem } from '../lib/server'
import { alertError, alertSuccess } from '../lib/alerts'
import { timeSince } from '../lib/util'
import { v4 as uuidv4 } from 'uuid'

type View = 'list' | 'edit'

function CampaignModal({ open, close, token, sheetId, rules, setActiveCampaignId }: {
    open: boolean,
    close(): void,
    token: string | null,
    sheetId: string | null,
    rules: Rules | undefined,
    setActiveCampaignId(id: string | null): void,
}): JSX.Element | null {

    const [campaigns, setCampaigns] = useState<ServerItem[] | null>(null)
    const [view, setView] = useState<View>('list')
    const [editId, setEditId] = useState<string>('')
    const [editTitle, setEditTitle] = useState<string>('')
    const [editCampaign, setEditCampaign] = useState<Campaign | null>(null)
    const [saving, setSaving] = useState(false)
    const [itemModalOpen, setItemModalOpen] = useState(false)

    const userEmail = token ? server.parseToken(token) : null

    useEffect(() => {
        if (open) {
            setCampaigns(null)
            setView('list')
            server.listCampaigns()
                .then(c => setCampaigns(c ?? []))
                .catch(e => alertError(`Error loading campaigns: ${e.message}`))
        }
    }, [open])

    if (!open || !rules) return null

    function reloadList() {
        setCampaigns(null)
        server.listCampaigns()
            .then(c => setCampaigns(c ?? []))
            .catch(e => alertError(`Error reloading campaigns: ${e.message}`))
    }

    function openCreate() {
        setEditId(uuidv4())
        setEditTitle('New Campaign')
        setEditCampaign({ type: 'campaign', members: [], items: [] })
        setView('edit')
    }

    function openEdit(item: ServerItem) {
        setEditId(item.id)
        setEditTitle(item.title)
        const content = item.content as Campaign
        setEditCampaign({ ...content, members: content.members ?? [], items: content.items ?? [] })
        setView('edit')
    }

    function activateCampaign(id: string) {
        setActiveCampaignId(id)
        close()
    }

    function deactivateCampaign() {
        setActiveCampaignId(null)
        close()
    }

    async function joinCampaign(campaignId: string) {
        if (!token || !sheetId) return
        try {
            await server.joinCampaign(token, campaignId, sheetId)
            alertSuccess('Joined campaign')
            activateCampaign(campaignId)
        } catch (e: any) {
            alertError(`Error joining campaign: ${e.message}`)
        }
    }

    function addItem(equipment: Equipment) {
        if (!editCampaign) return
        const item: SheetEquipment = { name: equipment.name }
        if (equipment.custom) item.custom = true
        if (equipment.stack) { item.count = 1; item.stack = equipment.stack }
        setEditCampaign({ ...editCampaign, items: [...editCampaign.items, item] })
    }

    function removeItem(index: number) {
        if (!editCampaign) return
        setEditCampaign({ ...editCampaign, items: editCampaign.items.filter((_, i) => i !== index) })
    }

    async function save() {
        if (!editCampaign || !editTitle.trim() || !token) return
        setSaving(true)
        try {
            await server.writeCampaign(token, editId, editTitle.trim(), editCampaign)
            alertSuccess('Campaign saved')
            reloadList()
            setView('list')
        } catch (e: any) {
            alertError(`Error saving campaign: ${e.message}`)
        } finally {
            setSaving(false)
        }
    }

    if (view === 'edit' && editCampaign) {
        return (
            <ActionModal
                open={open}
                close={() => setView('list')}
                title={editTitle || 'New Campaign'}
                actions={[
                    {
                        name: saving ? 'Saving...' : 'Save',
                        type: 'primary',
                        disabled: saving || !editTitle.trim(),
                        callback: save,
                        stayOpen: true,
                    }
                ]}
            >
                <div className='flex flex-col gap-3 w-full'>
                    <input
                        className='input input-bordered w-full'
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder='Campaign name'
                    />

                    <div>
                        <h3 className='font-bold mb-1'>Shared Items</h3>
                        {editCampaign.items.length === 0 && (
                            <p className='text-sm opacity-60'>No items.</p>
                        )}
                        {editCampaign.items.map((item, i) => (
                            <div key={i} className='flex items-center gap-2 mb-1'>
                                <span className='grow text-sm'>{item.name}{item.stack ? ` ×${item.count ?? 0}` : ''}</span>
                                <button
                                    className='btn btn-xs btn-ghost btn-square text-error'
                                    onClick={() => removeItem(i)}
                                >
                                    <ImCross size={10} />
                                </button>
                            </div>
                        ))}
                        <div className='flex justify-center mt-2'>
                            <IconButton icon='plus' enabled={true} onClick={() => setItemModalOpen(true)} />
                        </div>
                    </div>
                </div>

                <EquipmentSelectModal
                    open={itemModalOpen}
                    close={() => setItemModalOpen(false)}
                    enabled={true}
                    equipment={itemModalOpen ? rules.equipment : []}
                    addEquipment={addItem}
                />
            </ActionModal>
        )
    }

    return (
        <ActionModal
            open={open}
            close={close}
            title='Campaigns'
            actions={token ? [
                {
                    name: '+ New Campaign',
                    type: 'primary',
                    callback: openCreate,
                    stayOpen: true,
                },
                {
                    name: 'Leave Campaign',
                    callback: deactivateCampaign,
                },
            ] : []}
        >
            {campaigns === null ? (
                <LoadingSpinner />
            ) : campaigns.length === 0 ? (
                <p className='py-2'>No campaigns yet.</p>
            ) : (
                <div className='flex flex-col gap-2 py-2 w-full max-w-sm'>
                    {campaigns.map(c => {
                        const isMember = sheetId && (c.content as Campaign)?.members?.includes(sheetId)
                        const isOwner = c.owner === userEmail
                        return (
                            <div key={c.id} className='flex gap-2 w-full'>
                                <button
                                    className='btn btn-primary p-0 grow'
                                    onClick={() => isMember ? activateCampaign(c.id) : joinCampaign(c.id)}
                                >
                                    <div>
                                        <h2 className='font-bold text-lg normal-case'>{c.title}</h2>
                                        <p className='text-xs normal-case opacity-75'>
                                            DM: {c.owner} · {timeSince(new Date(c.time))} ago · {(c.content as Campaign)?.members?.length ?? 0} members
                                        </p>
                                        <p className='text-xs normal-case opacity-75'>
                                            {isMember ? 'Active — click to switch' : 'Click to join'}
                                        </p>
                                    </div>
                                </button>
                                {isOwner && (
                                    <button
                                        className='btn btn-outline btn-square'
                                        onClick={() => openEdit(c)}
                                        title='Edit campaign'
                                    >
                                        ✎
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </ActionModal>
    )
}

export default CampaignModal
