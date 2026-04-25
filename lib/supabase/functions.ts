import { supabase } from './client'
import { getClientIP, getIPDetails } from '../../src/lib/ip.service'

// In src/lib/supabase/functions.ts
interface RegisterSupporterData {
  fullName: string
  email: string
  phone: string
  idNumber: string
  county: string
  constituency: string
  ward: string
  botScore: number
  isHuman: boolean
  mouseMovements: number
  clicks: number
  keyPresses: number
  timeSpent: number
  securityReport: any
  deviceFingerprint?: string  // ADD THIS
}

/**
 * Register a new supporter with full details including IP and user agent
 */
export async function registerSupporter(data: RegisterSupporterData) {
  console.log("🚀 Starting supporter registration process...")
  console.log("📝 Registration data received:", {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    constituency: data.constituency,
    ward: data.ward,
    botScore: data.botScore,
    isHuman: data.isHuman
  })

  try {
    // Get IP address using the IP service
    console.log("🌐 Fetching client IP address...")
    const ipAddress = await getClientIP()
    console.log("✅ Client IP address obtained:", ipAddress)

    // Get additional IP details (optional - for analytics)
    console.log("🌍 Fetching IP geolocation details...")
    const ipDetails = await getIPDetails()
    console.log("✅ IP details obtained:", {
      ip: ipDetails.ip,
      country: ipDetails.country,
      city: ipDetails.city,
      region: ipDetails.region
    })

    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'server'
    console.log("💻 User agent:", userAgent.substring(0, 100) + "...")

    const timestamp = new Date().toISOString()
    console.log("⏰ Registration timestamp:", timestamp)

    const requestBody = {
      ...data,
      ipAddress,
      ipDetails,
      userAgent,
      timestamp
    }

    console.log("📤 Sending request to Supabase edge function...")
    console.log("📦 Request payload size:", JSON.stringify(requestBody).length, "bytes")

    const { data: result, error } = await supabase.functions.invoke('register-supporter', {
      body: JSON.stringify(requestBody)
    })

    if (error) {
      console.error("❌ Supabase function invocation error:", {
        message: error.message,
        status: error.status,
        name: error.name
      })
      throw error
    }

    console.log("✅ Registration successful!")
    console.log("📨 Response from server:", {
      success: result.success,
      supporterId: result.data?.id,
      message: result.data?.message
    })

    return result
  } catch (error) {
    console.error("💥 Fatal error in registerSupporter:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats() {
  console.log("📊 Fetching campaign statistics...")

  try {
    const { data: result, error } = await supabase.functions.invoke('campaign-stats', {
      body: JSON.stringify({})
    })

    if (error) {
      console.error("❌ Error fetching campaign stats:", error)
      throw error
    }

    console.log("✅ Campaign stats retrieved:", result)
    return result
  } catch (error) {
    console.error("💥 Error in getCampaignStats:", error)
    throw error
  }
}

/**
 * Register for a campaign event
 */
export async function registerForEvent(eventId: string, data: {
  fullName: string
  email: string
  phone: string
  constituency: string
}) {
  console.log("🎟️ Registering for event:", eventId)
  console.log("📝 Event registration data:", {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    constituency: data.constituency
  })

  try {
    // Get IP address for event registration too
    console.log("🌐 Fetching client IP for event registration...")
    const ipAddress = await getClientIP()
    console.log("✅ Client IP obtained:", ipAddress)

    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'server'
    const registeredAt = new Date().toISOString()

    const { data: result, error } = await supabase.functions.invoke('register-event', {
      body: JSON.stringify({
        eventId,
        ...data,
        ipAddress,
        userAgent,
        registeredAt
      })
    })

    if (error) {
      console.error("❌ Error registering for event:", error)
      throw error
    }

    console.log("✅ Event registration successful:", result)
    return result
  } catch (error) {
    console.error("💥 Error in registerForEvent:", error)
    throw error
  }
}

/**
 * Submit volunteer application
 */
export async function submitVolunteer(data: {
  fullName: string
  email: string
  phone: string
  constituency: string
  ward: string
  skills: string
}) {
  console.log("🤝 Submitting volunteer application...")
  console.log("📝 Volunteer data:", {
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    constituency: data.constituency,
    ward: data.ward,
    skillsLength: data.skills?.length || 0
  })

  try {
    console.log("🌐 Fetching client IP for volunteer submission...")
    const ipAddress = await getClientIP()
    console.log("✅ Client IP obtained:", ipAddress)

    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'server'
    const submittedAt = new Date().toISOString()

    const { data: result, error } = await supabase.functions.invoke('submit-volunteer', {
      body: JSON.stringify({
        ...data,
        ipAddress,
        userAgent,
        submittedAt
      })
    })

    if (error) {
      console.error("❌ Error submitting volunteer application:", error)
      throw error
    }

    console.log("✅ Volunteer application submitted successfully:", result)
    return result
  } catch (error) {
    console.error("💥 Error in submitVolunteer:", error)
    throw error
  }
}

/**
 * Submit contact message
 */
export async function submitContact(data: {
  name: string
  email: string
  message: string
  supportType: string
}) {
  console.log("📧 Submitting contact message...")
  console.log("📝 Contact data:", {
    name: data.name,
    email: data.email,
    supportType: data.supportType,
    messageLength: data.message?.length || 0
  })

  try {
    console.log("🌐 Fetching client IP for contact submission...")
    const ipAddress = await getClientIP()
    console.log("✅ Client IP obtained:", ipAddress)

    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'server'
    const submittedAt = new Date().toISOString()

    const { data: result, error } = await supabase.functions.invoke('submit-contact', {
      body: JSON.stringify({
        ...data,
        ipAddress,
        userAgent,
        submittedAt
      })
    })

    if (error) {
      console.error("❌ Error submitting contact message:", error)
      throw error
    }

    console.log("✅ Contact message submitted successfully:", result)
    return result
  } catch (error) {
    console.error("💥 Error in submitContact:", error)
    throw error
  }
}

// Re-export IP service functions for direct use if needed
export { getClientIP, getIPDetails } from '../../src/lib/ip.service'
