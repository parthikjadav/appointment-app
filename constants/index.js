const USER_ROLES = {
    ADMIN: 'ADMIN',
    PROFESSIONAL: 'PROFESSIONAL',
    USER: 'USER'
};

const APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED'
};

const env = {
    APP_EMAIL: process.env.APP_EMAIL,
    APP_PASSWORD: process.env.APP_PASSWORD,
    BASE_URL: process.env.BASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
}

const PAYMENT_STATUS = {
    PAID: 'PAID',
    PENDING: 'PENDING',
    FAILED: 'FAILED'
}

module.exports = {
    USER_ROLES,
    APPOINTMENT_STATUS,
    PAYMENT_STATUS,
    env
}