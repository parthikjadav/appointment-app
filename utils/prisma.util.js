const { PrismaClient } = require("@prisma/client")

const prisma = globalThis.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

module.exports = prisma