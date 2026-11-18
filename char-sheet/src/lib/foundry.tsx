import caltrops from './caltrops'
import { RollInfo } from './rules'


function isPresent(): boolean {
    return window.opener != null
}

/**
 * Sends a roll to the Foundry module, which rolls the d4s. `detail` is appended to the chat flavour text; `location`
 * asks the module to also roll a d12 hit-location die (module 1.0.5 and later).
 */
function submitRoll(roll: RollInfo, opts: { detail?: string, location?: boolean } = {}): void {
    let text = caltrops.rollDescribe(roll)
    if (opts.detail) {
        text = `${text} · ${opts.detail}`
    }
    const body: { dice: number, text: string, location?: boolean } = {
        dice: Math.max(0, caltrops.rollDiceCount(roll)),
        text: text,
    }
    if (opts.location) {
        body.location = true
    }
    window.opener.postMessage(body, "*")
}

/** Sends a bare d4 pool (successes on 4) for Foundry to roll, e.g. a cook-off the player applies by hand. */
function submitDice(dice: number, text: string): void {
    window.opener.postMessage({ dice: Math.max(0, dice), text: text }, "*")
}

/** Posts a chat line to Foundry, e.g. a roll the sheet has already made and applied (module 1.1.0 and later). */
function submitChat(text: string): void {
    window.opener.postMessage({ chat: text }, "*")
}

/**
 * Shows dice the sheet has already rolled (and applied) as a normal Foundry d4 roll card, so it reads like any other
 * roll (module 1.1.1 and later).
 */
function submitRolled(rolled: number[], text: string): void {
    window.opener.postMessage({ dice: rolled.length, rolled: rolled, text: text }, "*")
}

/**
 * The modal action that sends a result already rolled in the sheet to Foundry as a roll card (for when the roll was
 * made here instead of in the VTT). Null without Foundry. `sent` / `setSent` keep it to one send per result.
 */
function sendResultAction(dice: number[], text: string, sent: boolean, setSent: (sent: boolean) => void) {
    if (!isPresent()) return null
    return {
        name: sent ? 'Sent to VTT' : 'Send result to VTT',
        disabled: sent,
        stayOpen: true,
        callback: () => { submitRolled(dice, text); setSent(true) },
    }
}

const foundry = {
    isPresent: isPresent,
    submitRoll: submitRoll,
    submitDice: submitDice,
    submitChat: submitChat,
    submitRolled: submitRolled,
    sendResultAction: sendResultAction,
}

export default foundry;