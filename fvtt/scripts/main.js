const CALTROPS_URI = "https://caltrops.tlembedded.com"

function caltrops_launch() {
  window.open(CALTROPS_URI)
}

function caltrops_escape(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// A d4 pool roll card (successes on a 4) built from dice the sheet has already rolled.
async function caltrops_show_rolled(rolled, text) {
  const results = rolled.map(r => ({ result: Number(r), active: true, success: Number(r) >= 4, count: Number(r) >= 4 ? 1 : 0 }))
  const total = results.filter(r => r.success).length
  try {
    const roll = Roll.fromData({
      class: "Roll",
      options: {},
      dice: [],
      formula: `${results.length}d4cs=4`,
      terms: [{ class: "Die", options: {}, evaluated: true, number: results.length, faces: 4, modifiers: ["cs=4"], results: results }],
      total: total,
      evaluated: true,
    })
    await roll.toMessage({ flavor: text })
  } catch (err) {
    // Older or newer Foundry data formats: fall back to a readable chat line.
    console.warn("caltrops: could not build roll card", err)
    const dice = results.map(r => r.success ? `<b>${r.result}</b>` : r.result).join(" ")
    await ChatMessage.create({ content: `${caltrops_escape(text)}<br>${results.length}d4: ${dice} → <b>${total}</b>`, speaker: ChatMessage.getSpeaker() })
  }
}

async function caltrops_recieve(data) {
  // data.text: string     - chat flavour for the roll
  // data.dice: number     - roll this many d4s, successes on a 4
  // data.location: bool   - also roll a d12 hit-location die (mech attacks)
  // data.rolled: number[] - the sheet already rolled these d4s (and applied them): show them as the roll's results
  // data.chat: string     - post a plain chat line instead

  if (typeof data.chat === "string") {
    await ChatMessage.create({ content: caltrops_escape(data.chat), speaker: ChatMessage.getSpeaker() })
    return
  }

  if (Array.isArray(data.rolled)) {
    await caltrops_show_rolled(data.rolled, data.text)
    return
  }

  if (typeof data.dice === "number") {
    let roll = await new Roll(`${data.dice}d4cs=4`).evaluate();
    //game.dice3d?.showForRoll(roll);
    await roll.toMessage( { flavor: data.text } )
  }

  if (data.location) {
    let location = await new Roll("1d12").evaluate();
    await location.toMessage( { flavor: `${data.text} · Hit location (d12)` } )
  }
}

Hooks.once('ready', () => {
  // Adds the message handler
  window.addEventListener("message", (event) => {
    if (event.origin == CALTROPS_URI) {
      caltrops_recieve(event.data)
    }
  }, false);
})

Hooks.on('renderSidebarTab', (tab, html) => {
  // Injects the caltrops button into the chat sidebar
  if (tab.tabName == "chat") {
    let button = $('<a class="chat-control-icon"><i class="fas fa-triangle"></i></a>')
    button.on('click', caltrops_launch)
    html.find('div#chat-controls').append(button)
  }
})
