const crypto = require('crypto');

async function verifySellixWebhook(request, headers){

	const secret = "3pHyz1Ux8S9Iiy5BBMJNsBJtmnLHezgk";
	const received_signature = headers["x-sellix-signature"];
    var digest = crypto
		.createHmac('sha512', secret)
		.update(request, 'utf8', 'hex')
		.digest('hex');
	
	if(received_signature === digest){
		console.log("signatures match!")
		const body = JSON.parse(request.toString());
		if(body.event == "order:paid"){
			console.log(body)
		}

	}else console.log("sigs not equal");
}

module.exports.verifySellixWebhook = verifySellixWebhook;