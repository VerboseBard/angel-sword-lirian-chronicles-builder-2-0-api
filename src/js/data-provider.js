import { loadApiDataProvider } from "./api-data-provider.js";
import { getStaticDataProviderStatus } from "./static-data-provider.js";

export async function initializeDataProvider() {
  const status = await loadApiDataProvider();
  const finalStatus = status?.provider === "api" ? status : {
    ...getStaticDataProviderStatus(),
    ...status
  };
  window.LYRIAN_DATA_PROVIDER_STATUS = finalStatus;
  return finalStatus;
}
