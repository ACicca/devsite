const form = document.getElementById("contact-form");
const note = document.getElementById("form-note");
const year = document.getElementById("year");
const sendButton = document.getElementById("send-button");
const EMAIL_ENDPOINT = form.getAttribute("action") || "";
const IS_ITALIAN = (document.documentElement.lang || "").toLowerCase().startsWith("it");

const TEXT = IS_ITALIAN
  ? {
      sending: "Invio...",
      sent: "Messaggio inviato con successo.",
      send: "Invia Messaggio",
      errorPrefix: "Messaggio non inviato:",
      genericError: "Messaggio non inviato. Verifica token endpoint e attivazione FormSubmit."
    }
  : {
      sending: "Sending...",
      sent: "Message sent successfully.",
      send: "Send Message",
      errorPrefix: "Message not sent:",
      genericError: "Message not sent. Verify your FormSubmit endpoint token and activation."
    };

year.textContent = new Date().getFullYear();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const name = (formData.get("name") || "").toString().trim();
  const email = (formData.get("email") || "").toString().trim();
  const projectType = (formData.get("projectType") || "").toString().trim();
  const message = (formData.get("message") || "").toString().trim();

  note.classList.remove("error");
  note.textContent = "";
  sendButton.disabled = true;
  sendButton.textContent = TEXT.sending;

  const payload = {
    name,
    email,
    projectType,
    message,
    _subject: `New project inquiry from ${name}`,
    _captcha: "false",
    _template: "table"
  };

  try {
    const response = await fetch(EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    const isSuccess = result.success === true || result.success === "true";

    if (!response.ok || !isSuccess) {
      const serviceMessage = (result.message || result.error || "").toString().trim();
      throw new Error(serviceMessage || "Email service rejected request");
    }

    note.textContent = TEXT.sent;
    form.reset();
  } catch (error) {
    note.classList.add("error");
    const details = error instanceof Error ? error.message : "";
    note.textContent = details
      ? `${TEXT.errorPrefix} ${details}`
      : TEXT.genericError;
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = TEXT.send;
  }
});
