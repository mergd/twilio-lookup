import { NextResponse } from "next/server";
import twilio from "twilio";

if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("Missing Twilio credentials in environment variables");
}

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    const formattedNumber = cleanedNumber.startsWith("1")
      ? `+${cleanedNumber}`
      : `+1${cleanedNumber}`;
    const callerLookup = await client.lookups.v2
      .phoneNumbers(formattedNumber)
      .fetch({ fields: "caller_name" });

    const carrierLookup = await client.lookups.v1
      .phoneNumbers(formattedNumber)
      .fetch({ type: ["carrier"] });

    return NextResponse.json({
      phoneNumber: callerLookup.phoneNumber,
      callerName: callerLookup.callerName?.caller_name || null,
      carrier: {
        name: carrierLookup.carrier.name,
        type: carrierLookup.carrier.type,
        mobileCountryCode: carrierLookup.carrier.mobile_country_code,
        mobileNetworkCode: carrierLookup.carrier.mobile_network_code,
      },
    });
  } catch (error) {
    console.error("Twilio lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup phone number" },
      { status: 500 }
    );
  }
}
