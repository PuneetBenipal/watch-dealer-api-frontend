import React from 'react';
import banner1 from '../../assets/img/dashboard/banner1.jpg';
import banner2 from '../../assets/img/dashboard/banner2.jpg';
import banner3 from '../../assets/img/dashboard/banner3.jpg';
import banner4 from '../../assets/img/dashboard/banner4.jpg';
import image1 from '../../assets/img/dashboard/image1.jpg';
import image2 from '../../assets/img/dashboard/image2.jpg';
import image3 from '../../assets/img/dashboard/image3.jpg';
// import "../../assets/css/dashboard.css";
import Footer from '../../components/layout/Footer';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import "./dashboard.css"

const slides = [
    {
        image: banner1,
        title: "Gertious",
        subtitle: "Exclusive of Sales Tax",
        description: "Dress watch style. Swiss made luxury watch with stainless steel case and brown leather strap. Scratch resistant sapphire crystal.",
        price: "$250.00",
        oldPrice: "$320.00",
    },
    {
        image: banner2,
        title: "SonicBeats Pro",
        subtitle: "Free Shipping Worldwide",
        description: "Experience music like never before with noise-cancelling wireless headphones. 40-hour battery life and premium comfort.",
        price: "$120.00",
        oldPrice: "$180.00",
    },
    {
        image: banner3,
        title: "Urban Runner",
        subtitle: "Limited Edition",
        description: "Lightweight, breathable sneakers designed for city life. Modern style meets all-day comfort. Multiple color options.",
        price: "$89.99",
        oldPrice: "$120.00",
    },
    {
        image: banner4,
        title: "Urban Runner",
        subtitle: "Limited Edition",
        description: "Lightweight, breathable sneakers designed for city life. Modern style meets all-day comfort. Multiple color options.",
        price: "$89.99",
        oldPrice: "$120.00",
    }
];

const flashSales = [
    {
        title: "Men's Watch",
        subtitle: "Flash Sale",
        discount: "25% OFF",
        bg: image1
    },
    {
        title: "Women's Watch",
        subtitle: "Flash Sale",
        discount: "40% OFF",
        bg: image2
    },
    {
        title: "Couple's Watch",
        subtitle: "Flash Sale",
        discount: "30% OFF",
        bg: image3
    }
];

const popularProducts = [
    {
        image: image1,
        title: "Agelocer Couple Watches for Men Women Square Quartz Watches Genuine Leather Band Waterproof Watches 3301–3401",
        price: "$1,744.40",
        note: "Ex of Sale Tax"
    },
    {
        image: image2,
        title: "Bestdon Couple Watch For Lovers Minimalist personalized Trending Japanese Quartz Wristwatch Math Unisex Valentine's Day Present",
        price: "$102.18",
        note: "Ex of Sale Tax"
    },
    {
        image: image3,
        title: "ORIENT Fashion White Couple Watches, A Pair Of Korean Version Of The Trend Of Steel Belt Lovers Watch Men Watch Waterproof Watch",
        price: "$1,438.00",
        note: "Ex of Sale Tax"
    },
    {
        image: image2,
        title: "Fantor Top Brand Fashion Luxury Couple Watches Pair Quartz Chronograph Waterproof Watch for Lovers Man Woman Gift Set with Box",
        price: "$121.90",
        note: "Ex of Sale Tax"
    },
    {
        image: image2,
        title: "Fantor Top Brand Fashion Luxury Couple Watches Pair Quartz Chronograph Waterproof Watch for Lovers Man Woman Gift Set with Box",
        price: "$121.90",
        note: "Ex of Sale Tax"
    },
    // Add more products as needed
];

const Dashboard = () => (
    <>
        <section className="product-slider-section">
            <Swiper
                spaceBetween={0}
                slidesPerView={1}
                navigation={true}
                loop={true}
                className="swiper-container"
                modules={[Navigation, Autoplay]}
                autoplay={{ delay: 25000, disableOnInteraction: false }}
            >
                {slides.map((slide, idx) => (
                    <SwiperSlide key={idx}>
                        <div
                            className="product-slide-bg"
                            style={{ backgroundImage: `url(${slide.image})` }}
                        >
                            <div className="product-slide-overlay" />
                            <div className="product-slide-content">
                                <h1>{slide.title}</h1>
                                <div className="divider" />
                                <div className="subtitle">{slide.subtitle}</div>
                                <p>{slide.description}</p>
                                <div className="price-section">
                                    <span className="price">{slide.price}</span>
                                    <span className="old-price">{slide.oldPrice}</span>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>

        {/* FLASH SALES */}
        <section className="flash-sales-section">
            <div className="flash-sales-container">
                {flashSales.map((item, idx) => (
                    <div
                        key={idx}
                        className="flash-sale-card"
                        style={{ backgroundImage: `url(${item.bg})` }}
                    >
                        <div className="flash-sale-overlay" />
                        <div className="flash-sale-content">
                            <div className="flash-sale-subtitle">{item.subtitle}</div>
                            <div className="flash-sale-title">{item.title}</div>
                            <div className="flash-sale-discount">{item.discount}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section className="popular-section">
            <div className="popular-title">
                Popular In Store
                <div className="popular-underline" />
            </div>
            <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={30}
                slidesPerView={4}
                className="popular-swiper"
                style={{ padding: "30px 0", maxWidth: "1200px", margin: "0 auto" }}
                breakpoints={{
                    1200: { slidesPerView: 4 },
                    900: { slidesPerView: 3 },
                    600: { slidesPerView: 2 },
                    0: { slidesPerView: 1 }
                }}
            >
                {popularProducts.map((product, idx) => (
                    <SwiperSlide key={idx}>
                        <div className="popular-card">
                            <img src={product.image} alt={product.title} className="popular-img" />
                            <div className="popular-card-title">{product.title}</div>
                            <div className="popular-card-price">{product.price}</div>
                            <div className="popular-card-note">{product.note}</div>
                            <button className="popular-cart-btn">
                                <span role="img" aria-label="cart">🛒</span> GO TO PAGE
                            </button>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>

        <Footer />
    </>
);

export default Dashboard;
