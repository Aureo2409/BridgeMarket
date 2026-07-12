import { Component } from "react";

// ════════════════════════════════════════════════════════════════════════════
// ERROR BOUNDARY — evita que a aplicação inteira fique com um ecrã em branco
// sempre que qualquer componente lança um erro durante a renderização.
//
// Sem isto, o React desmonta silenciosamente toda a árvore de componentes
// assim que qualquer erro não apanhado acontece durante um render — e como
// esta aplicação não tinha nenhum Error Boundary, isso resultava exactamente
// no sintoma "página completamente em branco, sem nenhuma mensagem" sempre
// que qualquer bug de renderização ocorria, em qualquer parte da app.
//
// Com este componente, o erro é apanhado, mostrado de forma legível ao
// utilizador (com opção de recarregar a página), e — igualmente importante —
// registado na consola do browser para conseguirmos diagnosticar a causa
// exacta da próxima vez que isto acontecer, em vez de adivinhar às cegas.
// ════════════════════════════════════════════════════════════════════════════
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Erro capturado na renderização:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo?.componentStack);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: 24,
          background: "#fbf8f3", fontFamily: "system-ui, sans-serif", textAlign: "center"
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 18,
            background: "rgba(239,68,68,0.1)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 26
          }}>
            ⚠️
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1c1814", marginBottom: 8 }}>
            Algo correu mal
          </div>
          <div style={{ fontSize: 13.5, color: "#5a5147", marginBottom: 22, maxWidth: 380, lineHeight: 1.6 }}>
            A plataforma encontrou um erro inesperado. A tua conta e os teus dados estão seguros —
            tenta recarregar a página. Se o problema persistir, contacta o suporte.
          </div>
          <button
            onClick={this.handleReload}
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
              border: "none", borderRadius: 12, padding: "12px 28px",
              fontSize: 14, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 8px 20px rgba(99,102,241,.35)"
            }}
          >
            Recarregar a Página
          </button>

          {/* Detalhe técnico do erro — visível para facilitar o diagnóstico
              enquanto a plataforma está em fase de testes internos. */}
          <details style={{ marginTop: 28, maxWidth: 520, textAlign: "left" }}>
            <summary style={{ fontSize: 11, color: "#9ca3af", cursor: "pointer", fontWeight: 700 }}>
              Detalhes técnicos (para o suporte)
            </summary>
            <pre style={{
              fontSize: 10, color: "#dc2626", background: "#fef2f2",
              padding: 12, borderRadius: 8, marginTop: 8, overflow: "auto",
              maxHeight: 200, whiteSpace: "pre-wrap", wordBreak: "break-word"
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
