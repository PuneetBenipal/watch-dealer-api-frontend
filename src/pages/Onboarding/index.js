// import React, { useMemo, useState } from "react";
// import {
//     Layout,
//     Steps,
//     Card,
//     Form,
//     Input,
//     Button,
//     Upload,
//     Select,
//     Checkbox,
//     Row,
//     Col,
//     Avatar,
//     List,
//     Modal,
//     Typography,
//     Divider,
//     Tooltip,
//     Tag,
//     Toast
// } from "antd";
// import { PlusOutlined, UploadOutlined, UserAddOutlined, QrcodeOutlined, InboxOutlined } from "@ant-design/icons";

// const { Header, Content } = Layout;
// const { Step } = Steps;
// const { Title, Text, Paragraph } = Typography;
// const { Option } = Select;

// /** ------------------------------------------------------------------
//  * Onboarding Wizard — Ant Design v4 (single-file, modular subcomponents)
//  * Steps (from your sitemap):
//  *  1) Upload Company Logo
//  *  2) Add Your First Watch (optional)
//  *  3) Connect WhatsApp Parser
//  *  4) Invite Team Members
//  *  5) Set Alert Preferences
//  *  ✅ Complete
//  *
//  * Hook up submit handlers to your API. Currently mocked with `Toast`.
//  * No AntD v5-only APIs used. No <Flex/> usage.
//  * ------------------------------------------------------------------ */

// // ---------- Helpers
// const getBase64 = (file) =>
//     new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = () => resolve(reader.result);
//         reader.onerror = (error) => reject(error);
//     });

// const SectionHeader = ({ title, subtitle }) => (
//     <div style={{ marginBottom: 16 }}>
//         <Title level={4} style={{ marginBottom: 4 }}>{title}</Title>
//         {subtitle && <Text type="secondary">{subtitle}</Text>}
//     </div>
// );

// const FooterNav = ({ loading, onBack, onSkip, onNext, nextLabel = "Save & Continue", showBack = true, showSkip = false }) => (
//     <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
//         <div>
//             {showBack && (
//                 <Button onClick={onBack} style={{ marginRight: 8 }}>
//                     Back
//                 </Button>
//             )}
//         </div>
//         <div>
//             {showSkip && (
//                 <Button type="dashed" onClick={onSkip} style={{ marginRight: 8 }}>
//                     Skip
//                 </Button>
//             )}
//             <Button type="primary" loading={loading} onClick={onNext}>
//                 {nextLabel}
//             </Button>
//         </div>
//     </div>
// );

// // ---------- Step 1: Company Logo
// const StepCompanyLogo = ({ initial, onSaved }) => {
//     const [form] = Form.useForm();
//     const [preview, setPreview] = useState(initial?.logoUrl || null);
//     const [fileList, setFileList] = useState([]);
//     const [saving, setSaving] = useState(false);

//     const beforeUpload = async (file) => {
//         const isImage = file.type?.startsWith("image/");
//         if (!isImage) {
//             Toast.error("Please upload an image file");
//             return Upload.LIST_IGNORE;
//         }
//         const base64 = await getBase64(file);
//         setPreview(base64);
//         setFileList([{
//             uid: String(Date.now()),
//             name: file.name,
//             status: "done",
//             url: base64
//         }]);
//         return Upload.LIST_IGNORE; // prevent auto-upload
//     };

//     const submit = async () => {
//         try {
//             setSaving(true);
//             const values = await form.validateFields();
//             // TODO: POST /api/account/company { name, logoBase64 }
//             onSaved?.({ ...values, logoUrl: preview });
//             Toast.success("Company profile saved");
//         } catch (e) {
//             // validation error
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <Card bordered={false}>
//             <SectionHeader
//                 title="Upload Company Logo"
//                 subtitle="Add your brand to invoices, share links, and dashboard."
//             />
//             <Form layout="vertical" form={form} initialValues={{ name: initial?.name }}>
//                 <Row gutter={24}>
//                     <Col xs={24} md={16}>
//                         <Form.Item label="Company Name" name="name" rules={[{ required: true, Toast: "Enter your company name" }]}>
//                             <Input placeholder="E.g. Prime Time Dealers" />
//                         </Form.Item>
//                         <Form.Item label="Logo" required>
//                             <Upload.Dragger
//                                 accept="image/*"
//                                 beforeUpload={beforeUpload}
//                                 fileList={fileList}
//                                 onRemove={() => { setPreview(null); setFileList([]); }}
//                             >
//                                 <p className="ant-upload-drag-icon">
//                                     <InboxOutlined />
//                                 </p>
//                                 <p className="ant-upload-text">Click or drag file to this area to upload</p>
//                                 <p className="ant-upload-hint">PNG or JPG, recommended 512×512 transparent</p>
//                             </Upload.Dragger>
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Card size="small" title="Preview" style={{ textAlign: "center" }}>
//                             {preview ? (
//                                 <Avatar shape="square" size={128} src={preview} style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.12)" }} />
//                             ) : (
//                                 <Avatar shape="square" size={128} icon={<PlusOutlined />} />
//                             )}
//                             <Divider />
//                             <Text type="secondary">Shown on PDFs, share pages, and app header</Text>
//                         </Card>
//                     </Col>
//                 </Row>
//             </Form>
//             <FooterNav loading={saving} onNext={submit} showBack={false} />
//         </Card>
//     );
// };

// // ---------- Step 2: Add First Watch (optional)
// const StepFirstWatch = ({ onSaved }) => {
//     const [form] = Form.useForm();
//     const [saving, setSaving] = useState(false);

//     const submit = async () => {
//         try {
//             setSaving(true);
//             const values = await form.validateFields();
//             // TODO: POST /api/inventory { ...values }
//             onSaved?.(values);
//             Toast.success("Watch saved to inventory");
//         } catch (e) {
//             // validation error
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <Card bordered={false}>
//             <SectionHeader
//                 title="Add Your First Watch"
//                 subtitle="Optional — you can import later from WhatsApp listings or CSV."
//             />
//             <Form layout="vertical" form={form}>
//                 <Row gutter={16}>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Brand" name="brand" rules={[{ required: true, Toast: "Brand is required" }]}>
//                             <Input placeholder="Rolex" />
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Model" name="model">
//                             <Input placeholder="Submariner" />
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Reference No." name="refNo">
//                             <Input placeholder="124060" />
//                         </Form.Item>
//                     </Col>
//                 </Row>
//                 <Row gutter={16}>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Price Paid" name="pricePaid" rules={[{ required: true, Toast: "Enter a number" }]}>
//                             <Input type="number" placeholder="8000" />
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Price Listed" name="priceListed" rules={[{ required: true, Toast: "Enter a number" }]}>
//                             <Input type="number" placeholder="9400" />
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Status" name="status" initialValue="Available">
//                             <Select>
//                                 <Option value="Available">Available</Option>
//                                 <Option value="On Hold">On Hold</Option>
//                                 <Option value="Sold">Sold</Option>
//                             </Select>
//                         </Form.Item>
//                     </Col>
//                 </Row>
//             </Form>
//             <FooterNav
//                 loading={saving}
//                 onBack={() => onSaved?.({ __back: true })}
//                 onSkip={() => onSaved?.({ __skip: true })}
//                 onNext={submit}
//                 showSkip
//             />
//         </Card>
//     );
// };

// // ---------- Step 3: Connect WhatsApp Parser
// const StepWhatsApp = ({ onSaved }) => {
//     const [connecting, setConnecting] = useState(false);
//     const [showGuide, setShowGuide] = useState(false);

//     const connect = async () => {
//         setConnecting(true);
//         // TODO: Trigger backend to spawn a headless session and return QR
//         setTimeout(() => {
//             setConnecting(false);
//             Toast.success("WhatsApp connected (mock)");
//             onSaved?.({ whatsappConnected: true });
//         }, 800);
//     };

//     return (
//         <Card bordered={false}>
//             <SectionHeader
//                 title="Connect WhatsApp Parser"
//                 subtitle="Securely connect to read-only WhatsApp Web and parse dealer listings."
//             />
//             <Row gutter={24}>
//                 <Col xs={24} md={14}>
//                     <Card size="small" style={{ minHeight: 240 }}>
//                         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, border: "1px dashed #d9d9d9", borderRadius: 8 }}>
//                             <div style={{ textAlign: "center" }}>
//                                 <QrcodeOutlined style={{ fontSize: 42, marginBottom: 8 }} />
//                                 <Title level={5} style={{ margin: 0 }}>Scan the QR to link</Title>
//                                 <Text type="secondary">We’ll generate a fresh code when you click connect</Text>
//                             </div>
//                         </div>
//                         <Divider />
//                         <div style={{ display: "flex", justifyContent: "space-between" }}>
//                             <Button type="primary" icon={<QrcodeOutlined />} loading={connecting} onClick={connect}>Generate QR & Connect</Button>
//                             <Button onClick={() => setShowGuide(true)}>View Setup Guide</Button>
//                         </div>
//                     </Card>
//                 </Col>
//                 <Col xs={24} md={10}>
//                     <Card size="small" title="What we do" bordered>
//                         <Paragraph>
//                             • Parse 150+ dealer groups daily
//                             <br />• Extract brand, model, ref, price, seller, images
//                             <br />• De-duplicate, classify by country, and store securely
//                         </Paragraph>
//                         <Tag color="blue">Read-only</Tag> <Tag>Secure</Tag> <Tag color="green">Throttled</Tag>
//                     </Card>
//                 </Col>
//             </Row>

//             <Modal
//                 visible={showGuide}
//                 title="WhatsApp Setup Guide"
//                 footer={<Button onClick={() => setShowGuide(false)}>Close</Button>}
//                 onCancel={() => setShowGuide(false)}
//             >
//                 <Paragraph>
//                     1) Click <b>Generate QR & Connect</b><br />
//                     2) Open WhatsApp on your phone → Settings → Linked Devices<br />
//                     3) Scan QR code on this screen<br />
//                     4) Keep one browser instance active for best stability
//                 </Paragraph>
//             </Modal>

//             <FooterNav onBack={() => onSaved?.({ __back: true })} onNext={() => onSaved?.({ whatsappConnected: true })} nextLabel="Continue" />
//         </Card>
//     );
// };

// // ---------- Step 4: Invite Team Members
// const StepTeam = ({ team = [], onSaved }) => {
//     const [members, setMembers] = useState(team);
//     const [form] = Form.useForm();
//     const [adding, setAdding] = useState(false);

//     const add = async () => {
//         try {
//             setAdding(true);
//             const values = await form.validateFields();
//             // TODO: POST /api/team/invite { email, role }
//             setMembers((m) => [...m, { ...values, status: "invited" }]);
//             form.resetFields();
//             Toast.success("Invitation sent");
//         } finally {
//             setAdding(false);
//         }
//     };

//     return (
//         <Card bordered={false}>
//             <SectionHeader title="Invite Team Members" subtitle="Add agents now or later in Account → Team." />
//             <Row gutter={16}>
//                 <Col xs={24} md={12}>
//                     <Form layout="vertical" form={form}>
//                         <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", Toast: "Valid email required" }]}>
//                             <Input placeholder="agent@yourcompany.com" />
//                         </Form.Item>
//                         <Form.Item label="Role" name="role" initialValue="member">
//                             <Select>
//                                 <Option value="owner">Owner</Option>
//                                 <Option value="member">Member</Option>
//                                 <Option value="readonly">Read Only</Option>
//                             </Select>
//                         </Form.Item>
//                         <Button type="primary" icon={<UserAddOutlined />} loading={adding} onClick={add}>Invite</Button>
//                     </Form>
//                 </Col>
//                 <Col xs={24} md={12}>
//                     <Card size="small" title="Pending Invites">
//                         <List
//                             dataSource={members}
//                             locale={{ emptyText: "No invites yet" }}
//                             renderItem={(m, idx) => (
//                                 <List.Item actions={[<Tooltip key="resend" title="Resend invite"><Button size="small">Resend</Button></Tooltip>]}>
//                                     <List.Item.Meta
//                                         avatar={<Avatar>{m.email?.[0]?.toUpperCase() || "U"}</Avatar>}
//                                         title={<span>{m.email} <Tag color="gold">{m.role}</Tag></span>}
//                                         description={<Text type="secondary">Status: {m.status || "invited"}</Text>}
//                                     />
//                                 </List.Item>
//                             )}
//                         />
//                     </Card>
//                 </Col>
//             </Row>
//             <FooterNav onBack={() => onSaved?.({ __back: true })} onNext={() => onSaved?.(members)} />
//         </Card>
//     );
// };

// // ---------- Step 5: Alert Preferences
// const StepAlerts = ({ initial, onSaved }) => {
//     const [form] = Form.useForm();
//     const [saving, setSaving] = useState(false);

//     const submit = async () => {
//         try {
//             setSaving(true);
//             const values = await form.validateFields();
//             // TODO: POST /api/alerts/prefs
//             onSaved?.(values);
//             Toast.success("Alert preferences saved");
//         } catch (e) {
//             // validation error
//         } finally {
//             setSaving(false);
//         }
//     };

//     return (
//         <Card bordered={false}>
//             <SectionHeader title="Set Alert Preferences" subtitle="Get notified when matching listings appear across dealer groups." />
//             <Form layout="vertical" form={form} initialValues={initial || { frequency: "realtime", countries: ["UK"], brands: ["Rolex"] }}>
//                 <Row gutter={16}>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Brands" name="brands" rules={[{ required: true, Toast: "Select at least one" }]}>
//                             <Select mode="tags" placeholder="Type and press enter">
//                                 {['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier'].map((b) => <Option key={b}>{b}</Option>)}
//                             </Select>
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Countries" name="countries">
//                             <Select mode="multiple" placeholder="Filter by country">
//                                 {['UK', 'UAE', 'HK', 'USA', 'EU'].map((c) => <Option key={c}>{c}</Option>)}
//                             </Select>
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={8}>
//                         <Form.Item label="Frequency" name="frequency">
//                             <Select>
//                                 <Option value="realtime">Real-time</Option>
//                                 <Option value="hourly">Hourly digest</Option>
//                                 <Option value="daily">Daily email</Option>
//                             </Select>
//                         </Form.Item>
//                     </Col>
//                 </Row>
//                 <Row gutter={16}>
//                     <Col xs={24} md={12}>
//                         <Form.Item name="underpricedOnly" valuePropName="checked">
//                             <Checkbox>Only show likely-underpriced items</Checkbox>
//                         </Form.Item>
//                     </Col>
//                     <Col xs={24} md={12}>
//                         <Form.Item name="includeImages" valuePropName="checked" initialValue>
//                             <Checkbox>Require images in alerts</Checkbox>
//                         </Form.Item>
//                     </Col>
//                 </Row>
//             </Form>
//             <FooterNav loading={saving} onBack={() => onSaved?.({ __back: true })} onNext={submit} nextLabel="Save & Finish" />
//         </Card>
//     );
// };

// // ---------- Step 6: Complete
// const StepComplete = ({ onGoDashboard }) => (
//     <Card bordered={false} style={{ textAlign: "center", padding: 32 }}>
//         <Avatar size={72} style={{ background: "#52c41a" }} icon={<UploadOutlined />} />
//         <Title level={3} style={{ marginTop: 16 }}>You're all set!</Title>
//         <Paragraph type="secondary">Your account is ready. You can tweak settings anytime in Account → Settings.</Paragraph>
//         <div style={{ marginTop: 8 }}>
//             <Button type="primary" size="large" onClick={onGoDashboard}>Go to Dashboard</Button>
//         </div>
//     </Card>
// );

// // ---------- Main Wizard
// export default function Onboarding() {
//     const [current, setCurrent] = useState(0);
//     const [snapshot, setSnapshot] = useState({});

//     const steps = useMemo(() => [
//         { title: "Company", description: "Logo & name" },
//         { title: "First Watch", description: "Optional" },
//         { title: "WhatsApp", description: "Parser link" },
//         { title: "Team", description: "Invite agents" },
//         { title: "Alerts", description: "Preferences" },
//         { title: "Done", description: "Finish" },
//     ], []);

//     const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
//     const prev = () => setCurrent((c) => Math.max(c - 1, 0));

//     const mergeAndNext = (data) => {
//         if (data?.__back) return prev();
//         if (data?.__skip) return next();
//         setSnapshot((s) => ({ ...s, ...data }));
//         next();
//     };

//     return (
//         <Layout style={{ minHeight: "100vh" }}>
//             <Header style={{ background: "#0b1220", padding: "0 24px" }}>
//                 <div style={{ display: "flex", alignItems: "center", height: 64 }}>
//                     <Avatar shape="square" size={32} style={{ marginRight: 12 }}>WD</Avatar>
//                     <Title level={4} style={{ color: "#fff", margin: 0 }}>Onboarding</Title>
//                 </div>
//             </Header>
//             <Content style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
//                 <Card bordered={false} style={{ marginBottom: 16 }}>
//                     <Steps current={current} size="small">
//                         {steps.map((s) => (
//                             <Step key={s.title} title={s.title} description={s.description} />
//                         ))}
//                     </Steps>
//                 </Card>

//                 {current === 0 && (
//                     <StepCompanyLogo initial={{ name: snapshot.name, logoUrl: snapshot.logoUrl }} onSaved={mergeAndNext} />
//                 )}
//                 {current === 1 && <StepFirstWatch onSaved={mergeAndNext} />}
//                 {current === 2 && <StepWhatsApp onSaved={mergeAndNext} />}
//                 {current === 3 && <StepTeam team={snapshot.team} onSaved={mergeAndNext} />}
//                 {current === 4 && <StepAlerts initial={snapshot.alerts} onSaved={(vals) => mergeAndNext({ alerts: vals })} />}
//                 {current === 5 && <StepComplete onGoDashboard={() => Toast.info("Route to /dashboard")} />}

//                 <Card size="small" style={{ marginTop: 24 }}>
//                     <Text type="secondary">Preview snapshot (debug): </Text>
//                     <pre style={{ marginTop: 8, background: "#0b122005", padding: 12, borderRadius: 8, maxHeight: 220, overflow: "auto" }}>
//                         {JSON.stringify(snapshot, null, 2)}
//                     </pre>
//                 </Card>
//             </Content>
//         </Layout>
//     );
// }

import React, { useMemo, useState } from "react";
import {
    Steps,
    Card,
    Form,
    Input,
    InputNumber,
    Upload,
    Button,
    Row,
    Col,
    Select,
    Switch,
    Tag,
    Alert,
    Modal,
    Result,
    Checkbox,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { Toast } from "../../components/Alerts/CustomToast";

/** AntD v4-safe Steps API */
const { Step } = Steps;
const { Dragger } = Upload;
const { Option } = Select;

const currencies = ["GBP", "USD", "AED", "HKD", "EUR"];

export default function Onboarding() {
    const [current, setCurrent] = useState(0);

    // simple state mirrors; integrate with your store as needed
    const [companyLogoFile, setCompanyLogoFile] = useState(null);
    const [logoUploading, setLogoUploading] = useState(false);

    const [watchForm] = Form.useForm();
    const [teamForm] = Form.useForm();
    const [alertsForm] = Form.useForm();

    const [waConnected, setWaConnected] = useState(false);
    const [showLaterInfo, setShowLaterInfo] = useState(false);

    const steps = useMemo(
        () => [
            { key: "logo", title: "Company Logo", optional: false },
            { key: "firstWatch", title: "First Watch (optional)", optional: true },
            { key: "whatsapp", title: "Connect WhatsApp", optional: false }, // can defer
            { key: "team", title: "Invite Team (optional)", optional: true },
            { key: "alerts", title: "Alert Preferences", optional: false },
            { key: "done", title: "Complete", optional: false },
        ],
        []
    );

    const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
    const prev = () => setCurrent((c) => Math.max(c - 1, 0));

    // --- API hooks (replace with your real calls) ---
    const saveLogo = async () => {
        if (!companyLogoFile) {
            Toast.info("You can upload later in Account → Company Profile.");
            return true;
        }
        try {
            setLogoUploading(true);
            // TODO: upload to /api/account/logo (FormData)
            await new Promise((r) => setTimeout(r, 600));
            Toast.success("Logo saved");
            return true;
        } catch (e) {
            Toast.error("Failed to upload logo");
            return false;
        } finally {
            setLogoUploading(false);
        }
    };

    const saveFirstWatch = async (values) => {
        try {
            // TODO: POST /api/inventory
            await new Promise((r) => setTimeout(r, 500));
            Toast.success("Watch saved to inventory");
            return true;
        } catch (e) {
            Toast.error("Could not save watch");
            return false;
        }
    };

    const verifyWhatsApp = async () => {
        // TODO: ping /api/whatsapp/status
        await new Promise((r) => setTimeout(r, 700));
        setWaConnected(true);
        Toast.success("WhatsApp connected");
    };

    const saveTeam = async (values) => {
        try {
            // TODO: POST /api/team/invite { emails: [...] }
            await new Promise((r) => setTimeout(r, 600));
            Toast.success("Invites sent");
            return true;
        } catch (e) {
            Toast.error("Failed to send invites");
            return false;
        }
    };

    const saveAlerts = async (values) => {
        try {
            // TODO: POST /api/alerts/prefs
            await new Promise((r) => setTimeout(r, 600));
            Toast.success("Alert preferences saved");
            return true;
        } catch (e) {
            Toast.error("Could not save preferences");
            return false;
        }
    };
    // --- End API hooks ---

    const onNextClick = async () => {
        const key = steps[current].key;

        if (key === "logo") {
            const ok = await saveLogo();
            if (ok) next();
            return;
        }

        if (key === "firstWatch") {
            // optional; save only if form touched & valid
            const touched = watchForm.isFieldsTouched();
            if (touched) {
                try {
                    const vals = await watchForm.validateFields();
                    const ok = await saveFirstWatch(vals);
                    if (ok) next();
                } catch {
                    // validation error—stay here
                }
            } else {
                next(); // skipped without saving
            }
            return;
        }

        if (key === "whatsapp") {
            if (!waConnected) {
                Modal.confirm({
                    title: "Connect later?",
                    content:
                        "You can still use the dashboard, but WhatsApp Search & Alerts will be disabled until you connect.",
                    okText: "Connect later",
                    cancelText: "Stay here",
                    onOk: () => {
                        setShowLaterInfo(true);
                        next();
                    },
                });
            } else {
                next();
            }
            return;
        }

        if (key === "team") {
            // optional
            const touched = teamForm.isFieldsTouched();
            if (touched) {
                try {
                    const vals = await teamForm.validateFields();
                    const ok = await saveTeam(vals);
                    if (ok) next();
                } catch {
                    // stay
                }
            } else {
                next();
            }
            return;
        }

        if (key === "alerts") {
            try {
                const vals = await alertsForm.validateFields();
                const ok = await saveAlerts(vals);
                if (ok) next();
            } catch {
                // stay
            }
            return;
        }

        if (key === "done") {
            // final
        }
    };

    const onSkipClick = () => {
        // only displayed for optional steps
        next();
    };

    // ---- Step UIs ----
    const StepLogo = (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
                <Card title="Upload your company logo" bordered>
                    <Dragger
                        name="file"
                        multiple={false}
                        beforeUpload={(file) => {
                            setCompanyLogoFile(file);
                            return false; // prevent auto upload
                        }}
                        onRemove={() => setCompanyLogoFile(null)}
                        fileList={companyLogoFile ? [companyLogoFile] : []}
                        accept="image/*"
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Drag & drop your logo here</p>
                        <p className="ant-upload-hint">PNG or SVG recommended. Max 2MB.</p>
                    </Dragger>

                    <Alert
                        style={{ marginTop: 16 }}
                        Toast="Tip"
                        description="You can change your logo anytime in Account → Company Profile."
                        type="info"
                        showIcon
                    />
                </Card>
            </Col>

            <Col xs={24} md={12}>
                <Card title="Preview" bordered>
                    <div
                        style={{
                            height: 180,
                            border: "1px dashed #d9d9d9",
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {companyLogoFile ? (
                            <img
                                alt="logo-preview"
                                src={URL.createObjectURL(companyLogoFile)}
                                style={{ maxHeight: 140, maxWidth: "100%" }}
                            />
                        ) : (
                            <span style={{ color: "#999" }}>No logo uploaded</span>
                        )}
                    </div>
                </Card>
            </Col>
        </Row>
    );

    const StepFirstWatch = (
        <Card
            title={
                <span>
                    Add your first watch <Tag color="blue">Optional</Tag>
                </span>
            }
            extra={<a href="/support/docs#inventory">Need help?</a>}
        >
            <Form
                form={watchForm}
                layout="vertical"
                initialValues={{ currency: "GBP", visibility: "private", status: "Available" }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="brand" label="Brand">
                            <Input placeholder="e.g., Rolex" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="model" label="Model">
                            <Input placeholder="Submariner" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="refNo" label="Reference No.">
                            <Input placeholder="124060" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="year" label="Year">
                            <Input placeholder="2022" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="condition" label="Condition">
                            <Select placeholder="Select condition">
                                <Option value="New">New</Option>
                                <Option value="Like New">Like New</Option>
                                <Option value="Good">Good</Option>
                                <Option value="Fair">Fair</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="currency" label="Currency">
                            <Select>
                                {currencies.map((c) => (
                                    <Option key={c} value={c}>
                                        {c}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="pricePaid" label="Price Paid">
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="priceListed" label="Price Listed">
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="visibility" label="Visibility">
                            <Select>
                                <Option value="private">Private</Option>
                                <Option value="shared">Shared with dealers</Option>
                                <Option value="public">Public trade pool</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Alert
                    type="info"
                    showIcon
                    Toast="Optional step"
                    description="You can import watches later or add them from Inventory."
                />
            </Form>
        </Card>
    );

    const StepWhatsApp = (
        <Row gutter={[24, 24]}>
            <Col xs={24} md={14}>
                <Card title="Connect WhatsApp Parser" bordered>
                    <ol style={{ paddingLeft: 18, marginBottom: 16 }}>
                        <li>Open WhatsApp Web on this device.</li>
                        <li>Scan the QR code with your phone to link.</li>
                        <li>
                            Keep one session active; our parser will safely read group Toasts you’ve joined.
                        </li>
                    </ol>
                    <div style={{ marginBottom: 12 }}>
                        Status:&nbsp;
                        {waConnected ? <Tag color="green">Connected</Tag> : <Tag>Not connected</Tag>}
                    </div>

                    {!waConnected && (
                        <Alert
                            style={{ marginBottom: 16 }}
                            type="warning"
                            showIcon
                            Toast="Not connected"
                            description="You can continue without connecting now. WhatsApp Search & Alerts will be disabled until you connect."
                        />
                    )}

                    <Button type="primary" onClick={verifyWhatsApp} disabled={waConnected}>
                        {waConnected ? "Connected" : "Verify Connection"}
                    </Button>

                    <Button
                        style={{ marginLeft: 8 }}
                        onClick={() => {
                            setShowLaterInfo(true);
                            Toast.info("You can connect anytime in Account → WhatsApp Setup.");
                        }}
                    >
                        Do it later
                    </Button>
                </Card>
            </Col>
            <Col xs={24} md={10}>
                <Card title="Why connect?" bordered>
                    <p style={{ marginBottom: 8 }}>• Parse 150+ groups you’re in</p>
                    <p style={{ marginBottom: 8 }}>• De-duplicate listings, enrich with country</p>
                    <p style={{ marginBottom: 8 }}>• Search & set alerts by brand/model/ref/price</p>
                    {showLaterInfo && (
                        <Alert
                            type="info"
                            showIcon
                            Toast="You chose to connect later"
                            description="Find this in Account → WhatsApp Setup when you’re ready."
                        />
                    )}
                </Card>
            </Col>
        </Row>
    );

    const StepTeam = (
        <Card
            title={
                <span>
                    Invite your team <Tag color="blue">Optional</Tag>
                </span>
            }
            extra={<a href="/support/docs#team">Help</a>}
        >
            <Form
                form={teamForm}
                layout="vertical"
                initialValues={{ emails: ["agent@example.com"] }}
            >
                <Form.List name="emails">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map((field) => (
                                <Row gutter={12} key={field.key} style={{ marginBottom: 8 }}>
                                    <Col flex="auto">
                                        <Form.Item
                                            {...field}
                                            name={field.name}
                                            fieldKey={field.fieldKey}
                                            rules={[
                                                { type: "email", Toast: "Enter a valid email" },
                                            ]}
                                        >
                                            <Input placeholder="agent@company.com" />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Button danger onClick={() => remove(field.name)}>
                                            Remove
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                            <Button onClick={() => add()}>+ Add another</Button>
                        </>
                    )}
                </Form.List>
                <Alert
                    style={{ marginTop: 12 }}
                    type="info"
                    showIcon
                    Toast="Optional step"
                    description="You can invite agents later from Account → Team Members."
                />
            </Form>
        </Card>
    );

    const StepAlerts = (
        <Card title="Alert Preferences" extra={<a href="/support/docs#alerts">Help</a>}>
            <Form
                form={alertsForm}
                layout="vertical"
                initialValues={{
                    dailyDigest: true,
                    pushInApp: true,
                    minPrice: 0,
                    brands: [],
                }}
            >
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="brands" label="Brands to track">
                            <Select
                                mode="tags"
                                placeholder="Type brands (e.g., Rolex, AP, Patek)"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="minPrice" label="Min price (optional)">
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="maxPrice" label="Max price (optional)">
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="dailyDigest"
                            valuePropName="checked"
                            label="Daily email digest"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="pushInApp"
                            valuePropName="checked"
                            label="In‑app notifications"
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item name="onlyConnected" valuePropName="checked">
                            <Checkbox>Only alert if WhatsApp connected</Checkbox>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );

    const StepDone = (
        <Result
            status="success"
            title="You're all set!"
            subTitle={
                waConnected
                    ? "WhatsApp is connected. You can start searching listings and receive alerts."
                    : "You can start using the dashboard. Connect WhatsApp later to enable Search & Alerts."
            }
            extra={[
                <Button type="primary" key="dash" href="/dashboard">
                    Go to Dashboard
                </Button>,
                <Button key="settings" href="/account/profile">
                    Account Settings
                </Button>,
            ]}
        />
    );

    const renderContent = () => {
        const key = steps[current].key;
        switch (key) {
            case "logo":
                return StepLogo;
            case "firstWatch":
                return StepFirstWatch;
            case "whatsapp":
                return StepWhatsApp;
            case "team":
                return StepTeam;
            case "alerts":
                return StepAlerts;
            case "done":
                return StepDone;
            default:
                return null;
        }
    };

    const isOptional = steps[current].optional;

    return (
        <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
            <Card style={{ marginBottom: 16, borderRadius: 12 }}>
                <Steps current={current}>
                    {steps.map((s) => (
                        <Step
                            key={s.key}
                            title={s.title}
                            description={s.optional ? "Optional" : undefined}
                        />
                    ))}
                </Steps>
            </Card>

            <div>{renderContent()}</div>

            <Card
                style={{
                    marginTop: 16,
                    borderRadius: 12,
                    position: "sticky",
                    bottom: 0,
                    zIndex: 10,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        {current > 0 && current < steps.length && (
                            <Button onClick={prev}>Back</Button>
                        )}
                    </div>

                    <div>
                        {isOptional && current < steps.length - 1 && (
                            <Button style={{ marginRight: 8 }} onClick={onSkipClick}>
                                Skip
                            </Button>
                        )}

                        {current < steps.length - 1 && (
                            <Button
                                type="primary"
                                onClick={onNextClick}
                                loading={logoUploading}
                            >
                                Save & Continue
                            </Button>
                        )}

                        {current === steps.length - 1 && (
                            <Button type="primary" href="/dashboard">
                                Go to Dashboard
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
