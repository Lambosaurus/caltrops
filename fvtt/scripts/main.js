const CALTROPS_URI = "https://caltrops.tlembedded.com"

function caltrops_launch() {
  window.open(CALTROPS_URI)
}

async function caltrops_recieve(data) {
  // data.text: string
  // data.dice: number
  
  let rollstring = `${data.dice}d4cs=4`

  let roll = await new Roll(rollstring).evaluate();
  //game.dice3d?.showForRoll(roll);

  await roll.toMessage( { flavor: data.text } )
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
