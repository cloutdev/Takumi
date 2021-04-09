// Require express and body-parser
const express = require("express")
const manager = require("./webhookManager");
const getRawBody = require('raw-body')
// Initialize express and define a port
const app = express()
const PORT = 3000

// Tell express to use body-parser's JSON parsing
//app.use(bodyParser.json())
// Start express on the defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))

app.post("/", async (req, res) => {

  const rawReq = await getRawBody(req)
  manager.verifySellixWebhook(rawReq, req.headers);
  res.status(200).end() // Responding is important
})