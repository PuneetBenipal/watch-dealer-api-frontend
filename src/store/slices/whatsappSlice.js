// import API from "../../api";
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const api = {
//     sessionInit: "/api/whatsapp/session",
//     sessionStatus: (sessionId) => `/api/whatsapp/session?sessionId=${encodeURIComponent(sessionId)}`,
//     settingsGet: '/api/whatsapp/settings',
//     settingsSave: '/api/whatsapp/settings',
//     grouposList: '/api/whatsapp/groups',
//     groupCreate: '/api/whatsapp/groups',
//     groupDelete: '/api/whatsapp/groups',
//     helthGet: '/api/whatsapp/helth',
//     runNow: '/api/whatsapp/run',
//     testParse: '/api/whatsapp/test'
// }

// export const fetchSettings = createAsyncThunk('whatsapp/fetchSettings', async (payload) => {
//     return await API.get(api.settingsGet, payload)
// });
// export const saveSettings = createAsyncThunk('whatsapp/saveSettings', async (payload) => {
//     return await API.post(api.settingsSave, payload);
// });

// export const listGroups = createAsyncThunk('whatsapp/listGroups', async () => {
//     return await API.get(api.groupsList);
// });
// export const addGroup = createAsyncThunk('whatsapp/addGroup', async (link) => {
//     return await API.post(api.groupCreate, { link });
// });
// export const removeGroup = createAsyncThunk('whatsapp/removeGroup', async (id) => {
//     await API.delete(api.groupDelete(id));
//     return id;
// });

// export const getHealth = createAsyncThunk('whatsapp/getHealth', async () => {
//     return await API.get(api.healthGet);
// });
// export const runParser = createAsyncThunk('whatsapp/runParser', async () => {
//     return await API.post(api.runNow);
// });
// export const testParser = createAsyncThunk('whatsapp/testParser', async () => {
//     return await API.post(api.testParse);
// });

// export const initSession = createAsyncThunk('whatsapp/initSession', async () => {
//     return await API.post(api.sessionInit);
// });
// export const pollSession = createAsyncThunk('whatsapp/pollSession', async (sessionId) => {
//     return await API.get(api.sessionStatus(sessionId));
// });

// const initialState = {
//     // Connection
//     sessionId: null,
//     connectionStatus: 'idle', // idle | waiting | connected | error
//     qrImageDataUrl: null,
//     qrVisible: false,

//     // Settings
//     settings: {
//         throttle: 30, // msgs/min
//         schedule: 'daily-08:00',
//         mediaDownload: true,
//         dedup: true,
//         countryRules: ['UK', 'UAE', 'HK', 'USA']
//     },
//     settingsLoading: false,

//     // Groups
//     groups: [],
//     groupsLoading: false,

//     // Health
//     health: { lastSyncAt: null, parsedToday: 0, duplicatesRemovedToday: 0, recentErrors: [] },
//     healthLoading: false,

//     // Actions
//     running: false,
//     testing: false,

//     error: null
// };

// const whatsappSlice = createSlice({
//     name: 'whatsapp',
//     initialState,
//     reducers: {
//         hideQr(state) { state.qrVisible = false; },
//         resetError(state) { state.error = null; }
//     },
//     extraReducers: (builder) => {
//         builder.addCase(fetchSettings.pending, (s) => { s.settingsLoading = true; });
//         builder.addCase(fetchSettings.fulfilled, (s, a) => { s.settingsLoading = false; s.settings = a.payload });
//         builder.addCase(fetchSettings.rejected, (s, a) => { s.settingsLoading = false; s.error = a.error.message });

//         builder.addCase(saveSettings.pending, (s) => { s.settingsLoading = true; });
//         builder.addCase(saveSettings.fulfilled, (s, a) => { s.settingsLoading = false; s.settings = a.payload; });
//         builder.addCase(saveSettings.rejected, (s, a) => { s.settingsLoading = false; s.error = a.error.message; });


//         // Groups
//         builder.addCase(listGroups.pending, (s) => { s.groupsLoading = true; });
//         builder.addCase(listGroups.fulfilled, (s, a) => { s.groupsLoading = false; s.groups = a.payload.groups || []; });
//         builder.addCase(listGroups.rejected, (s, a) => { s.groupsLoading = false; s.error = a.error.message; });


//         builder.addCase(addGroup.fulfilled, (s, a) => { s.groups.push(a.payload); });
//         builder.addCase(addGroup.rejected, (s, a) => { s.error = a.error.message; });


//         builder.addCase(removeGroup.fulfilled, (s, a) => { s.groups = s.groups.filter(g => g.id !== a.payload); });
//         builder.addCase(removeGroup.rejected, (s, a) => { s.error = a.error.message; });


//         // Health
//         builder.addCase(getHealth.pending, (s) => { s.healthLoading = true; });
//         builder.addCase(getHealth.fulfilled, (s, a) => { s.healthLoading = false; s.health = a.payload; });
//         builder.addCase(getHealth.rejected, (s, a) => { s.healthLoading = false; s.error = a.error.message; });


//         // Run/Test
//         builder.addCase(runParser.pending, (s) => { s.running = true; });
//         builder.addCase(runParser.fulfilled, (s) => { s.running = false; });
//         builder.addCase(runParser.rejected, (s, a) => { s.running = false; s.error = a.error.message; });


//         builder.addCase(testParser.pending, (s) => { s.testing = true; });
//         builder.addCase(testParser.fulfilled, (s) => { s.testing = false; });
//         builder.addCase(testParser.rejected, (s, a) => { s.testing = false; s.error = a.error.message; });


//         // Session
//         builder.addCase(initSession.fulfilled, (s, a) => {
//             s.sessionId = a.payload.sessionId;
//             s.qrImageDataUrl = a.payload.qrImageDataUrl;
//             s.connectionStatus = 'waiting';
//             s.qrVisible = true;
//         });
//         builder.addCase(initSession.rejected, (s, a) => { s.error = a.error.message; });


//         builder.addCase(pollSession.fulfilled, (s, a) => {
//             const { status } = a.payload;
//             s.connectionStatus = status;
//             if (status === 'connected') s.qrVisible = false;
//         });
//         builder.addCase(pollSession.rejected, (s, a) => { s.error = a.error.message; });
//     }
// })

// export const { hideQr, resetError } = whatsappSlice.actions;
// export default whatsappSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = (path, opts = {}) => fetch(`/api/whatsapp${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'x-company-id': 'demo-company' },
    ...opts
}).then(r => r.json());

export const fetchStatus = createAsyncThunk('wa/status', async () => API('/status'));
export const startLink = createAsyncThunk('wa/start', async () => API('/start', { method: 'POST' }));
export const fetchGroups = createAsyncThunk('wa/groups', async () => API('/groups'));
export const saveGroups = createAsyncThunk('wa/save', async (selections) =>
    API('/groups/select', { method: 'POST', body: JSON.stringify({ selections }) })
);
export const logoutWA = createAsyncThunk('wa/logout', async () => API('/logout', { method: 'POST' }));

const slice = createSlice({
    name: 'wa',
    initialState: {
        status: 'disconnected',
        qr: null,
        meWid: null,
        pushName: null,
        deviceName: null,
        groups: [],
        loading: false,
        sseActive: false
    },
    reducers: {
        sseMessage(state, action) {
            const { type, payload } = action.payload;
            if (type === 'qr') state.qr = payload;
            if (type === 'status') {
                state.status = payload.status;
                state.qr = payload.lastQR || state.qr;
                state.meWid = payload.meWid;
                state.pushName = payload.pushName;
                state.deviceName = payload.deviceName;
            }
        },
        setSseActive(state, action) { state.sseActive = action.payload; }
    },
    extraReducers: (b) => {
        b.addCase(fetchStatus.fulfilled, (s, a) => {
            const p = a.payload;
            s.status = p.status; s.qr = p.lastQR; s.meWid = p.meWid; s.pushName = p.pushName; s.deviceName = p.deviceName;
        });
        b.addCase(fetchGroups.pending, (s) => { s.loading = true; });
        b.addCase(fetchGroups.fulfilled, (s, a) => { s.loading = false; s.groups = a.payload || []; });
        b.addCase(saveGroups.fulfilled, (s) => { });
        b.addCase(logoutWA.fulfilled, (s) => {
            s.status = 'disconnected'; s.qr = null; s.meWid = null; s.pushName = null; s.deviceName = null; s.groups = [];
        });
    }
});

export const { sseMessage, setSseActive } = slice.actions;
export default slice.reducer;

// Helper to open SSE stream (call once after startLink)
export const openSSE = () => (dispatch, getState) => {
    if (getState().wa.sseActive) return;
    const es = new EventSource('/api/whatsapp/qr/stream');
    dispatch(setSseActive(true));
    es.onmessage = (evt) => dispatch(sseMessage(JSON.parse(evt.data)));
    es.onerror = () => { es.close(); dispatch(setSseActive(false)); };
};
