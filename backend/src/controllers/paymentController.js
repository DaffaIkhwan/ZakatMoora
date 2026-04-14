const midtransClient = require('midtrans-client');
const prisma = require('../prisma');
const crypto = require('crypto');

// Create Snap Token for Muzakki Donation
const createSnapToken = async (req, res) => {
    const { amount, notes, isAnonymous } = req.body;
    const { user } = req; // From authenticateToken middleware

    try {
        console.log('Initiating donation (Dana Terkumpul):', { amount, userId: user?.id });
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Amount must be greater than 0' });
        }

        const muzakki = await prisma.muzakki.findUnique({
            where: { userId: user.id }
        });

        if (!muzakki) {
            console.error('Muzakki profile not found for user:', user.id);
            return res.status(404).json({ error: 'Muzakki profile not found' });
        }

        // Create Snap instance
        let snap = new midtransClient.Snap({
            isProduction: false, // Sandbox
            serverKey: process.env.MIDTRANS_SERVER_KEY,
            clientKey: process.env.MIDTRANS_CLIENT_KEY
        });

        const donationId = crypto.randomUUID();

        let parameter = {
            transaction_details: {
                order_id: donationId,
                gross_amount: parseInt(amount)
            },
            customer_details: {
                first_name: muzakki.name,
                email: user.email || user.username || 'muzakki@example.com',
                phone: muzakki.phone || '08123456789'
            },
            item_details: [{
                id: 'ZAKAT-POOL',
                price: parseInt(amount),
                quantity: 1,
                name: 'Zakat - Dana Terkumpul'
            }]
        };

        console.log('Sending to Midtrans (Dana Terkumpul):', JSON.stringify(parameter, null, 2));
        const transaction = await snap.createTransaction(parameter);
        console.log('Midtrans transaction created:', transaction.token);
        
        // Save pending donation — programId is NULL (Dana Terkumpul / Pool)
        try {
            const donation = await prisma.donation.create({
                data: {
                    id: donationId,
                    muzakkiId: muzakki.id,
                    programId: null,
                    amount: parseFloat(amount),
                    notes: notes || 'Zakat via Midtrans - Dana Terkumpul',
                    paymentMethod: 'Midtrans',
                    status: 'pending',
                    isAnonymous: isAnonymous === true,
                    isAllocation: false,
                    snapToken: transaction.token
                }
            });
            console.log('Donation record created in DB (pool):', donation.id);

            res.json({ 
                token: transaction.token, 
                redirect_url: transaction.redirect_url,
                donationId: donation.id
            });
        } catch (dbError) {
            console.error('Database error creating donation:', dbError);
            res.status(500).json({ error: 'Database failed to record donation. Please check if schema is updated.' });
        }

    } catch (error) {
        console.error('Midtrans createSnapToken error:', error);
        res.status(500).json({ error: 'Midtrans initiation failed: ' + error.message });
    }
};

// Handle Midtrans Webhook Notification
const handleWebhook = async (req, res) => {
    const notification = req.body;

    let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    try {
        const statusResponse = await snap.transaction.notification(notification);
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        console.log(`Midtrans notification: Order ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

        let donationStatus = 'pending';

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                donationStatus = 'challenge';
            } else if (fraudStatus === 'accept') {
                donationStatus = 'success';
            }
        } else if (transactionStatus === 'settlement') {
            donationStatus = 'success';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            donationStatus = 'failed';
        } else if (transactionStatus === 'pending') {
            donationStatus = 'pending';
        }

        // Update donation status
        await prisma.donation.update({
            where: { id: orderId },
            data: { 
                status: donationStatus,
                donationDate: donationStatus === 'success' ? new Date() : undefined
            }
        });

        res.status(200).send('OK');
    } catch (error) {
        console.error('Midtrans webhook error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Verify Payment Status (for frontend polling or manual check)
const verifyPayment = async (req, res) => {
    const { orderId } = req.params;
    
    let snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
    });

    try {
        console.log(`Verifying payment status for Order ${orderId}...`);
        const statusResponse = await snap.transaction.status(orderId);
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        let donationStatus = 'pending';

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                donationStatus = 'challenge';
            } else if (fraudStatus === 'accept') {
                donationStatus = 'success';
            }
        } else if (transactionStatus === 'settlement') {
            donationStatus = 'success';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
            donationStatus = 'failed';
        } else if (transactionStatus === 'pending') {
            donationStatus = 'pending';
        }

        // Update donation status in DB
        const updatedDonation = await prisma.donation.update({
            where: { id: orderId },
            data: { 
                status: donationStatus,
                donationDate: donationStatus === 'success' ? new Date() : undefined
            }
        });

        res.json({ status: donationStatus, donation: updatedDonation });
    } catch (error) {
        console.error('Midtrans verifyPayment error:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSnapToken,
    handleWebhook,
    verifyPayment
};
