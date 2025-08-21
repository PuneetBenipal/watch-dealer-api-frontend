import API from '../../api';
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button } from 'antd';
import { BACKEND_URL } from '../../config';

export default function StripeCheckoutButton({
    priceId, icon, text, style
}) {

    const handleCheckout = async () => {
        const res = await API.post(`${BACKEND_URL}/api/stripe/create-checkout-session`, { plan: priceId });

        window.location.href = res.data.url;
    };

    return (
        <>
            <Button
                type="primary"
                size="large"
                icon={icon ? icon : <ShoppingCartOutlined />}
                onClick={handleCheckout}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    height: 'unset',
                    borderRadius: 4,
                    fontWeight: 'normal',
                    padding: "4px 8px",
                    fontSize: '14px',
                    ...style
                }}
            >
                {text}
            </Button>
            {/* <Button type='primary' style={{ borderRadius: '2px' }} icon={icon} onClick={handleCheckout}>{text}</Button> */}
        </>
    )
}
