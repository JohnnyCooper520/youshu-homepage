export async function loadCloudReports(client, user) {
  if (!client || !user?.id) {
    return [];
  }

  const { data, error } = await client
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((row) => row.report_payload).filter(Boolean);
}

export async function saveCloudReport(client, user, report) {
  if (!client || !user?.id || !report) {
    return;
  }

  const { error } = await client.from("reports").insert([
    {
      user_id: user.id,
      report_type: report.type || "unknown",
      title: report.title || "",
      report_payload: report,
    },
  ]);

  if (error) {
    throw error;
  }
}
