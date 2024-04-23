import nodemailer from 'nodemailer'
import { configVar } from '../config/config.js'
const transport=nodemailer.createTransport(
    {
        service:'gmail',
        port: 587,
        auth:{
            user:configVar.USEREMAIL,
            pass:configVar.PASSEMAIL
        }
    }
)

export const submitEmail=(to, subject, message)=>{
    return transport.sendMail(
        {
            to, subject,
            html:message
        }
    )
}