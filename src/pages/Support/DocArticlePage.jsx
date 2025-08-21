import React, { useEffect, useState } from "react";
import { Typography, Skeleton } from "antd";
import { fetchDoc } from "../../api/support";
import ReactMarkdown from "react-markdown";
const { Title } = Typography;

export default function DocArticlePage({ slug }) {
    const [doc, setDoc] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchDoc(slug).then((r) => { setDoc(r.data); setLoading(false); });
    }, [slug]);

    if (loading) return <div className="p-6 max-w-4xl mx-auto"><Skeleton active /></div>;
    if (!doc) return <div className="p-6 max-w-4xl mx-auto">Not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto prose prose-invert">
            <Title level={2}>{doc.title}</Title>
            <ReactMarkdown>{doc.content}</ReactMarkdown>
        </div>
    );
}