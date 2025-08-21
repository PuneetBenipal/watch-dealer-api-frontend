import API from "./index";

export async function fetchDocs(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await API.get(`/api/support/docs${qs ? `?${qs}` : ""}`);
    return res.data;
}

export async function fetchDoc(slug) {
    const res = await API.get(`/api/support/docs/${slug}`);
    return res.data;
}

export async function createDoc(payload) {
    const res = await API.post(`/api/support/docs`, payload);
    return res.data;
}

export async function updateDoc(slug, payload) {
    const res = await API.put(`/api/support/docs/${slug}`, payload);
    return res.data;
}

export async function deleteDoc(slug) {
    const res = await API.delete(`/api/support/docs/${slug}`);
    return res.data;
}

export async function listTickets(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await API.get(`/api/support/tickets${qs ? `?${qs}` : ""}`);
    return res.data;
}

export async function createTicket(payload) {
    const res = await API.post(`/api/support/tickets`, payload);
    return res.data;
}

export async function replyTicket(id, payload) {
    const res = await API.post(`/api/support/tickets/${id}/reply`, payload);
    return res.data;
}

export async function closeTicket(id) {
    const res = await API.post(`/api/support/tickets/${id}/close`);
    return res.data;
}