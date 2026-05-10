const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID ?? "";

export async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log("WhatsApp not configured. Would send:", { to, text });
    return;
  }

  await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

export async function sendDailyLesson(phoneNumber: string): Promise<void> {
  const messages = [
    "🌅 *Good morning! Your English word of the day:*\n\n*Persevere* = להתמיד\n_\"She persevered through all the difficulties.\"_\n\nSend *quiz* for a quick exercise!",
    "🌅 *Daily Grammar Reminder:*\n\nPresent Perfect → have/has + past participle\n✅ I *have lived* here for 5 years.\n✅ She *has just arrived*.\n\nSend *tip* for more grammar tips!",
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  await sendWhatsAppMessage(phoneNumber, msg);
}
