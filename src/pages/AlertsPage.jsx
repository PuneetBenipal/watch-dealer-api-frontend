import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { createAlert, deleteAlert, fetchAlertEvents, fetchAlerts, updateAlert } from '../store/slices/alertsSlice';

const FIELDS = [
    { value: 'brand', label: 'Brand' },
    { value: 'model', label: 'Model' },
    { value: 'ref', label: 'Reference' },
    { value: 'price', label: 'Price (USD normalized)' },
    { value: 'country', label: 'Country' },
    { value: 'condition', label: 'Condition' },
    { value: 'sellerId', label: 'Seller' },
    { value: 'currency', label: 'Currency' }
];
const OPS = [
    { value: 'eq', label: '=' }, { value: 'neq', label: '≠' },
    { value: 'contains', label: 'contains' }, { value: 'lte', label: '≤' },
    { value: 'gte', label: '≥' }, { value: 'in', label: 'in list' },
    { value: 'not_in', label: 'not in' }, { value: 'regex', label: 'regex' }
];

function RuleRow({ value = {}, onChange, onRemove }) {
    const [field, setField] = useState(value.field || 'brand');
    const [operator, setOperator] = useState(value.operator || 'eq');
    const [val, setVal] = useState(value.value ?? '');

    useEffect(() => onChange?.({ field, operator, value: val }), [field, operator, val]); // eslint-disable-line

    return (
        <Space wrap>
            <Select style={{ width: 160 }} value={field} onChange={setField} options={FIELDS} />
            <Select style={{ width: 140 }} value={operator} onChange={setOperator} options={OPS} />
            {field === 'price'
                ? <InputNumber style={{ width: 180 }} value={Number(val) || undefined} onChange={setVal} min={0} placeholder="USD value" />
                : <Input style={{ width: 280 }} value={val} onChange={e => setVal(e.target.value)} placeholder="Value (comma-separated for IN)" />
            }
            <Button danger onClick={onRemove}>Remove</Button>
        </Space>
    );
}

function AlertModal({ open, initialValues, onOk, onCancel }) {
    const [form] = Form.useForm();
    const [rules, setRules] = useState(initialValues?.rules || [{ field: 'brand', operator: 'eq', value: 'Rolex' }]);
    useEffect(() => { form.setFieldsValue(initialValues); setRules(initialValues?.rules || rules); }, [initialValues]); // eslint-disable-line

    const addRule = () => setRules(prev => [...prev, { field: 'brand', operator: 'eq', value: '' }]);
    const updateRule = (idx, next) => setRules(prev => prev.map((r, i) => i === idx ? next : r));
    const removeRule = (idx) => setRules(prev => prev.filter((_, i) => i !== idx));

    const submit = async () => {
        const base = await form.validateFields();
        const normalized = rules.map(r => ({
            ...r,
            value: ['in', 'not_in'].includes(r.operator)
                ? String(r.value).split(',').map(s => s.trim()).filter(Boolean)
                : r.value
        }));
        onOk({ ...base, rules: normalized });
    };

    return (
        <Modal title={initialValues ? 'Edit Alert' : 'New Alert'} open={open} onOk={submit} onCancel={onCancel} width={820}>
            <Form form={form} layout="vertical" initialValues={{
                name: 'My Alert', isEnabled: true, notify: { inApp: true, email: false, whatsapp: false }, throttlePerDay: 50, ...initialValues
            }}>
                <Form.Item name="name" label="Alert Name" rules={[{ required: true }]}>
                    <Input placeholder="e.g., Rolex Sub under $9k in UAE" />
                </Form.Item>
                <Space align="center" size="large" style={{ marginBottom: 12 }}>
                    <Form.Item name={['isEnabled']} valuePropName="checked" label="Enabled"><Switch /></Form.Item>
                    <Form.Item name={['notify', 'inApp']} valuePropName="checked" label="In-App"><Switch /></Form.Item>
                    <Form.Item name={['notify', 'email']} valuePropName="checked" label="Email"><Switch /></Form.Item>
                    <Form.Item name={['notify', 'whatsapp']} valuePropName="checked" label="WhatsApp"><Switch /></Form.Item>
                    <Form.Item name="throttlePerDay" label="Max alerts/day"><InputNumber min={1} max={500} /></Form.Item>
                </Space>

                <div style={{ border: '1px dashed #d9d9d9', padding: 12, borderRadius: 8 }}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {rules.map((r, idx) => (
                            <RuleRow key={idx} value={r} onChange={nr => updateRule(idx, nr)} onRemove={() => removeRule(idx)} />
                        ))}
                        <Button icon={<PlusOutlined />} onClick={addRule}>Add Rule</Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
}

export default function AlertsPage() {
    const dispatch = useDispatch();
    const { items, events, loading, eventsLoading } = useSelector(s => s.alerts);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    useEffect(() => { dispatch(fetchAlerts()); dispatch(fetchAlertEvents({})); }, [dispatch]);

    const columns = useMemo(() => [
        { title: 'Name', dataIndex: 'name' },
        { title: 'Enabled', dataIndex: 'isEnabled', render: v => v ? <Tag color="green">ON</Tag> : <Tag>OFF</Tag> },
        {
            title: 'Notify', render: (_, r) => (
                <Space>
                    {r?.notify?.inApp && <Tag>In-App</Tag>}
                    {r?.notify?.email && <Tag color="blue">Email</Tag>}
                    {r?.notify?.whatsapp && <Tag color="green">WhatsApp</Tag>}
                </Space>
            )
        },
        { title: 'Throttle/day', dataIndex: 'throttlePerDay' },
        {
            title: 'Actions', render: (_, r) => (
                <Space>
                    <Button onClick={() => { setEditing(r); setModalOpen(true); }}>Edit</Button>
                    <Button danger onClick={() => dispatch(deleteAlert(r._id))}>Delete</Button>
                </Space>
            )
        }
    ], [dispatch]);

    const eventCols = [
        { title: 'Time', dataIndex: 'firedAt' },
        { title: 'Alert', dataIndex: 'alert_name' },
        { title: 'Listing ID', dataIndex: 'listingId' },
        { title: 'Reason', dataIndex: 'reason' }
    ];

    const onCreate = (payload) => dispatch(createAlert(payload)).then(() => setModalOpen(false));
    const onUpdate = (payload) => dispatch(updateAlert({ id: editing._id, data: payload })).then(() => { setEditing(null); setModalOpen(false); });

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Card title="Alerts">
                <Space style={{ marginBottom: 12 }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); setModalOpen(true); }}>New Alert</Button>
                    <Button onClick={() => dispatch(fetchAlerts())} loading={loading}>Refresh</Button>
                </Space>
                <Table rowKey="_id" columns={columns} dataSource={items} loading={loading} pagination={{ pageSize: 10 }} />
            </Card>

            <Card title="Recent Alerts Fired">
                <Button onClick={() => dispatch(fetchAlertEvents({}))} loading={eventsLoading} style={{ marginBottom: 12 }}>Refresh</Button>
                <Table rowKey="_id" columns={eventCols} dataSource={events} loading={eventsLoading} pagination={{ pageSize: 10 }} />
            </Card>

            <AlertModal
                open={modalOpen}
                initialValues={editing || null}
                onOk={editing ? onUpdate : onCreate}
                onCancel={() => { setModalOpen(false); setEditing(null); }}
            />
        </Space>
    );
}
