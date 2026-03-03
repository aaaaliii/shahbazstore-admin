import SettingsClient from "./SettingsClient";
import { serverApi } from "../../../lib/api/server.api";

export default async function SettingsPage() {
  try {
    const settings = await serverApi.settings.get();
    
    return (
      <SettingsClient
        initialSettings={settings || null}
      />
    );
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    // Fallback to null on error
    return (
      <SettingsClient
        initialSettings={null}
      />
    );
  }
}
