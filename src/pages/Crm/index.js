import React, { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Space,
    Dropdown,
    Menu,
    Drawer,
    Form,
    List,
    Popconfirm,
    Typography,
    Empty,
    Card,
    Tooltip,
    Avatar,
    DatePicker,
    Grid,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    MoreOutlined,
    DownloadOutlined,
    StarFilled,
    FilterOutlined,
    ReloadOutlined,
    CloudUploadOutlined,
    TagOutlined,
    ContactsOutlined,
    DeleteOutlined,
    ArrowRightOutlined,
    UserOutlined,
    TeamOutlined,
} from "@ant-design/icons";

// ✅ Use your API layer (no mocks)
import {
    listContacts,
    deleteContact,
    createContact,
    updateContact,
    exportContacts,
} from "../../api/crm";
import { Toast } from "../../components/Alerts/CustomToast";

const { useBreakpoint } = Grid

/**
 * CRM Customers & Dealers — Beautiful Table UI (JavaScript, AntD v4)
 * This is YOUR UI wired to real API calls. No seeded/mock data here.
 */

/********************\
|* Utility helpers *|
\********************/
const countries = ["UK", "UAE", "HK", "USA", "JP", "DE", "FR"];
const sampleTags = ["VIP", "repeat", "trusted", "new", "wholesale", "rolex"];

const useTableState = (initial = {}) => {
    const [page, setPage] = useState(initial.page || 1);
    const [pageSize, setPageSize] = useState(initial.pageSize || 10);
    const [search, setSearch] = useState("");
    const [country, setCountry] = useState();
    const [tags, setTags] = useState([]);
    const [range, setRange] = useState([]); // antd RangePicker value
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [selection, setSelection] = useState([]);
    const reloadKey = useRef(0);
    const triggerReload = () => (reloadKey.current += 1);

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        search,
        setSearch,
        country,
        setCountry,
        tags,
        setTags,
        range,
        setRange,
        loading,
        setLoading,
        rows,
        setRows,
        total,
        setTotal,
        selection,
        setSelection,
        reloadKey,
        triggerReload,
    };
};

// Format a dayjs/moment/Date/string into YYYY-MM-DD for API
const fmtDate = (v) => {
    if (!v) return undefined;
    if (typeof v === "string") return v;
    if (v?.format) return v.format("YYYY-MM-DD"); // dayjs/moment
    try {
        return new Date(v).toISOString().slice(0, 10);
    } catch {
        return undefined;
    }
};

/**********************\
|* Shared UI pieces   *|
\**********************/
const SectionHeader = ({ title, icon, extra }) => (
    <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            {icon}
            <Typography.Title level={4} className="!mb-0">
                {title}
            </Typography.Title>
        </div>
        <div>{extra}</div>
    </div>
);

const FiltersBar = ({ state, onSearch }) => {
    const { search, setSearch, country, setCountry, tags, setTags, range, setRange, triggerReload } = state;
    const [local, setLocal] = useState({ search, country, tags, range });

    useEffect(() => setLocal({ search, country, tags, range }), [search, country, tags, range]);

    const apply = () => {
        setSearch(local.search || "");
        setCountry(local.country);
        setTags(local.tags || []);
        setRange(local.range || []);
        onSearch?.();
        triggerReload();
    };
    const reset = () => {
        setLocal({ search: "", country: undefined, tags: [], range: [] });
        setSearch("");
        setCountry(undefined);
        setTags([]);
        setRange([]);
        onSearch?.();
        triggerReload();
    };

    return (
        <div className="grid md:grid-cols-12 gap-2">
            <Input
                className="md:col-span-3"
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search name, company, phone, email, city"
                value={local.search}
                onChange={(e) => setLocal((s) => ({ ...s, search: e.target.value }))}
            />
            <Select
                className="md:col-span-2"
                placeholder="Country"
                allowClear
                value={local.country}
                onChange={(v) => setLocal((s) => ({ ...s, country: v }))}
                options={countries.map((c) => ({ label: c, value: c }))}
            />
            <Select
                className="md:col-span-2"
                mode="multiple"
                placeholder="Tags"
                allowClear
                value={local.tags}
                onChange={(v) => setLocal((s) => ({ ...s, tags: v }))}
                options={sampleTags.map((t) => ({ label: t, value: t }))}
            />
            <DatePicker.RangePicker
                className="md:col-span-2"
                value={local.range}
                onChange={(v) => setLocal((s) => ({ ...s, range: v }))}
            />
            <Space className="md:col-span-3 flex items-center justify-end">
                <Button icon={<FilterOutlined />} onClick={apply}>
                    Apply
                </Button>
                <Button icon={<ReloadOutlined />} onClick={reset}>
                    Reset
                </Button>
            </Space>
        </div>
    );
};

const BulkBar = ({ selectedCount, onAddTag, onDelete }) => {
    if (!selectedCount) return null;
    return (
        <div className="sticky top-0 z-10 mb-2 rounded-xl border bg-white p-2 shadow-sm">
            <Space>
                <span className="text-sm">{selectedCount} selected</span>
                <Button size="small" icon={<TagOutlined />} onClick={onAddTag}>
                    Add Tag
                </Button>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>
                    Delete
                </Button>
            </Space>
        </div>
    );
};

/*****************************\
|* Add/Edit Contact Drawer   *|
\*****************************/
const AddEditContactDrawer = ({ visible, onClose, initial, onSubmit }) => {
    const [form] = Form.useForm();
    useEffect(() => {
        if (visible) form.setFieldsValue(initial || { type: "customer" });
    }, [visible, initial]);
    const submit = async () => {
        const values = await form.validateFields();
        await onSubmit(values);
    };
    return (
        <Drawer
            width={520}
            destroyOnClose
            title={initial?._id ? "Edit Contact" : "Add Contact"}
            visible={visible}
            onClose={onClose}
            footer={
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={submit} icon={<PlusOutlined />}>
                        Save
                    </Button>
                </div>
            }
        >
            <Form form={form} layout="vertical" initialValues={{ type: "customer" }}>
                <Form.Item name="type" label="Contact Type" rules={[{ required: true }]}>
                    <Select
                        options={[
                            { label: "Customer", value: "customer" },
                            { label: "Dealer", value: "dealer" },
                        ]}
                    />
                </Form.Item>
                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                    {({ getFieldValue }) =>
                        getFieldValue("type") === "dealer" ? (
                            <>
                                <Form.Item
                                    name="companyName"
                                    label="Company Name"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="e.g., Premier Watches Ltd" />
                                </Form.Item>
                                <Form.Item name="contactPerson" label="Contact Person">
                                    <Input placeholder="e.g., John Doe" />
                                </Form.Item>
                            </>
                        ) : (
                            <Form.Item
                                name="fullName"
                                label="Full Name"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="e.g., Jane Smith" />
                            </Form.Item>
                        )}
                </Form.Item>
                <Form.Item name="whatsapp" label="WhatsApp">
                    <Input placeholder="+44 7..." />
                </Form.Item>
                <Form.Item name="phone" label="Phone">
                    <Input placeholder="+1 202..." />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[{ type: "email", Toast: "Invalid email" }]}
                >
                    <Input placeholder="name@company.com" />
                </Form.Item>
                <div className="grid grid-cols-2 gap-3">
                    <Form.Item name="country" label="Country">
                        <Select
                            allowClear
                            options={countries.map((c) => ({ label: c, value: c }))}
                        />
                    </Form.Item>
                    <Form.Item name="city" label="City">
                        <Input />
                    </Form.Item>
                </div>
                <Form.Item name="tags" label="Tags">
                    <Select
                        mode="multiple"
                        allowClear
                        options={sampleTags.map((t) => ({ label: t, value: t }))}
                    />
                </Form.Item>
                <Form.Item name="notes" label="Notes">
                    <Input.TextArea rows={3} placeholder="Internal notes…" />
                </Form.Item>
            </Form>
        </Drawer>
    );
};

/************************\
|* Contacts List Page   *|
\************************/
const ContactsList = ({ type }) => {
    const state = useTableState();
    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        loading,
        setLoading,
        rows,
        setRows,
        total,
        setTotal,
        reloadKey,
        selection,
        setSelection,
        search,
        country,
        tags,
        range,
    } = state;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [importing, setImporting] = useState(false); // reserved
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const fetchData = async () => {
        setLoading(true);
        try {
            const from = range?.length ? fmtDate(range[0]) : undefined;
            const to = range?.length ? fmtDate(range[1]) : undefined;
            const { data, total } = await listContacts({
                type, // 'customer' | 'dealer'
                search,
                country,
                tags,
                page,
                limit: pageSize,
                from,
                to,
            });
            setRows(data);
            setTotal(total);
        } catch (e) {
            Toast.error(e?.response?.data?.Toast || e.Toast || "Failed to load contacts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, reloadKey.current, type]);

    const onAdd = () => {
        setEditing(null);
        setDrawerOpen(true);
    };
    const onEdit = (rec) => {
        setEditing(rec);
        setDrawerOpen(true);
    };
    const onDeleteOne = async (rec) => {
        try {
            await deleteContact(rec._id);
            Toast.success("Deleted");
            fetchData();
        } catch (e) {
            Toast.error(e.Toast);
        }
    };
    const onSubmit = async (values) => {
        try {
            if (editing?._id) {
                await updateContact(editing._id, values);
                Toast.success("Updated");
            } else {
                await createContact({ ...values });
                Toast.success("Created");
            }
            setDrawerOpen(false);
            fetchData();
        } catch (e) {
            Toast.error(e?.response?.data?.Toast || e.Toast);
        }
    };

    const onExport = async () => {
        try {
            const from = range?.length ? fmtDate(range[0]) : undefined;
            const to = range?.length ? fmtDate(range[1]) : undefined;
            await exportContacts({ type, search, country, tags, from, to });
        } catch (e) {
            Toast.error("Export failed");
        }
    };

    const columns = useMemo(() => {
        const nameCol = {
            title: type === "dealer" ? "Company / Person" : "Name",
            dataIndex: type === "dealer" ? "companyName" : "fullName",
            render: (_, r) => (
                <div
                    className={`flex items-center gap-3 ${r.tags?.includes("VIP") ? "bg-amber-50 rounded-lg px-2 py-1" : ""
                        }`}
                >
                    <Avatar size={36} icon={type === "dealer" ? <TeamOutlined /> : <UserOutlined />}>
                        {(r.companyName || r.fullName || "").slice(0, 2).toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {type === "dealer" ? r.companyName || "-" : r.fullName || "-"}
                        </span>
                        <span className="text-xs opacity-70">
                            {type === "dealer" ? r.contactPerson || "-" : r.email}
                        </span>
                    </div>
                </div>
            ),
        };

        const cols = [
            nameCol,
            { title: "WhatsApp", dataIndex: "whatsapp" },
            { title: "Phone", dataIndex: "phone" },
            { title: "Country", dataIndex: "country" },
            { title: "City", dataIndex: "city" },
            type !== "dealer"
                ? {
                    title: "LTV",
                    dataIndex: "lifetimeValue",
                    sorter: (a, b) => a.lifetimeValue - b.lifetimeValue,
                    render: (v) => (v ? `£${v.toLocaleString()}` : "-"),
                }
                : null,
            {
                title: "Tags",
                dataIndex: "tags",
                render: (arr) =>
                    arr?.length ? (
                        arr.map((t) => <Tag key={t}>{t}</Tag>)
                    ) : (
                        <span className="opacity-60">—</span>
                    ),
            },
            {
                title: "Last Contacted",
                dataIndex: "lastContactedAt",
                render: (v) => (v ? new Date(v).toLocaleDateString() : "—"),
            },
            {
                title: "Actions",
                fixed: "right",
                width: 90,
                render: (_, r) => (
                    <RowActions record={r} onEdit={onEdit} onDelete={onDeleteOne} />
                ),
            },
        ].filter(Boolean);

        return cols;
    }, [type]);

    // row selection config
    const rowSelection = {
        selectedRowKeys: selection,
        onChange: (keys) => setSelection(keys),
    };

    return (
        <div className="p-4">
            <SectionHeader
                title={type === "dealer" ? "Dealers" : "Customers"}
                icon={type === "dealer" ? <TeamOutlined /> : <UserOutlined />}
                extra={
                    <Space>
                        {/* <Button icon={<DownloadOutlined />} onClick={onExport}>
                            Export CSV
                        </Button> */}
                        <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                            Add
                        </Button>
                    </Space>
                }
            />

            <Card className="mb-3 rounded-2xl">
                <FiltersBar state={state} onSearch={() => setPage(1)} />
            </Card>

            <BulkBar
                selectedCount={selection.length}
                onAddTag={() => Toast.info("TODO: bulk add tag UI")}
                onDelete={async () => {
                    try {
                        await Promise.all(selection.map((id) => deleteContact(id)));
                        Toast.success("Deleted selected");
                        setSelection([]);
                        fetchData();
                    } catch (e) {
                        Toast.error(e?.response?.data?.Toast || e.Toast);
                    }
                }}
            />

            <Table
                rowKey="_id"
                loading={loading}
                dataSource={rows}
                columns={columns}
                rowSelection={rowSelection}
                pagination={{
                    current: page,
                    pageSize,
                    total,
                    showSizeChanger: true,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    },
                    showTotal: (t) => `${t} contact${t === 1 ? "" : "s"}`,
                }}
                scroll={{ x: "max-content" }}
                locale={{ emptyText: <Empty description="No contacts" /> }}
                className="rounded-xl border shadow-sm"
            />

            <AddEditContactDrawer
                visible={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                initial={editing}
                onSubmit={onSubmit}
            />
        </div>
    );
};

/**********************\
|* Row Actions menu    *|
\**********************/
const RowActions = ({ record, onEdit, onDelete }) => {
    const menu = (
        <Menu>
            <Menu.Item key="edit" onClick={() => onEdit(record)}>
                Edit
            </Menu.Item>
            <Menu.Item key="invoice">
                <a
                    href={`/invoices/create?${record.type === "customer" ? "buyerId" : "sellerId"}=${record._id}`}
                >
                    Create Invoice
                </a>
            </Menu.Item>
            {record.type === "dealer" && (
                <Menu.Item key="listings">
                    <a href={`/whatsapp/dealers?dealerId=${record._id}`}>View WA Listings</a>
                </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item key="delete" danger>
                <Popconfirm title="Delete contact?" onConfirm={() => onDelete(record)}>
                    Delete
                </Popconfirm>
            </Menu.Item>
        </Menu>
    );
    return (
        <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
        </Dropdown>
    );
};

/*********************\
|* Landing Page (UI) *|
\*********************/
const CRMLandingBeautiful = () => {
    const sampleRecent = [
        { id: "1", type: "customer", name: "Jane Smith", meta: "VIP · London", initials: "JS" },
        { id: "2", type: "dealer", name: "Premier Watches Ltd", meta: "Dubai", initials: "PW" },
        { id: "3", type: "customer", name: "Alex Turner", meta: "NYC", initials: "AT" },
        { id: "4", type: "dealer", name: "Royal Time HK", meta: "Hong Kong", initials: "RT" },
    ];

    const [drawerVisible, setDrawerVisible] = useState(false);

    const stats = useMemo(
        () => [
            { label: "Total Contacts", value: 284, hint: "+12 this week" },
            { label: "Customers", value: 170 },
            { label: "Dealers", value: 114 },
            { label: "Last 7d Activity", value: 63 },
        ],
        []
    );

    const ActionCard = ({ title, subtitle, icon, to, actions }) => (
        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all" bodyStyle={{ padding: 20 }}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm text-gray-500">{subtitle}</div>
                    <div className="mt-1 text-xl font-semibold">{title}</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gray-50">{icon}</div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                {to ? (
                    <Button type="primary">
                        <Link to={to}>Open</Link>
                    </Button>
                ) : null}
                {actions}
            </div>
        </Card>
    );

    const Stat = ({ label, value, hint }) => (
        <div className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 flex items-end gap-2">
                <div className="text-3xl font-semibold">{value}</div>
                {hint ? <div className="text-xs text-gray-400">{hint}</div> : null}
            </div>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-20 -bottom-16 h-64 w-64 rounded-full bg-black/10 blur-2xl" />
                <div className="relative px-6 py-7 md:px-10 md:py-10">
                    <Space direction="vertical" size={4} className="text-white">
                        <Typography.Text className="uppercase tracking-wider !text-white/80">Address book</Typography.Text>
                        <Typography.Title level={2} className="!m-0 !text-white">CRM & Contacts</Typography.Title>
                        <Typography.Paragraph className="!m-0 !text-white/90 max-w-3xl">
                            Keep buyers and dealer partners organized. Create contacts fast, filter smartly, and jump into invoices or WhatsApp activity with a click.
                        </Typography.Paragraph>
                    </Space>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>
                            Quick Add
                        </Button>
                        <Button size="large" icon={<CloudUploadOutlined />}>Import CSV</Button>
                        <Button size="large" ghost icon={<ArrowRightOutlined />}>
                            <Link to="customers">Open Customers</Link>
                        </Button>
                        <Button size="large" ghost icon={<ArrowRightOutlined />}>
                            <Link to="dealers">Open Dealers</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid gap-3 md:grid-cols-4">
                {stats.map((s) => (
                    <Stat key={s.label} {...s} />
                ))}
            </div>

            {/* Primary cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                <ActionCard
                    title="All Buyers"
                    subtitle="Customers"
                    icon={<UserOutlined className="text-xl" />}
                    to="customers"
                    actions={
                        <Button>
                            <Link to="add" state={{ type: "customer" }}>
                                Add Customer
                            </Link>
                        </Button>
                    }
                />
                <ActionCard
                    title="Trading Partners"
                    subtitle="Dealers"
                    icon={<TeamOutlined className="text-xl" />}
                    to="dealers"
                    actions={
                        <Button>
                            <Link to="add" state={{ type: "dealer" }}>
                                Add Dealer
                            </Link>
                        </Button>
                    }
                />
                <ActionCard
                    title="Add / Import"
                    subtitle="Quick Actions"
                    icon={<ContactsOutlined className="text-xl" />}
                    actions={
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerVisible(true)}>
                                Add Contact
                            </Button>
                            <Button icon={<CloudUploadOutlined />}>Import CSV</Button>
                        </Space>
                    }
                />
            </div>

            {/* Recent contacts */}
            <Card className="mt-6 rounded-2xl border shadow-sm" title={<span className="font-semibold">Recently Added</span>}>
                <List
                    itemLayout="horizontal"
                    dataSource={[
                        { id: "1", type: "customer", name: "Jane Smith", meta: "VIP · London", initials: "JS" },
                        { id: "2", type: "dealer", name: "Premier Watches Ltd", meta: "Dubai", initials: "PW" },
                        { id: "3", type: "customer", name: "Alex Turner", meta: "NYC", initials: "AT" },
                        { id: "4", type: "dealer", name: "Royal Time HK", meta: "Hong Kong", initials: "RT" },
                    ]}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <Tooltip key="open" title="Open">
                                    <Link to={item.type === "dealer" ? "dealers" : "customers"}>
                                        <ArrowRightOutlined />
                                    </Link>
                                </Tooltip>,
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={null}>{item.initials}</Avatar>}
                                title={
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.name}</span>
                                        <Tag color={item.type === "dealer" ? "gold" : "blue"}>
                                            {item.type === "dealer" ? "Dealer" : "Customer"}
                                        </Tag>
                                    </div>
                                }
                                description={<span className="text-gray-500">{item.meta}</span>}
                            />
                        </List.Item>
                    )}
                />
            </Card>

            {/* Helpful tip */}
            <div className="mt-6 rounded-xl border bg-amber-50 p-4 text-amber-800">
                <Space>
                    <StarFilled />
                    <span className="font-medium">Tip:</span>
                    <span>
                        Add tags like <strong>VIP</strong> or <strong>wholesale</strong> for fast filtering in Customers & Dealers.
                    </span>
                </Space>
            </div>

            {/* Quick Add from landing */}
            <AddEditContactDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                onSubmit={async (v) => {
                    await createContact(v);
                    Toast.success("Created");
                    setDrawerVisible(false);
                }}
            />
        </div>
    );
};

/*********************\
|* Add via Route     *|
\*********************/
const AddContactRoute = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initType = location.state?.type;
    const [open, setOpen] = useState(true);
    return (
        <AddEditContactDrawer
            visible={open}
            initial={initType ? { type: initType } : undefined}
            onClose={() => {
                setOpen(false);
                navigate(-1);
            }}
            onSubmit={async (values) => {
                await createContact(values);
                Toast.success("Created");
                navigate("../customers");
            }}
        />
    );
};

/************************\
|* Optional Route Shell *|
\************************/
export default function CRMModule() {
    return (
        <div className="min-h-screen bg-gray-50" style={{ backgroundImage: "url('/background.svg')", backgroundAttachment: "fixed" }}>
            {/* <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="." className="font-semibold">
                            CRM
                        </Link>
                        <Space size={6}>
                            <Button size="small">
                                <Link to="customers">Customers</Link>
                            </Button>
                            <Button size="small">
                                <Link to="dealers">Dealers</Link>
                            </Button>
                            <Button size="small" type="primary">
                                <Link to="add">Add</Link>
                            </Button>
                        </Space>
                    </div>
                    <div className="text-xs opacity-60">Polished tables for customers & dealers</div>
                </div>
            </div> */}

            <div className="max-w-7xl mx-auto">
                <Routes>
                    {/* <Route index element={<CRMLandingBeautiful />} /> */}
                    <Route path="customers" element={<ContactsList type="customer" />} />
                    <Route path="dealers" element={<ContactsList type="dealer" />} />
                    <Route path="add" element={<AddContactRoute />} />
                    <Route path="*" element={<Navigate to="." replace />} />
                </Routes>
            </div>
        </div>
    );
}
