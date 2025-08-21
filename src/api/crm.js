import API from "./index";

const buildQuery = (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        if (Array.isArray(v)) v.forEach((x) => q.append(k, x));
        else q.append(k, v);
    });
    return q.toString() ? `?${q.toString()}` : "";
};

export async function listContacts(params = {}) {
    const qs = buildQuery(params);
    const res = await API.get(`/api/crm/contacts${qs}`);
    return res.data; // { data, total }
}

export async function getContact(id) {
    const res = await API.get(`/api/crm/contacts/${id}`);
    return res.data; // contact
}

export async function createContact(payload) {
    const res = await API.post(`/api/crm/contacts`, payload);
    return res.data; // created
}

export async function updateContact(id, payload) {
    const res = await API.patch(`/api/crm/contacts/${id}`, payload);
    return res.data; // updated
}

export async function deleteContact(id) {
    const res = await API.delete(`/api/crm/contacts/${id}`);
    return res.data; // { ok: true }
}

export async function importContacts(file) {
    const form = new FormData();
    form.append("file", file);
    const res = await API.post(`/api/crm/contacts/import`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // { inserted, updated, errors }
}

export async function exportContacts(params = {}) {
    const qs = buildQuery(params);
    const res = await API.get(`/api/crm/contacts/export${qs}`, { responseType: "blob" });
    const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = "contacts.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(blobUrl);
}

