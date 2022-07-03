const express = require('express');
const PaytmChecksum = require('paytmchecksum');
const https = require('https');

const UserExam = require('../models/UserExam');

const { requireAuth, checkUser } = require('../middleware/authMiddleware');


const router = express.Router();

router.get('/payment/:exam/:email/:price', requireAuth, (req, res) => {
    const exam = req.params.exam;
    const email = req.params.email;
    const price = req.params.price;
    var paytmParams = {};
    const orderId = "ORDERID_" + new Date().getTime();
    paytmParams.body = {
        "requestType": "Payment",
        "mid": process.env.PAYTM_MID,
        "websiteName": "DEFAULT",
        "orderId": orderId,
        "callbackUrl": "https://studyandshine.herokuapp.com/callback/"+exam+"/"+email,
        "txnAmount": {
            "value": price,
            "currency": "INR",
        },
        "userInfo": {
            "custId": "CUST_001",
        },
    };

    /*
    * Generate checksum by parameters we have in body
    * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
    */
    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_KEY).then(function (checksum) {

        paytmParams.head = {
            "signature": checksum
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {

            /* for Staging */
            hostname: 'securegw-stage.paytm.in',

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: '/theia/api/v1/initiateTransaction?mid=' + process.env.PAYTM_MID + '&orderId=' + orderId,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        var response = "";
        var req_post = https.request(options, res_post => {
            res_post.on('data', chunk => {
                response += chunk;
            });

            res_post.on('end', () => {
                response = JSON.parse(response);
                const txnToken = response.body.txnToken;
                res.render('payment', { txnToken, price, orderId });
            });

        });
        req_post.write(post_data);
        req_post.end();
    });
})

router.post('/callback/:exam/:email', checkUser, (req, res) => {
    const { exam, email } = req.params;

    const callback_data = JSON.parse(JSON.stringify(req.body));



    let isChecksumValid = PaytmChecksum.verifySignature(callback_data, process.env.PAYTM_KEY, callback_data.CHECKSUMHASH);
    if (isChecksumValid) {

        var paytmParams = {};
        paytmParams.body = {
            "mid": callback_data.MID,
            "orderId": callback_data.ORDERID,
        };
        PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_KEY).then((checksum) => {
            paytmParams.head = {
                "signature": checksum
            };
            var post_data = JSON.stringify(paytmParams);
            var options = {

                /* for Staging */
                hostname: 'securegw-stage.paytm.in',

                /* for Production */
                // hostname: 'securegw.paytm.in',

                port: 443,
                path: '/v3/order/status',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': post_data.length
                }
            };

            // Set up the request
            var response = "";
            var post_req = https.request(options, post_res => {
                post_res.on('data', chunk => {
                    response += chunk;
                });

                post_res.on('end', async () => {

                    response = JSON.parse(response);

                    let resultMessage = ""
                    if (response.body.resultInfo.resultStatus === "TXN_SUCCESS") {
                        resultMessage = "Transaction was successful";

                        const userexam = await UserExam.findOneAndUpdate(
                            {
                                email: email,
                                exam: exam,
                            },
                            {fee_paid : 'yes'},
                            {new: true}
                        );

                    }
                    else {
                        resultMessage = "Transaction was not successful";
                    }
                    const txnId = response.body.txnId;
                    const bankTxnId = response.body.bankTxnId;
                    const orderId = response.body.orderId;
                    const txnAmount = response.body.txnAmount;
                    const bankName = response.body.bankName;
                    const txnDate = response.body.txnDate;
                    res.render('callback', { resultMessage, bankTxnId, orderId, txnAmount, bankName, txnDate });
                });
            });

            // post the data
            post_req.write(post_data);
            post_req.end();
        });
    }
    else {
        console.log("Checksum Mismatch");
    }

})

module.exports = router;



