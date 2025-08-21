import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button, Descriptions, Modal, Image, Table, Tag, Space, Typography, Alert } from 'antd';
import { fetchStatus, startLink, openSSE, fetchGroups, saveGroups, logoutWA } from '../../store/slices/whatsappSlice';

const { Title, Text } = Typography;

export default function AccountWhatsApp() {
    const d = useDispatch();
    const { status, qr, meWid, pushName, deviceName, groups, loading } = useSelector(s => s.wa);
    const [selKeys, setSelKeys] = useState([]);

    useEffect(() => { d(fetchStatus()); }, [d]);
    useEffect(() => { if (status === 'qr' || status === 'connecting') d(openSSE()); }, [status, d]);

    useEffect(() => {
        if (status === 'ready') d(fetchGroups());
    }, [status, d]);

    useEffect(() => {
        setSelKeys(groups.filter(g => g.included).map(g => g.groupId));
    }, [groups]);

    const columns = useMemo(() => ([
        { title: 'Group', dataIndex: 'name', key: 'name' },
        { title: 'ID', dataIndex: 'groupId', key: 'groupId', ellipsis: true },
        { title: 'Included', key: 'included', render: (_, r) => r.included ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag> }
    ]), []);

    const onConnect = async () => { await d(startLink()); d(openSSE()); };
    const onSave = async () => {
        const selections = groups.map(g => ({ ...g, included: selKeys.includes(g.groupId) }));
        await d(saveGroups(selections));
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Title level={3}>WhatsApp Setup</Title>

            {status === 'disconnected' && (
                <Card>
                    <Alert type="info" showIcon message="Connect your WhatsApp via WhatsApp Web to add your private groups to search." />
                    <Space style={{ marginTop: 16 }}>
                        <Button type="primary" onClick={onConnect}>Connect WhatsApp</Button>
                    </Space>
                </Card>
            )}

            {(status === 'qr' || status === 'connecting') && (
                <Modal open centered footer={null} closable={false}>
                    <Title level={4} style={{ textAlign: 'center' }}>
                        {status === 'qr' ? 'Scan this QR with your WhatsApp' : 'Connecting…'}
                    </Title>
                    {qr && <Image src={qr} alt="WhatsApp QR" preview={false} style={{ display: 'block', margin: '0 auto', width: 260 }} />}
                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                        Open WhatsApp → Linked devices → Link a device
                    </Text>
                </Modal>
            )}

            {status === 'ready' && (
                <Card>
                    <Descriptions title="Connection" bordered size="small" column={1}>
                        <Descriptions.Item label="Account">{pushName || '—'}</Descriptions.Item>
                        <Descriptions.Item label="WhatsApp ID">{meWid || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Device">{deviceName || '—'}</Descriptions.Item>
                        <Descriptions.Item label="Status"><Tag color="green">Connected</Tag></Descriptions.Item>
                    </Descriptions>
                    <Space style={{ marginTop: 16 }}>
                        <Button onClick={() => d(fetchGroups())} loading={loading}>Sync Groups</Button>
                        <Button danger onClick={() => d(logoutWA())}>Unlink</Button>
                    </Space>
                </Card>
            )}

            {status === 'ready' && (
                <Card title="Select Private Groups to Include in Search">
                    <Table
                        rowKey="groupId"
                        loading={loading}
                        columns={columns}
                        dataSource={groups}
                        rowSelection={{
                            selectedRowKeys: selKeys,
                            onChange: setSelKeys
                        }}
                        pagination={{ pageSize: 8 }}
                    />
                    <Space style={{ marginTop: 12 }}>
                        <Button type="primary" onClick={onSave}>Save Selection</Button>
                    </Space>
                </Card>
            )}
        </Space>
    );
}
