import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Check, ChevronRight, ShoppingCart } from 'lucide-react';

const Customizer = () => {
    const [step, setStep] = useState(1);
    const [inventory, setInventory] = useState([]);
    const [selections, setSelections] = useState({
        base: null,
        sauce: null,
        cheese: null,
        veggie: []
    });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/inventory');
                setInventory(res.data);
            } catch (err) {
                console.error("Failed to fetch inventory", err);
            }
        };
        fetchInventory();

        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const categories = ['base', 'sauce', 'cheese', 'veggie'];
    const currentCategory = categories[step - 1];
    const options = inventory.filter(item => item.category === currentCategory);

    const toggleSelection = (item) => {
        if (currentCategory === 'veggie') {
            const exists = selections.veggie.find(v => v._id === item._id);
            if (exists) {
                setSelections({ ...selections, veggie: selections.veggie.filter(v => v._id !== item._id) });
            } else {
                setSelections({ ...selections, veggie: [...selections.veggie, item] });
            }
        } else {
            setSelections({ ...selections, [currentCategory]: item });
        }
    };

    const nextStep = () => step < 5 && setStep(step + 1);
    const prevStep = () => step > 1 && setStep(step - 1);

    const totalAmount = (selections.base?.price || 0) + 
                        (selections.sauce?.price || 0) + 
                        (selections.cheese?.price || 0) + 
                        selections.veggie.reduce((sum, v) => sum + v.price, 0);

    const handleCheckout = async () => {
        try {
            const items = [
                selections.base, 
                selections.sauce, 
                selections.cheese, 
                ...selections.veggie
            ].filter(Boolean);

            const res = await axios.post('http://localhost:5000/api/orders/create', {
                amount: totalAmount,
                items,
                userId: user.id
            });

            const { rzpOrder, orderId } = res.data;

            const options = {
                key: "rzp_test_SmN95RNSu8FQSQ",
                amount: rzpOrder.amount,
                currency: "INR",
                name: "PizzaHub",
                description: "Custom Pizza Order",
                order_id: rzpOrder.id,
                handler: async (response) => {
                    await axios.post('http://localhost:5000/api/orders/confirm', {
                        orderId,
                        razorpayPaymentId: response.razorpay_payment_id
                    });
                    alert('Order Placed Successfully!');
                    window.location.href = '/dashboard';
                },
                prefill: {
                    name: user.name,
                    email: user.email
                },
                theme: { color: "#f59e0b" }
            };

            if (!window.Razorpay) {
                alert('Razorpay SDK failed to load. Please check your internet connection.');
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert('Payment Failed: ' + response.error.description);
            });
            rzp.open();
        } catch (err) {
            alert('Checkout failed: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="customizer-page">
            <div className="customizer-container glass-card">
                <div className="steps-indicator">
                    {categories.map((cat, i) => (
                        <div key={cat} className={`step-dot ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                            <div className="dot-circle">
                                {step > i + 1 ? <Check size={16} /> : i + 1}
                            </div>
                            <span>{cat}</span>
                        </div>
                    ))}
                    <div key="review" className={`step-dot ${step === 5 ? 'active' : ''}`}>
                        <div className="dot-circle">5</div>
                        <span>Review</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="content-area"
                    >
                        {step <= 4 ? (
                            <>
                                <h2 className="step-title">Select your <span className="highlight">{currentCategory}</span></h2>
                                <div className="options-grid">
                                    {options.map(item => (
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={item._id} 
                                            className={`option-card ${
                                                currentCategory === 'veggie' 
                                                ? selections.veggie.find(v => v._id === item._id) ? 'selected' : ''
                                                : selections[currentCategory]?._id === item._id ? 'selected' : ''
                                            }`}
                                            onClick={() => toggleSelection(item)}
                                        >
                                            <div className="card-header">
                                                <h3>{item.name}</h3>
                                                <div className="price-tag">₹{item.price}</div>
                                            </div>
                                            {item.stock < 10 && <span className="low-stock-warning">Only {item.stock} units left!</span>}
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="review-section">
                                <h2 className="step-title">Review Your <span className="highlight">Masterpiece</span></h2>
                                <div className="review-details">
                                    <div className="review-item">
                                        <span>Base</span>
                                        <strong>{selections.base?.name}</strong>
                                    </div>
                                    <div className="review-item">
                                        <span>Sauce</span>
                                        <strong>{selections.sauce?.name}</strong>
                                    </div>
                                    <div className="review-item">
                                        <span>Cheese</span>
                                        <strong>{selections.cheese?.name}</strong>
                                    </div>
                                    <div className="review-item">
                                        <span>Vegetables</span>
                                        <div className="veggie-tags">
                                            {selections.veggie.length > 0 ? selections.veggie.map(v => (
                                                <span key={v._id} className="tag">{v.name}</span>
                                            )) : <strong>None</strong>}
                                        </div>
                                    </div>
                                </div>
                                <div className="total-summary">
                                    <div className="total-label">Total Amount</div>
                                    <div className="total-price">₹{totalAmount}</div>
                                </div>
                                <button onClick={handleCheckout} className="btn-primary btn-lg w-full checkout-btn">
                                    <ShoppingCart size={20} /> Complete Payment
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="nav-controls">
                    {step > 1 && (
                        <button onClick={prevStep} className="btn-secondary">
                            Back
                        </button>
                    )}
                    <div style={{ flex: 1 }} />
                    {step < 5 && (
                        <button 
                            onClick={nextStep} 
                            className="btn-primary"
                            disabled={step < 4 && !selections[currentCategory]}
                        >
                            {step === 4 ? 'Review Order' : 'Next Step'} <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .customizer-page { min-height: 90vh; padding: 2rem; display: flex; align-items: center; justify-content: center; }
                .customizer-container { width: 100%; max-width: 900px; padding: 3rem; }
                .steps-indicator { display: flex; justify-content: space-between; margin-bottom: 4rem; position: relative; }
                .steps-indicator::before { content: ''; position: absolute; top: 20px; left: 0; right: 0; height: 2px; background: var(--glass-border); z-index: 0; }
                .step-dot { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; position: relative; z-index: 1; min-width: 60px; }
                .dot-circle { width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 2px solid var(--glass-border); display: flex; align-items: center; justify-content: center; font-weight: 700; transition: all 0.3s; }
                .step-dot.active .dot-circle { border-color: var(--primary); color: var(--primary); box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
                .step-dot.done .dot-circle { background: var(--primary); border-color: var(--primary); color: black; }
                .step-dot span { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 600; }
                .step-dot.active span { color: var(--primary); }
                .step-title { font-size: 2rem; margin-bottom: 2.5rem; text-align: center; }
                .options-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
                .option-card { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 1.25rem; cursor: pointer; transition: all 0.3s; }
                .option-card:hover { border-color: var(--primary); background: rgba(255,255,255,0.05); }
                .option-card.selected { border-color: var(--primary); background: rgba(245, 158, 11, 0.08); }
                .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
                .price-tag { background: var(--primary); color: black; padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 700; }
                .low-stock-warning { color: var(--error); font-size: 0.7rem; display: block; margin-top: 1rem; font-weight: 600; }
                .review-section { max-width: 600px; margin: 0 auto; }
                .review-details { background: rgba(0,0,0,0.2); border-radius: 1rem; padding: 2rem; margin-bottom: 2rem; }
                .review-item { display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border); }
                .review-item:last-child { border-bottom: none; }
                .review-item span { color: var(--text-muted); }
                .tag { background: var(--surface); padding: 0.2rem 0.6rem; border-radius: 0.5rem; font-size: 0.8rem; margin-right: 0.4rem; }
                .total-summary { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding: 0 1rem; }
                .total-label { font-size: 1.25rem; color: var(--text-muted); }
                .total-price { font-size: 2.5rem; font-weight: 800; color: var(--primary); }
                .nav-controls { display: flex; margin-top: 4rem; }
                .checkout-btn { height: 3.5rem; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
            `}} />
        </div>
    );
};

export default Customizer;
