const CALTROPS_URI = "https://caltrops.tlembedded.com"

function caltrops_launch() {
  window.open(CALTROPS_URI)
}

function caltrops_escape(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

async function caltrops_recieve(data) {
  // data.text: string     - chat flavour for the roll
  // data.dice: number     - roll this many d4s, successes on a 4
  // data.location: bool   - also roll a d12 hit-location die (mech attacks)
  // data.chat: string     - post a plain chat line instead (a roll the sheet has already made and applied)

  if (typeof data.chat === "string") {
    await ChatMessage.create({ content: caltrops_escape(data.chat), speaker: ChatMessage.getSpeaker() })
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
