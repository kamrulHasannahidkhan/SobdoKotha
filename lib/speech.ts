export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string, lang = "en-US") {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
