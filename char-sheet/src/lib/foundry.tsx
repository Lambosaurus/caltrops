import caltrops from './caltrops'
import { RollInfo } from './rules'


function isPresent(): boolean {
    return window.opener != null
}

/** Sends a roll to the Foundry module, which rolls the d4s. `detail` is appended to the chat flavour text. */
function submitRoll(roll: RollInfo, opts: { detail?: string } = {}): void {
    let text = caltrops.rollDescribe(roll)
    if (opts.detail) {
        text = `${text} · ${opts.detail}`
    }
    const body = {
        dice: Math.max(0, caltrops.rollDiceCount(roll)),
        text: text,
    }
    window.opener.postMessage(body, "*")
}

const foundry = {
    isPresent: isPresent,
    submitRoll: submitRoll,
}

export default foundry;