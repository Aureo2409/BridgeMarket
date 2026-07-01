import { useState, useEffect } from "react";
import { Icon } from "./UI.jsx";

// Banner discreto que convida o utilizador a instalar a Bridge no ecrã
// principal do telemóvel — sem custo de loja, funciona como app nativa.
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Não mostrar se o utilizador já dispensou nesta sessão, ou se já está
    // a correr em modo standalone (já instalada)
    const alreadyDismissed = sessionStorage.getItem("bridge_install_dismissed");
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;

    if (alreadyDismissed || isStandalone) return;

    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    setIsIOS(iOS);

    if (iOS) {
      // No iOS não existe evento beforeinstallprompt — mostramos instruções manuais
      const t = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(t);
    }

    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  }

  function handleDismiss() {
    sessionStorage.setItem("bridge_install_dismissed", "1");
    setShowBanner(false);
    setDismissed(true);
  }

  if (!showBanner || dismissed) return null;

  return (
    <div style={{
      position: "fixed", bottom: 14, left: 14, right: 14, zIndex: 9999,
      maxWidth: 420, margin: "0 auto",
      background: "#ffffff", borderRadius: 16,
      boxShadow: "0 10px 40px -10px rgba(74,50,150,0.35)",
      border: "1px solid #e8e0d4",
      padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 12,
      animation: "slideUp 0.3s ease-out"
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: "linear-gradient(135deg,#4a3296,#8a6ce8)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Icon name="bank" size={20} color="#fff" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#1c1814", marginBottom: 2 }}>
          Instala a Bridge
        </div>
        <div style={{ fontSize: 11.5, color: "#5a5147", lineHeight: 1.4 }}>
          {isIOS
            ? <>Toca em <strong>Partilhar</strong> e depois em <strong>Adicionar ao ecrã principal</strong>.</>
            : "Acesso mais rápido, direto do teu ecrã principal."}
        </div>
      </div>

      {!isIOS && (
        <button
          onClick={handleInstallClick}
          style={{
            background: "linear-gradient(135deg,#4a3296,#6c4fd6)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "8px 14px", fontSize: 12, fontWeight: 800,
            cursor: "pointer", flexShrink: 0
          }}
        >
          Instalar
        </button>
      )}

      <button
        onClick={handleDismiss}
        aria-label="Fechar"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9a9488", padding: 4, flexShrink: 0
        }}
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}
