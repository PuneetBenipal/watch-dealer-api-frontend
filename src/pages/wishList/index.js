import React, { useState, useEffect } from "react";
import {
    Card,
    Button,
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    DatePicker,
    Table,
    Tag,
    Space,
    Tooltip,
    Popconfirm,
    message,
    Empty,
    Row,
    Col,
    Typography,
    Statistic,
    Progress
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    HeartOutlined,
    DollarOutlined,
    CalendarOutlined,
    SearchOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";
import moment from "moment";
import "./index.css";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const WishList = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    // Sample data - replace with actual API calls
    useEffect(() => {
        // Load wishlist data from localStorage or API
        const savedWishlist = localStorage.getItem("wishlist");
        if (savedWishlist) {
            setWishlist(JSON.parse(savedWishlist));
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const handleAddItem = () => {
        setEditingItem(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditItem = (record) => {
        setEditingItem(record);
        form.setFieldsValue({
            ...record,
            targetDate: record.targetDate ? moment(record.targetDate) : null
        });
        setModalVisible(true);
    };

    const handleDeleteItem = (id) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
        message.success("Item removed from wishlist");
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const itemData = {
                ...values,
                targetDate: values.targetDate ? values.targetDate.toISOString() : null,
                createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: editingItem ? editingItem.status : "pending"
            };

            if (editingItem) {
                // Update existing item
                setWishlist(prev => prev.map(item => 
                    item.id === editingItem.id ? { ...item, ...itemData } : item
                ));
                message.success("Wishlist item updated successfully");
            } else {
                // Add new item
                const newItem = {
                    ...itemData,
                    id: Date.now().toString(),
                    status: "pending"
                };
                setWishlist(prev => [newItem, ...prev]);
                message.success("Item added to wishlist successfully");
            }

            setModalVisible(false);
            setEditingItem(null);
            form.resetFields();
        } catch (error) {
            console.error("Form validation failed:", error);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setEditingItem(null);
        form.resetFields();
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: "green",
            medium: "orange",
            high: "red",
            urgent: "purple"
        };
        return colors[priority] || "default";
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: "orange",
            in_progress: "blue",
            completed: "green",
            cancelled: "red"
        };
        return colors[status] || "default";
    };

    const getStatusText = (status) => {
        const texts = {
            pending: "Pending",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled: "Cancelled"
        };
        return texts[status] || status;
    };

    const columns = [
        {
            title: "Item",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        {record.brand && `${record.brand} • `}{record.model}
                    </Text>
                </div>
            ),
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            render: (priority) => (
                <Tag color={getPriorityColor(priority)}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Tag>
            ),
            filters: [
                { text: "Low", value: "low" },
                { text: "Medium", value: "medium" },
                { text: "High", value: "high" },
                { text: "Urgent", value: "urgent" }
            ],
            onFilter: (value, record) => record.priority === value,
        },
        {
            title: "Budget",
            dataIndex: "budget",
            key: "budget",
            render: (budget) => (
                <div>
                    <DollarOutlined style={{ marginRight: 4, color: "#52c41a" }} />
                    {budget ? `$${budget.toLocaleString()}` : "Not specified"}
                </div>
            ),
            sorter: (a, b) => (a.budget || 0) - (b.budget || 0),
        },
        {
            title: "Target Date",
            dataIndex: "targetDate",
            key: "targetDate",
            render: (date) => (
                <div>
                    <CalendarOutlined style={{ marginRight: 4, color: "#1890ff" }} />
                    {date ? moment(date).format("MMM DD, YYYY") : "No deadline"}
                </div>
            ),
            sorter: (a, b) => new Date(a.targetDate || 0) - new Date(b.targetDate || 0),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: "Pending", value: "pending" },
                { text: "In Progress", value: "in_progress" },
                { text: "Completed", value: "completed" },
                { text: "Cancelled", value: "cancelled" }
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small" className="action-buttons">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleEditItem(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditItem(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Remove from wishlist?"
                        description="Are you sure you want to remove this item?"
                        onConfirm={() => handleDeleteItem(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredWishlist = wishlist.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                            (item.brand && item.brand.toLowerCase().includes(searchText.toLowerCase())) ||
                            (item.model && item.model.toLowerCase().includes(searchText.toLowerCase())) ||
                            (item.description && item.description.toLowerCase().includes(searchText.toLowerCase()));
        
        const matchesPriority = filterPriority === "all" || item.priority === filterPriority;
        const matchesStatus = filterStatus === "all" || item.status === filterStatus;
        
        return matchesSearch && matchesPriority && matchesStatus;
    });

    const getWishlistStats = () => {
        const total = wishlist.length;
        const pending = wishlist.filter(item => item.status === "pending").length;
        const inProgress = wishlist.filter(item => item.status === "in_progress").length;
        const completed = wishlist.filter(item => item.status === "completed").length;
        const urgent = wishlist.filter(item => item.priority === "urgent").length;
        const totalBudget = wishlist.reduce((sum, item) => sum + (item.budget || 0), 0);

        return { total, pending, inProgress, completed, urgent, totalBudget };
    };

    const stats = getWishlistStats();

    return (
        <div className="wishlist-container">
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <div className="wishlist-header">
                    <Title level={2} style={{ margin: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <HeartOutlined style={{ marginRight: "12px", color: "#ff4d4f" }} />
                        My Wishlist
                    </Title>
                    <Text type="secondary" style={{ fontSize: "16px", marginTop: "8px" }}>
                        Track items you want to buy and manage your shopping goals
                    </Text>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} className="stats-cards">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Items"
                                value={stats.total}
                                prefix={<HeartOutlined style={{ color: "#ff4d4f" }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Pending"
                                value={stats.pending}
                                prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="In Progress"
                                value={stats.inProgress}
                                prefix={<SyncOutlined style={{ color: "#1890ff" }} />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Completed"
                                value={stats.completed}
                                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Budget Progress */}
                {stats.totalBudget > 0 && (
                    <Card className="budget-progress-card">
                        <div style={{ marginBottom: "16px" }}>
                            <Text strong>Total Budget: ${stats.totalBudget.toLocaleString()}</Text>
                        </div>
                        <Progress
                            percent={Math.min((stats.completed / stats.total) * 100, 100)}
                            status="active"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {stats.completed} of {stats.total} items completed
                        </Text>
                    </Card>
                )}

                {/* Actions and Filters */}
                <Card className="actions-filters-card">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={12} md={8}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={handleAddItem}
                                style={{ width: "100%" }}
                            >
                                Add Wishlist Item
                            </Button>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Input
                                placeholder="Search items..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Priority"
                                value={filterPriority}
                                onChange={setFilterPriority}
                                style={{ width: "100%" }}
                            >
                                <Option value="all">All Priorities</Option>
                                <Option value="low">Low</Option>
                                <Option value="medium">Medium</Option>
                                <Option value="high">High</Option>
                                <Option value="urgent">Urgent</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Select
                                placeholder="Status"
                                value={filterStatus}
                                onChange={setFilterStatus}
                                style={{ width: "100%" }}
                            >
                                <Option value="all">All Status</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="in_progress">In Progress</Option>
                                <Option value="completed">Completed</Option>
                                <Option value="cancelled">Cancelled</Option>
                            </Select>
                        </Col>
                    </Row>
                </Card>

                {/* Wishlist Table */}
                <Card className="wishlist-table-card">
                    {filteredWishlist.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={filteredWishlist}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} items`,
                            }}
                            scroll={{ x: 800 }}
                        />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span>
                                    {searchText || filterPriority !== "all" || filterStatus !== "all"
                                        ? "No items match your filters"
                                        : "Your wishlist is empty"}
                                </span>
                            }
                        >
                            {!searchText && filterPriority === "all" && filterStatus === "all" && (
                                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>
                                    Add Your First Item
                                </Button>
                            )}
                        </Empty>
                    )}
                </Card>

                {/* Add/Edit Modal */}
                <Modal
                    title={editingItem ? "Edit Wishlist Item" : "Add Wishlist Item"}
                    open={modalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    width={600}
                    okText={editingItem ? "Update" : "Add"}
                    cancelText="Cancel"
                >
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            priority: "medium",
                            status: "pending"
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Item Name"
                                    rules={[{ required: true, message: "Please enter item name" }]}
                                >
                                    <Input placeholder="e.g., Rolex Submariner" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="priority"
                                    label="Priority"
                                    rules={[{ required: true, message: "Please select priority" }]}
                                >
                                    <Select>
                                        <Option value="low">Low</Option>
                                        <Option value="medium">Medium</Option>
                                        <Option value="high">High</Option>
                                        <Option value="urgent">Urgent</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="brand"
                                    label="Brand"
                                >
                                    <Input placeholder="e.g., Rolex" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="model"
                                    label="Model"
                                >
                                    <Input placeholder="e.g., Submariner" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="budget"
                                    label="Budget ($)"
                                >
                                    <InputNumber
                                        placeholder="0"
                                        min={0}
                                        style={{ width: "100%" }}
                                        formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="targetDate"
                                    label="Target Date"
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        placeholder="Select date"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="description"
                            label="Description"
                        >
                            <TextArea
                                rows={4}
                                placeholder="Describe what you're looking for, any specific requirements, etc."
                            />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="condition"
                                    label="Preferred Condition"
                                >
                                    <Select placeholder="Select condition">
                                        <Option value="new">New</Option>
                                        <Option value="like_new">Like New</Option>
                                        <Option value="excellent">Excellent</Option>
                                        <Option value="good">Good</Option>
                                        <Option value="fair">Fair</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="source"
                                    label="Preferred Source"
                                >
                                    <Select placeholder="Select source">
                                        <Option value="dealer">Dealer</Option>
                                        <Option value="private_seller">Private Seller</Option>
                                        <Option value="auction">Auction</Option>
                                        <Option value="online">Online Store</Option>
                                        <Option value="any">Any</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {editingItem && (
                            <Form.Item
                                name="status"
                                label="Status"
                            >
                                <Select>
                                    <Option value="pending">Pending</Option>
                                    <Option value="in_progress">In Progress</Option>
                                    <Option value="completed">Completed</Option>
                                    <Option value="cancelled">Cancelled</Option>
                                </Select>
                            </Form.Item>
                        )}
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default WishList;