const USER_ROLES = {
    ADMIN: 'ADMIN',
    PROFESSIONAL: 'PROFESSIONAL',
    USER: 'USER'
};

const APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

const env = {
    APP_EMAIL: process.env.APP_EMAIL,
    APP_PASSWORD: process.env.APP_PASSWORD,
}

module.exports = {
    USER_ROLES,
    APPOINTMENT_STATUS,
    env
}