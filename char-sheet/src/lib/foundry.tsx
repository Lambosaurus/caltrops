import caltrops from './caltrops'
import { RollInfo } from './rules'


function isPresent(): boolean {
    return window.opener != null
}

/**
 * Sends a roll to the Foundry module. `detail` is appended to the chat flavour text; `location` asks the module to
 * also roll a d12 hit-location die (modules before 1.0.5 ignore it and roll the d4s only).
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

const foundry = {
    isPresent: isPresent,
    submitRoll: submitRoll,
}

export default foundry;