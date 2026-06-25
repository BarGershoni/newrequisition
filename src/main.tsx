import { createRoot } from "react-dom/client";
import RequisitionApp from "./requisition-flow/RequisitionApp.tsx";
import "./styles/index.css";

// #region agent log
const __debugLog = (message: string, data: Record<string, unknown>, hypothesisId: string) => {
  fetch("http://127.0.0.1:7275/ingest/5612f9b3-d950-4c2f-9d85-146188a811a7", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1e85c0" },
    body: JSON.stringify({ sessionId: "1e85c0", location: "main.tsx", message, data, hypothesisId, timestamp: Date.now(), runId: "initial" }),
  }).catch(() => {});
};
// #endregion

const rootEl = document.getElementById("root");

// #region agent log
__debugLog("main.tsx entry", { hasRootEl: Boolean(rootEl), href: window.location.href, protocol: window.location.protocol }, "H1");
// #endregion

if (!rootEl) {
  // #region agent log
  __debugLog("root element missing — render aborted", {}, "H2");
  // #endregion
  throw new Error("Root element #root not found");
}

window.addEventListener("error", (event) => {
  // #region agent log
  __debugLog("window error", { message: event.message, filename: event.filename, lineno: event.lineno }, "H3");
  // #endregion
});

window.addEventListener("unhandledrejection", (event) => {
  // #region agent log
  __debugLog("unhandled rejection", { reason: String(event.reason) }, "H3");
  // #endregion
});

try {
  createRoot(rootEl).render(<RequisitionApp />);
  // #region agent log
  requestAnimationFrame(() => {
    __debugLog("render complete", { rootChildCount: rootEl.childElementCount, rootTextLength: rootEl.innerText?.length ?? 0 }, "H4");
  });
  // #endregion
} catch (error) {
  // #region agent log
  __debugLog("createRoot/render threw", { error: String(error) }, "H3");
  // #endregion
  throw error;
}
