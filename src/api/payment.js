import { bookTour } from './stripe';
import { bookTourWithRazorpay, bookTourDemo } from './razorpay';
import { PAYMENT_CONFIG } from '../constants/serverConstants';
import { handleErrorAlert } from '../utils/alert';

export const processPayment = async (tourId) => {
    try {
        const paymentMethod = PAYMENT_CONFIG.getCurrentPaymentMethod();

        // If demo mode is enabled, always use demo
        if (PAYMENT_CONFIG.DEMO_MODE) {
            return await bookTourDemo(tourId);
        }

        switch (paymentMethod) {
            case 'stripe':
                // Use original Stripe implementation
                const sessionUrl = await bookTour(tourId);
                if (sessionUrl) {
                    window.open(sessionUrl, '_blank');
                    return true;
                }
                return false;

            case 'razorpay':
                // Use Razorpay for Indian users
                return await bookTourWithRazorpay(tourId);

            case 'demo':
            default:
                // Fallback to demo mode for unsupported regions
                return await bookTourDemo(tourId);
        }
    } catch (error) {
        handleErrorAlert('Payment processing failed. Please try again.');
        return false;
    }
};

export const getPaymentMethodInfo = () => {
    const paymentMethod = PAYMENT_CONFIG.getCurrentPaymentMethod();

    const info = {
        stripe: {
            name: 'Stripe',
            description: 'Secure international payments',
            supported: true,
        },
        razorpay: {
            name: 'Razorpay',
            description: 'Secure payments for India',
            supported: true,
        },
        demo: {
            name: 'Demo Mode',
            description: 'Demo booking (no payment required)',
            supported: true,
        },
    };

    return {
        current: paymentMethod,
        info: info[paymentMethod] || info.demo,
        demoMode: PAYMENT_CONFIG.DEMO_MODE,
    };
};
