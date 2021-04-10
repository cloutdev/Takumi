// Require express and body-parser
const express = require("express")
const manager = require("./webhookManager");
const getRawBody = require('raw-body')
// Initialize express and define a port
const app = express()
const PORT = 3000

// Start express on the defined port
function startServer(client){
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

  app.post("/", async (req, res) => {

    const rawReq = await getRawBody(req)
    manager.processSellixWebhook(rawReq, req.headers, client);
    res.status(200).end() // Responding is important
  })
}


module.exports.startServer = startServer;