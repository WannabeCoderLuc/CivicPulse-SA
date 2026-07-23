const BASE_URL = "/api";

async function handleResponse(res, errorCode) {
  console.log(`API_RESPONSE: status=${res.status} url=${res.url}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const details = body.errors ? JSON.stringify(body.errors) : "";
    const message = body.message || details || `HTTP ${res.status}`;
    console.error(`${errorCode}: ${message}`);
    throw new Error(`${errorCode}: ${message}`);
  }
  return res.json();
}

export async function fetchReports(filters = {}) {
  console.log("ENTER: fetchReports", filters);
  try {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.status) params.set("status", filters.status);
    if (filters.ward) params.set("ward", filters.ward);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${BASE_URL}/reports${query}`);
    const data = await handleResponse(res, "ERR-API-001");
    console.log(`SUCCESS: fetchReports returned ${data.length} records`);
    return data;
  } catch (err) {
    console.error(`ERR-API-001: fetchReports failed. ${err.message}`);
    throw err;
  }
}

export async function fetchReportById(id) {
  console.log(`ENTER: fetchReportById id=${id}`);
  try {
    const res = await fetch(`${BASE_URL}/reports/${id}`);
    const data = await handleResponse(res, "ERR-API-002");
    console.log(`SUCCESS: fetchReportById id=${id}`);
    return data;
  } catch (err) {
    console.error(`ERR-API-002: fetchReportById failed. ${err.message}`);
    throw err;
  }
}

export async function submitReport(payload) {
  console.log("ENTER: submitReport", payload);
  try {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(res, "ERR-API-003");
    console.log(`SUCCESS: submitReport new report id=${data.id}`);
    return data;
  } catch (err) {
    console.error(`ERR-API-003: submitReport failed. ${err.message}`);
    throw err;
  }
}

export async function updateReportStatus(id, status) {
  console.log(`ENTER: updateReportStatus id=${id} status=${status}`);
  try {
    const res = await fetch(`${BASE_URL}/reports/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await handleResponse(res, "ERR-API-004");
    console.log(`SUCCESS: updateReportStatus id=${id} updated to ${status}`);
    return data;
  } catch (err) {
    console.error(`ERR-API-004: updateReportStatus failed. ${err.message}`);
    throw err;
  }
}

export async function deleteReport(id) {
  console.log(`ENTER: deleteReport id=${id}`);
  try {
    const res = await fetch(`${BASE_URL}/reports/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `HTTP ${res.status}`);
    }
    console.log(`SUCCESS: deleteReport id=${id}`);
    return true;
  } catch (err) {
    console.error(`ERR-API-005: deleteReport failed. ${err.message}`);
    throw err;
  }
}

export async function fetchTimeline(reportId) {
  console.log(`ENTER: fetchTimeline reportId=${reportId}`);
  try {
    const res = await fetch(`${BASE_URL}/reports/${reportId}/timeline`);
    const data = await handleResponse(res, "ERR-API-006");
    console.log(`SUCCESS: fetchTimeline returned ${data.length} events for report ${reportId}`);
    return data;
  } catch (err) {
    console.error(`ERR-API-006: fetchTimeline failed. ${err.message}`);
    throw err;
  }
}

export async function fetchKpi() {
  console.log("ENTER: fetchKpi");
  try {
    const res = await fetch(`${BASE_URL}/dashboard/kpi`);
    const data = await handleResponse(res, "ERR-API-007");
    console.log("SUCCESS: fetchKpi", data);
    return data;
  } catch (err) {
    console.error(`ERR-API-007: fetchKpi failed. ${err.message}`);
    throw err;
  }
}

export async function fetchByCategory() {
  console.log("ENTER: fetchByCategory");
  try {
    const res = await fetch(`${BASE_URL}/dashboard/analytics/by-category`);
    const data = await handleResponse(res, "ERR-API-008");
    console.log("SUCCESS: fetchByCategory", data);
    return data;
  } catch (err) {
    console.error(`ERR-API-008: fetchByCategory failed. ${err.message}`);
    throw err;
  }
}

export async function fetchWardPerformance() {
  console.log("ENTER: fetchWardPerformance");
  try {
    const res = await fetch(`${BASE_URL}/dashboard/analytics/ward-performance`);
    const data = await handleResponse(res, "ERR-API-009");
    console.log("SUCCESS: fetchWardPerformance", data);
    return data;
  } catch (err) {
    console.error(`ERR-API-009: fetchWardPerformance failed. ${err.message}`);
    throw err;
  }
}