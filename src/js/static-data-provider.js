export function getStaticDataProviderStatus() {
  return {
    ok: true,
    provider: "static",
    mode: "static",
    version: window.LYRIAN_DATA?.version || "",
    message: `Using bundled Lyrian data v${window.LYRIAN_DATA?.version || "unknown"}.`
  };
}
