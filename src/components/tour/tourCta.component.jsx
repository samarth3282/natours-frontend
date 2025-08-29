import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { processPayment, getPaymentMethodInfo } from '../../api/payment';
import { SERVER_BASE_URL } from '../../constants/serverConstants';
import User from '../../context/userContext';

const TourCta = ({ tourImages, tourId }) => {
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  const { isUserLoggedIn } = User();

  useEffect(() => {
    setPaymentInfo(getPaymentMethodInfo());
  }, []);

  const buyTour = async e => {
    setCreatingCheckout(true);
    const tourId = e.target.dataset.tourId;

    const success = await processPayment(tourId);

    setCreatingCheckout(false);
    // Note: For Razorpay and demo mode, the success handling is done within the payment functions
  };

  return (
    <section className='section-cta'>
      <div className='cta'>
        <div className='cta__img cta__img--logo'>
          <img src={`${SERVER_BASE_URL}/img/logo-white.png`} alt='Natours logo' />
        </div>
        <img
          className='cta__img cta__img--1'
          src={`${SERVER_BASE_URL}/img/tours/${tourImages[0]}`}
          alt='Tour picture'
        />
        <img
          className='cta__img cta__img--2'
          src={`${SERVER_BASE_URL}/img/tours/${tourImages[1]}`}
          alt='Tour picture'
        />
        <div className='cta__content'>
          <h2 className='heading-secondary'>What are you waiting for?</h2>
          <p className='cta__text'>10 days. 1 adventure. Infinite memories. Make it yours today!</p>
          {paymentInfo && paymentInfo.demoMode && (
            <p className='cta__demo-notice' style={{ color: '#f39c12', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Demo Mode: No payment required - booking for testing purposes only
            </p>
          )}
          {paymentInfo && paymentInfo.current !== 'stripe' && (
            <p className='cta__payment-info' style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Payment via {paymentInfo.info.name} - {paymentInfo.info.description}
            </p>
          )}
          {isUserLoggedIn === true ? (
            <button
              className='btn btn--green span-all-rows'
              data-tour-id={tourId}
              onClick={buyTour}>
              {creatingCheckout === true ? 'Processing...' : 'Book tour now!'}
            </button>
          ) : (
            <Link className='btn btn--green span-all-rows' to='/login'>
              Log in to book tour
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default TourCta;
