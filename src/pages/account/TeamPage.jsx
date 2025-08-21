import React, { useEffect, useMemo, useState } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Drawer,
    Form,
    Input,
    Select,
    Popconfirm,
    Card,
    Row,
    Col,
    Progress,
    Avatar,
    Badge,
    Tooltip,
    Empty,
    Skeleton,
    Typography,
    Grid,
} from 'antd';
import {
    PlusOutlined,
    UserOutlined,
    DeleteOutlined,
    SafetyCertificateOutlined,
    SearchOutlined,
    // ReloadOutlined,
    CheckCircleTwoTone,
    ExclamationCircleTwoTone,
} from '@ant-design/icons';
import { listTeam, createMember, updateMember, deleteMember } from '../../api/accountTeamApi';
import { mailer } from '../../utils/mailer';
import { Toast } from '../../components/Alerts/CustomToast';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// ---- Small UI helpers ----
const RoleTag = ({ role }) => {
    const map = {
        admin: { color: 'magenta', label: 'Admin' },
        dealer: { color: 'geekblue', label: 'Dealer' },
        user: { color: 'blue', label: 'User' },
        member: { color: 'blue', label: 'Member' },
    };
    const { color, label } = map[role] || { color: 'default', label: role || '-' };
    return <Tag color={color}>{label}</Tag>;
};

const StatusBadge = ({ status }) => {
    const map = {
        active: { status: 'success', text: 'Active' },
        suspended: { status: 'default', text: 'Suspended' },
        disabled: { status: 'error', text: 'Disabled' },
    };
    const m = map[status] || map.active;
    return <Badge status={m.status} text={m.text} />;
};

const roleOptions = [
    { label: 'Owner', value: 'owner' },
    { label: 'Member', value: 'member' },
    { label: 'Watching', value: 'readonly' },
];

export default function TeamPage() {
    const screens = useBreakpoint();
    const isMd = screens.md; // ≥768px

    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [seats, setSeats] = useState({ purchased: 1, used: 1 });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(undefined);
    const [statusFilter, setStatusFilter] = useState(undefined);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();

    const refresh = async () => {
        setLoading(true);
        try {
            const res = await listTeam(); // { data, seats }
            let owner = res.data.filter((row) => (row.role === "owner"));
            let member = res.data.filter((row) => (row.role === "member"));
            let watching = res.data.filter((row) => (row.role === "watching"));
            setRows([...owner, ...member, ...watching] || []);

            setSeats(res.seats || { purchased: 1, used: 1 });
        } catch (e) {
            Toast.error(e?.response?.data?.error || e.Toast);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    // --- client-side filter ---
    useEffect(() => {
        let out = [...rows];
        if (search?.trim()) {
            const s = search.toLowerCase();
            out = out.filter(
                (r) => r?.email?.toLowerCase().includes(s) || r?.name?.toLowerCase().includes(s)
            );
        }
        if (roleFilter) out = out.filter((r) => r.role === roleFilter);
        if (statusFilter) out = out.filter((r) => r.status === statusFilter);
        setFiltered(out);
    }, [rows, search, roleFilter, statusFilter]);

    const columns = useMemo(
        () => [
            {
                title: 'Member',
                key: 'member',
                render: (_, row) => (
                    <Space size={12} align="center">
                        <Avatar icon={<UserOutlined />} />
                        <div style={{ lineHeight: 1.1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, maxWidth: 220 }} className="truncate">
                                {row.fullName || '-'}
                            </div>
                            <div style={{ color: 'rgba(0,0,0,0.45)', maxWidth: 260 }} className="truncate">
                                {row.email}
                            </div>
                        </div>
                    </Space>
                ),
            },
            {
                title: 'Role',
                dataIndex: 'role',
                key: 'role',
                width: 160,
                render: (v) => <RoleTag role={v} />,
                filters: roleOptions.map((r) => ({ text: r.label, value: r.value })),
                onFilter: (val, rec) => rec.role === val,
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 140,
                render: (v) => <StatusBadge status={v} />,
                filters: [
                    { text: 'Active', value: 'active' },
                    { text: 'Suspended', value: 'suspended' },
                    { text: 'Disabled', value: 'disabled' },
                ],
                onFilter: (val, rec) => rec.status === val,
                responsive: ['sm'], // hide on extra-small if needed
            },
            {
                title: 'Security',
                key: 'sec',
                width: 120,
                render: (_, r) => (
                    <Space size="small">
                        {r.isVerified ? (
                            <Tooltip title="Verified">
                                <CheckCircleTwoTone twoToneColor="#52c41a" />
                            </Tooltip>
                        ) : (
                            <Tooltip title="Not verified">
                                <ExclamationCircleTwoTone twoToneColor="#faad14" />
                            </Tooltip>
                        )}
                        {r.whatsappConnected ? (
                            <Tooltip title="WhatsApp linked">
                                <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                            </Tooltip>
                        ) : (
                            <Tooltip title="WhatsApp not linked">
                                <SafetyCertificateOutlined style={{ color: 'rgba(0,0,0,0.35)' }} />
                            </Tooltip>
                        )}
                    </Space>
                ),
                responsive: ['md'], // show from md and up
            },
            {
                title: 'Actions',
                key: 'actions',
                width: 180,
                render: (_, row) => (
                    <Space>
                        <Select
                            size="small"
                            value={row.role}
                            // style={{ width: 150 }}
                            onChange={async (val) => {
                                try {
                                    await updateMember(row._id, { role: val });
                                    Toast.success('Role updated');
                                    refresh();
                                } catch (e) {
                                    Toast.error(e?.response?.data?.error || e.Toast);
                                }
                            }}
                            options={roleOptions}
                        />
                        <Popconfirm
                            title="Remove teammate?"
                            okText="Remove"
                            okButtonProps={{ danger: true }}
                            onConfirm={async () => {
                                try {
                                    await deleteMember(row._id);
                                    Toast.success('Removed');
                                    refresh();
                                } catch (e) {
                                    Toast.error(e?.response?.data?.error || e.Toast);
                                }
                            }}
                        >
                            <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        []
    );

    const purchased = seats.purchased || 0;
    const used = seats.used || 0;
    const available = Math.max(0, purchased - used);
    const percent = purchased > 0 ? Math.min(100, Math.round((used / purchased) * 100)) : 0;

    return (
        <>
            <div className="primary-background" style={{ backgroundImage: "url('/background.svg')" }} />
            <div
                className="p-4 md:p-6"
                style={{ maxWidth: 1200, margin: '0 auto', padding: 24, backgroundColor: '#f5f5f5' }}
            >
                {/* Header Card */}
                <div className="rounded-2xl shadow-sm bg-white/60 backdrop-blur border border-gray-200 dark:border-white/10 mb-4 md:mb-6">
                    <div className="px-4 md:px-6 py-4">
                        <Row gutter={[12, 12]} align="middle" justify="space-between">
                            <Col xs={24} md={8}>
                                <Title level={3} style={{ marginBottom: 4 }}>Team Members</Title>
                                <div style={{ color: 'rgba(0,0,0,0.45)' }}>
                                    Manage seats, roles, and access for your company.
                                </div>
                            </Col>

                            <Col xs={24} md={16}>
                                <Row gutter={[8, 8]} justify={isMd ? 'end' : 'start'}>
                                    <Col xs={24} sm={12} md={10} lg={10}>
                                        <Input
                                            allowClear
                                            placeholder="Search name or email"
                                            prefix={<SearchOutlined />}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </Col>
                                    <Col xs={12} sm={6} md={6} lg={5}>
                                        <Select
                                            allowClear
                                            placeholder="Filter role"
                                            value={roleFilter}
                                            onChange={setRoleFilter}
                                            options={roleOptions}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                    <Col xs={12} sm={6} md={6} lg={5}>
                                        <Select
                                            allowClear
                                            placeholder="Filter status"
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                            options={[
                                                { label: 'Active', value: 'active' },
                                                { label: 'Suspended', value: 'suspended' },
                                                { label: 'Disabled', value: 'disabled' },
                                            ]}
                                            style={{ width: '100%' }}
                                        />
                                    </Col>
                                    <Col xs={24} sm={24} md={6} lg={4}>
                                        <Button
                                            type="primary"
                                            icon={<PlusOutlined />}
                                            onClick={() => setDrawerOpen(true)}
                                            disabled={available <= 0}
                                            block={!isMd}
                                        >
                                            {available > 0 ? 'Invite' : 'No seats'}
                                        </Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    {/* Seats Overview */}
                    <div className="px-4 md:px-6 pb-4">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card className="rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <Progress
                                            type="dashboard"
                                            percent={percent}
                                            width={isMd ? 90 : 70}
                                            format={() => `${used}/${purchased}`}
                                        />
                                        <div className="flex-1 grid grid-cols-3 gap-2" style={{ width: '100%' }}>
                                            <div className="p-3 rounded-lg bg-gray-50">
                                                <div className="text-xs text-gray-500">Purchased</div>
                                                <div className="text-lg font-semibold">{purchased}</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-gray-50">
                                                <div className="text-xs text-gray-500">Used</div>
                                                <div className="text-lg font-semibold">{used}</div>
                                            </div>
                                            <div className="p-3 rounded-lg bg-gray-50">
                                                <div className="text-xs text-gray-500">Available</div>
                                                <div className="text-lg font-semibold">{available}</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <Card className="rounded-xl">
                                    <div className="text-sm text-gray-600">
                                        Seat usage resets with your billing period. To add more members when seats are
                                        full, purchase additional seats in <strong>Account &gt; Plan</strong>.
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white dark:bg-[#0b0b0c]">
                    {loading ? (
                        <div className="p-6">
                            <Skeleton active paragraph={{ rows: 3 }} />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-14">
                            <Empty
                                description={
                                    <div className="text-gray-500">No team members found {search ? 'for your filters' : ''}.</div>
                                }
                            >
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => setDrawerOpen(true)}
                                    disabled={available <= 0}
                                >
                                    {available > 0 ? 'Add teammate' : 'No seats'}
                                </Button>
                            </Empty>
                        </div>
                    ) : (
                        <Table
                            rowKey="_id"
                            dataSource={filtered}
                            columns={columns}
                            pagination={{ pageSize: 10, showSizeChanger: false }}
                            size="middle"
                            className="!rounded-2xl"
                            scroll={{ x: 800 }}
                        />
                    )}
                </div>

                {/* Add Drawer */}
                <Drawer
                    title="Add teammate"
                    placement="right"
                    width={isMd ? 420 : '100%'}
                    onClose={() => setDrawerOpen(false)}
                    open={drawerOpen}
                    destroyOnClose
                >
                    <div className="mb-4 rounded-lg bg-blue-50 border border-blue-100 p-3 text-blue-700 text-sm">
                        Seats available: <strong>{available}</strong>
                    </div>

                    <Form
                        layout="vertical"
                        form={form}
                        onFinish={async (values) => {
                            try {
                                setCreating(true);
                                let res = await createMember(values);
                                const { email, fullName } = res.data
                                const Toast = `Hi ${fullName},

                                    Your account has been created.

                                    Email: ${email}
                                    Temporary password: ${res.password}

                                    Please sign in and change your password right away.
                                `.trim();
                                
                                await mailer({ email, Toast: Toast })
                                
                                setDrawerOpen(false);
                                form.resetFields();
                                refresh();
                            } catch (e) {
                                Toast.error(e?.response?.data?.error || e.Toast);
                            } finally {
                                setCreating(false);
                            }
                        }}
                    >
                        <Form.Item name="fullName" label="Full Name">
                            <Input placeholder="Full name (optional)" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, Toast: 'Email required' },
                                { type: 'email', Toast: 'Invalid email' },
                            ]}
                        >
                            <Input placeholder="teammate@company.com" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Temporary Password"
                            rules={[
                                { required: true, Toast: 'Password required' },
                                { min: 8, Toast: 'Minimum 8 characters' },
                            ]}
                            extra="They can change this after first login."
                        >
                            <Input.Password placeholder="Set a temporary password" />
                        </Form.Item>

                        <Form.Item name="role" label="Role" initialValue="member">
                            <Select options={roleOptions} />
                        </Form.Item>

                        <Space className="w-full" style={{ justifyContent: 'flex-end', width: '100%' }}>
                            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={creating}>
                                Invite
                            </Button>
                        </Space>
                    </Form>

                    {available <= 0 && (
                        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-100 p-3 text-amber-700 text-sm">
                            You’ve used all seats. Buy more seats in <strong>Account &gt; Plan</strong> to add teammates.
                        </div>
                    )}
                </Drawer>
            </div>
        </>
    );
}
