import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AlertsAPI } from '../../api/alerts.api';

export const fetchAlerts = createAsyncThunk('alerts/fetch', AlertsAPI.list);
export const createAlert = createAsyncThunk('alerts/create', AlertsAPI.create);
export const updateAlert = createAsyncThunk('alerts/update', async ({ id, data }) => { await AlertsAPI.update(id, data); return { id, data }; });
export const deleteAlert = createAsyncThunk('alerts/delete', async (id) => { await AlertsAPI.remove(id); return id; });
export const fetchAlertEvents = createAsyncThunk('alerts/events', ({ page = 1, pageSize = 20 } = {}) => AlertsAPI.events(page, pageSize));

const slice = createSlice({
    name: 'alerts',
    initialState: { items: [], events: [], loading: false, eventsLoading: false },
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchAlerts.pending, s => { s.loading = true; })
            .addCase(fetchAlerts.fulfilled, (s, a) => { s.loading = false; s.items = a.payload; })
            .addCase(createAlert.fulfilled, (s, a) => { s.items.unshift({ _id: a.payload.id, ...a.meta.arg }); })
            .addCase(updateAlert.fulfilled, (s, a) => { s.items = s.items.map(it => it._id === a.payload.id ? { ...it, ...a.payload.data } : it); })
            .addCase(deleteAlert.fulfilled, (s, a) => { s.items = s.items.filter(it => it._id !== a.payload); })
            .addCase(fetchAlertEvents.pending, s => { s.eventsLoading = true; })
            .addCase(fetchAlertEvents.fulfilled, (s, a) => { s.eventsLoading = false; s.events = a.payload; });
    }
});
export default slice.reducer;
