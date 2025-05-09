require("dotenv").config();
const expressAsyncHandler = require("express-async-handler");
const { PAYMENT_STATUS } = require("../constants");
const sendEmail = require("../mail");
const prisma = require("./prisma.util");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, appointmentId) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Appointment Payment',
                    },
                    unit_amount: amount * 100 // cents
                },
                quantity: 1
            }],
            metadata: {
                appointmentId,
            },
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/success`,
        });

        return session.url;
    } catch (error) {
        console.error("Stripe Error:", error.message);
        return false;
    }
};

const webhook = expressAsyncHandler(async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(session.payment_intent, "session");
        const appointmentId = session.metadata.appointmentId;
        // Update the appointment status to "paid"
        const appointment = await prisma.appointment.update({
            where: { id: appointmentId },
            data: { isPaid: true, paymentIntentId: session.payment_intent },
            include: {
                user: true,
                professional: true
            }
        })
        await prisma.payment.create({
            data: {
                paymentIntentId: session.payment_intent,
                appointmentId: appointmentId,
                amount: session.amount_total,
                status: PAYMENT_STATUS.PAID,
            },
        })
        await sendEmail(appointment.user.email, 'Appointment Payment', 'Your appointment has been paid');
        await sendEmail(appointment.professional.email, 'Appointment Payment', 'Your appointment has been paid');
    }
})

// For testing only — remove this in production

module.exports = { createPaymentIntent, webhook,stripe };
