'use server'

import { Twilio } from 'twilio'

export async function lookupPhone(apiKey: string, phoneNumber: string) {
  const [accountSid, authToken] = apiKey.split(':')
  const client = new Twilio(accountSid, authToken)

  try {
    const phoneInfo = await client.lookups.v2.phoneNumbers(phoneNumber).fetch({
      fields: 'carrier,caller_name',
    })

    return {
      phoneNumber: phoneInfo.phoneNumber,
      carrier: {
        name: phoneInfo.carrier?.name || 'Unknown',
        type: phoneInfo.carrier?.type || 'Unknown',
      },
      callerName: phoneInfo.callerName?.caller_name || 'Not available',
    }
  } catch (error) {
    console.error('Error looking up phone number:', error)
    throw new Error('Failed to lookup phone number')
  }
}

