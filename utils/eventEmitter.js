const EventEmitter = require('events')
const sendMail = require('../mail')

const event = new EventEmitter()

event.on("appointment:cancelled",async(data)=>{
    const {user,professional} = data
    await sendMail(user.email,`Appointment Cancelled`,`Your appointment with <b>${professional.name}</b> has been cancelled`)
    await sendMail(professional.email,`Appointment Cancelled`,`Your appointment with <b>${user.name}</b> has been cancelled`)
})
event.on("appointment:created",async(data)=>{
    const {user,professional} = data
    await sendMail(user.email,`Appointment Created`,`Your appointment with <b>${professional.name}</b> has been created`)
    await sendMail(professional.email,`Appointment Created`,`Your appointment with <b>${user.name}</b> has been created`)
})
event.on("appointment:accepted",async(data)=>{
    const {user,professional} = data
    await sendMail(user.email,`Appointment Accepted`,`Your appointment with <b>${professional.name}</b> has been accepted`)
    await sendMail(professional.email,`Appointment Accepted`,`Your appointment with <b>${user.name}</b> has been accepted`)
})
event.on("appointment:rescheduled",async(data)=>{
    const {user,professional} = data
    await sendMail(user.email,`Appointment Rescheduled`,`Your appointment with <b>${professional.name}</b> has been rescheduled`)
    await sendMail(professional.email,`Appointment Rescheduled`,`Your appointment with <b>${user.name}</b> has been rescheduled`)
})
event.on("appointment:refunded",async(data)=>{
    const {user,professional} = data
    await sendMail(user.email,`Appointment Refunded`,`Your appointment with <b>${professional.name}</b> has been refunded`)
    await sendMail(professional.email,`Appointment Refunded`,`Your appointment with <b>${user.name}</b> has been refunded`)
})

module.exports = event

