import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSettings, saveSettings,
    listGroups, addGroup, removeGroup,
    getHealth, runParser, testParser,
    initSession, pollSession, hideQr, resetError
} from '../../store/slices/whatsappSlice';
import {
    Alert, Button, Card, Col, Descriptions, Divider, Form, Input, List, Modal,
    Row, Select, Space, Spin, Statistic, Switch, Tag, Tooltip, Typography
} from 'antd';
import { PlusOutlined, ReloadOutlined, PlayCircleOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons';


const { Title, Text } = Typography;


export default function WhatsAppSetup() {
    const dispatch = useDispatch();
    const {
        sessionId, connectionStatus, qrImageDataUrl, qrVisible,
        settings, settingsLoading,
        groups, groupsLoading,
        health, healthLoading,
        running, testing, error
    } = useSelector(s => s.whatsapp);


    const [form] = Form.useForm();
    const [adding, setAdding] = useState(false);


    useEffect(() => { dispatch(fetchSettings()); dispatch(listGroups()); dispatch(getHealth()); }, [dispatch]);


    // Poll connection while waiting
    useEffect(() => {
        if (!sessionId || connectionStatus !== 'waiting') return;
        const id = setInterval(() => dispatch(pollSession(sessionId)), 2000);
        return () => clearInterval(id);
    }, [sessionId, connectionStatus, dispatch]);


    useEffect(() => { form.setFieldsValue(settings); }, [settings, form]);


    const statusTag = useMemo(() => {
        const map = { idle: 'default', waiting: 'processing', connected: 'success', error: 'error' };
        return <Tag color={map[connectionStatus] || 'default'} style={{ fontSize: 12 }}>{(connectionStatus || 'idle').toUpperCase()}</Tag>;
    }, [connectionStatus]);

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: 'auto', padding: '24px' }}>
            <Space direction="vertical" size={16} style={{ width: '100%', maxWidth: '1200px' }}>
                <Title level={3} style={{ marginBottom: 0 }}>WhatsApp Setup</Title>
                <Text type="secondary">Connect your WhatsApp, choose groups to parse, and control the parser. Scraping runs on our servers using your authenticated session.</Text>

                {error && (
                    <Alert type="error" showIcon message="Action failed" description={error} closable onClose={() => dispatch(resetError())} />
                )}

                {/* Connection */}
                <Card title={<Space> Connection {statusTag}</Space>} extra={
                    <Space>
                        <Tooltip title="Show QR to link WhatsApp Web session">
                            <Button icon={<QrcodeOutlined />} onClick={() => dispatch(initSession())}>Show QR</Button>
                        </Tooltip>
                        <Tooltip title="Refresh connection status">
                            <Button icon={<ReloadOutlined />} onClick={() => sessionId && dispatch(pollSession(sessionId))} />
                        </Tooltip>
                    </Space>
                }>
                    <Descriptions size="small" column={1} bordered>
                        <Descriptions.Item label="Session">
                            <Space>
                                <Text code>{sessionId ? sessionId : '—'}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Notes">
                            Scan the QR in WhatsApp → Linked Devices to connect. Keep the device online occasionally to refresh the session.
                        </Descriptions.Item>
                    </Descriptions>
                    <Modal
                        title="Scan to Link WhatsApp"
                        open={qrVisible}
                        onCancel={() => dispatch(hideQr())}
                        footer={null}
                    >
                        {qrImageDataUrl ? (
                            <div style={{ textAlign: 'center' }}>
                                <img src={qrImageDataUrl} alt="WhatsApp QR" style={{ maxWidth: '100%', borderRadius: 8 }} />
                                <Divider />
                                <Text type="secondary">Waiting for scan… this modal will close once connected.</Text>
                            </div>
                        ) : (
                            <Spin />
                        )}
                    </Modal>
                </Card >

                {/* Parser Settings */}
                < Card title="Parser Settings" extra={< Button type="primary" loading={settingsLoading} onClick={() => form.submit()}> Save</Button >}>
                    <Form form={form} layout="vertical" onFinish={(vals) => dispatch(saveSettings(vals))} initialValues={settings}>
                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Item name="throttle" label="Throttle (msgs/min)" rules={[{ required: true }]}>
                                    <Input type="number" min={5} max={300} placeholder="30" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="schedule" label="Schedule">
                                    <Select options={[
                                        { label: 'Off (manual only)', value: 'off' },
                                        { label: 'Daily 06:00', value: 'daily-06:00' },
                                        { label: 'Daily 08:00', value: 'daily-08:00' },
                                        { label: 'Daily 20:00', value: 'daily-20:00' },
                                    ]} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={8}>
                                <Form.Item name="mediaDownload" label="Download media">
                                    <Switch defaultChecked={settings.mediaDownload} onChange={(v) => form.setFieldsValue({ mediaDownload: v })} />
                                </Form.Item>
                                <Form.Item name="dedup" label="De‑duplication">
                                    <Switch defaultChecked={settings.dedup} onChange={(v) => form.setFieldsValue({ dedup: v })} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item name="countryRules" label="Country tagging rules">
                                    <Select mode="tags" tokenSeparators={[',']} placeholder="UK, UAE, HK, USA" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card >

                {/* Groups */}
                < Card title="Groups to Parse" extra={< Button icon={< PlusOutlined />} onClick={() => setAdding(true)}> Add Group</Button >}>
                    <List
                        loading={groupsLoading}
                        dataSource={groups}
                        locale={{ emptyText: 'No groups yet. Add an invite link or ID.' }}
                        renderItem={(g) => (
                            <List.Item actions={[
                                <Tooltip title="Remove group" key="del">
                                    <Button type="text" icon={<DeleteOutlined />} danger onClick={() => dispatch(removeGroup(g.id))} />
                                </Tooltip>
                            ]}>
                                <List.Item.Meta
                                    title={<Space>
                                        <Text strong>{g.title || 'WhatsApp Group'}</Text>
                                        {g.country && <Tag>{g.country}</Tag>}
                                    </Space>}
                                    description={<Text type="secondary">{g.link || g.id}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                    <Modal
                        title="Add WhatsApp Group"
                        open={adding}
                        onCancel={() => setAdding(false)}
                        onOk={() => {
                            const link = document.getElementById('wa_group_link').value.trim();
                            if (link) dispatch(addGroup(link));
                            setAdding(false);
                        }}
                    >
                        <Input id="wa_group_link" placeholder="Paste invite link or group ID" />
                    </Modal>
                </Card >


                {/* Health */}
                < Card title="Health & Actions" extra={
                    < Space >
                        <Button icon={<PlayCircleOutlined />} type="primary" loading={running} onClick={() => dispatch(runParser())}>Run Now</Button>
                        <Button icon={<PlayCircleOutlined />} loading={testing} onClick={() => dispatch(testParser())}>Test Parse</Button>
                        <Button icon={<ReloadOutlined />} onClick={() => dispatch(getHealth())}>Refresh</Button>
                    </Space >
                }>
                    <Row gutter={16}>
                        <Col xs={24} md={8}><Statistic title="Parsed today" value={health.parsedToday || 0} /></Col>
                        <Col xs={24} md={8}><Statistic title="Duplicates removed" value={health.duplicatesRemovedToday || 0} /></Col>
                        <Col xs={24} md={8}><Statistic title="Last sync" value={health.lastSyncAt ? new Date(health.lastSyncAt).toLocaleString() : '—'} /></Col>
                    </Row>
                    <Divider />
                    <Title level={5}>Recent errors</Title>
                    {
                        healthLoading ? <Spin /> : (
                            <List
                                size="small"
                                dataSource={health.recentErrors || []}
                                locale={{ emptyText: 'No recent errors' }}
                                renderItem={(e) => (
                                    <List.Item>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <Text code>{new Date(e.time).toLocaleString()}</Text>
                                            <Text type="secondary">{e.message}</Text>
                                        </Space>
                                    </List.Item>
                                )}
                            />
                        )
                    }
                </Card >
            </Space >
        </div>
    );
}