import type { BuyLeadInput, SellLeadInput, TrackRequestInput } from "@snh/types";

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export function submitBuyLead(input: BuyLeadInput) {
  return request<{ request_id: string }>("/api/leads/buy", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function submitSellLead(input: SellLeadInput) {
  return request<{ request_id: string }>("/api/leads/sell", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function trackRequest(input: TrackRequestInput) {
  return request<{ request_id: string; status: string; name: string; type: string }>("/api/track", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
