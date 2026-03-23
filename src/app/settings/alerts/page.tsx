import { getAlertRules } from "@/lib/services/alertRuleService";
import AlertsClient from "./AlertsClient";

export const dynamic = 'force-dynamic';

export default async function AlertsSettingsPage() {
  const rules = await getAlertRules();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <AlertsClient initialRules={rules} />
    </div>
  );
}
