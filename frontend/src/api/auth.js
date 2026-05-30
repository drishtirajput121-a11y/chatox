import api from './client'

export const sendOTP = (username, email, password, password2) =>
    api.post('/users/register/send-otp/', { username, email, password, password2 })

export const verifyOTP = (email, otp) =>
    api.post('/users/register/verify-otp/', { email, otp })                              