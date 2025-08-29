import axios from 'axios';
import { SERVER_BASE_URL } from '../constants/serverConstants';
import { handleErrorAlert, showAlert } from '../utils/alert';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const bookTourWithRazorpay = async (tourId) => {
    try {
        // Load Razorpay script
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
            throw new Error('Failed to load payment gateway. Please try again.');
        }

        const options = {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        };

        // Create order on backend
        const { data } = await axios.post(
            `${SERVER_BASE_URL}/api/v1/razorpay/create-order/${tourId}`,
            {}, // Empty body since tourId is in URL params
            options
        );

        if (data.status === 'success') {
            const { order, key } = data;

            const razorpayOptions = {
                key: key, // Razorpay Key ID
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                name: 'Natours',
                description: 'Book your adventure tour',
                image: `${SERVER_BASE_URL}/img/logo-green.png`,
                handler: async function (response) {
                    // Verify payment on backend
                    try {
                        const verifyResponse = await axios.post(
                            `${SERVER_BASE_URL}/api/v1/razorpay/verify-payment`,
                            {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                tourId: tourId,
                            },
                            options
                        );

                        if (verifyResponse.data.status === 'success') {
                            showAlert('success', 'Payment successful! Your booking has been confirmed.');
                            // Redirect to bookings page or refresh
                            setTimeout(() => {
                                window.location.href = '/my-bookings';
                            }, 2000);
                        }
                    } catch (err) {
                        handleErrorAlert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: localStorage.getItem('userName') || '',
                    email: localStorage.getItem('userEmail') || '',
                },
                theme: {
                    color: '#55c57a',
                },
                modal: {
                    ondismiss: function () {
                        console.log('Payment cancelled by user');
                    },
                },
            };

            const razorpay = new window.Razorpay(razorpayOptions);
            razorpay.open();

            return true;
        }

        throw new Error('Failed to create payment order');
    } catch (err) {
        handleErrorAlert(err);
        return false;
    }
};

// Fallback for demo purposes - simulate payment
export const bookTourDemo = async (tourId) => {
    try {
        const options = {
            headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
        };

        // Create a demo booking - using existing booking endpoint with demo flag
        const { data } = await axios.post(
            `${SERVER_BASE_URL}/api/v1/bookings`,
            {
                tour: tourId,
                demo: true
            },
            options
        );

        if (data.status === 'success') {
            showAlert('success', 'Demo booking created successfully! (No payment required)');
            setTimeout(() => {
                window.location.href = '/my-bookings';
            }, 2000);
            return true;
        }

        throw new Error('Failed to create demo booking');
    } catch (err) {
        handleErrorAlert(err);
        return false;
    }
};
