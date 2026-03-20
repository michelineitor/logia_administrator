export async function sendTelegramNotification(message: string, chatId: string, botToken: string, file?: Buffer) {
  const baseUrl = `https://api.telegram.org/bot${botToken}`;

  try {
    if (file) {
      // Logic to send document (simplified for now)
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', message);
      const blob = new Blob([file], { type: 'application/pdf' });
      formData.append('document', blob, 'recibo.pdf');

      await fetch(`${baseUrl}/sendDocument`, {
        method: 'POST',
        body: formData,
      });
    } else {
      await fetch(`${baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Telegram Error:", error);
    return { success: false, error };
  }
}
