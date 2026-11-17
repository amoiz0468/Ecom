import { createAdminClient } from "@/lib/supabase/admin";

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address?: string;
  created_at: string;
}

/**
 * Best-effort audit trail. Never throws, so a logging failure can never break
 * a customer order or an admin action. Always `await` it: serverless runtimes
 * may freeze the process as soon as the response is sent.
 */
export async function appendAuditLog(entry: {
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address?: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      actor: entry.actor,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details,
      ip_address: entry.ip_address ?? null,
    });
  } catch {
    // Non-blocking audit log
  }
}

