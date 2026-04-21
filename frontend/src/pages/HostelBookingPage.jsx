import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createBooking, fetchHostelById } from '../services/hostelApi';
import './HostelBookingPage.css';

function HostelBookingPage() {
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingHostel, setIsLoadingHostel] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [hostelError, setHostelError] = useState('');
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    fullName: false,
    email: false,
    phone: false,
    campusId: false,
    moveInDate: false,
    durationMonths: false,
    bedsRequested: false
  });
  const [bookingForm, setBookingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    campusId: '',
    moveInDate: '',
    durationMonths: '6',
    bedsRequested: '1'
  });

  useEffect(() => {
    const loadHostel = async () => {
      try {
        setIsLoadingHostel(true);
        setHostelError('');
        const response = await fetchHostelById(hostelId);
        setSelectedHostel(response);
      } catch (error) {
        setHostelError(error?.response?.data?.error || 'Could not load selected hostel from backend.');
      } finally {
        setIsLoadingHostel(false);
      }
    };

    loadHostel();
  }, [hostelId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const errors = {
    fullName: (() => {
      const trimmed = bookingForm.fullName.trim();
      if (!trimmed) return 'Full name is required.';
      if (trimmed.length < 3) return 'Full name must be at least 3 characters.';
      if (!/^[A-Za-z ]+$/.test(trimmed)) return 'Full name can only contain letters and spaces.';
      return '';
    })(),
    email: (() => {
      const trimmed = bookingForm.email.trim();
      if (!trimmed) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
      return '';
    })(),
    phone: (() => {
      const digitsOnly = bookingForm.phone.replace(/\D/g, '');
      if (!digitsOnly) return 'Phone number is required.';
      if (!/^07\d{8}$/.test(digitsOnly)) return 'Phone number must be 10 digits and start with 07.';
      return '';
    })(),
    campusId: (() => {
      const trimmed = bookingForm.campusId.trim();
      if (!trimmed) return 'Campus ID is required.';
      if (trimmed.length < 3) return 'Campus ID must be at least 3 characters.';
      return '';
    })(),
    moveInDate: (() => {
      if (!bookingForm.moveInDate) return 'Move-in date is required.';
      const selectedDate = new Date(bookingForm.moveInDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) return 'Move-in date cannot be in the past.';
      return '';
    })(),
    durationMonths: (() => {
      if (!bookingForm.durationMonths) return 'Duration is required.';
      const months = Number(bookingForm.durationMonths);
      if (!Number.isInteger(months) || months < 1 || months > 12) return 'Duration must be a whole number between 1 and 12.';
      return '';
    })(),
    bedsRequested: (() => {
      if (!bookingForm.bedsRequested) return 'Please select number of beds.';
      const beds = Number(bookingForm.bedsRequested);
      if (!Number.isInteger(beds) || beds < 1) return 'Beds needed must be at least 1.';
      if (beds > Number(selectedHostel?.bedsAvailable || 0)) return 'Selected beds exceed currently available beds.';
      return '';
    })()
  };

  const isFormValid = Object.values(errors).every((error) => !error);

  if (isLoadingHostel) {
    return (
      <div className="booking-page-container">
        <div className="booking-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="skeleton skeleton-heading" style={{ margin: '1rem auto' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '80%', margin: '0 auto 0.5rem' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '70%', margin: '0 auto' }}></div>
          <p className="loading-text">Loading hostel details...</p>
        </div>
      </div>
    );
  }

  if (!selectedHostel || hostelError) {
    return (
      <div className="booking-page-container">
        <div className="booking-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="booking-header" style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e40af' }}>Hostel Not Found</span>
          </h1>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {hostelError || 'The hostel you selected is unavailable. Please return and choose another hostel.'}
          </p>
          <button
            onClick={() => navigate('/rooms')}
            className="submit-button submit-button-primary"
          >
            Back to Hostels
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    setSubmitError('');

    if (!isFormValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      await createBooking({
        hostelId: selectedHostel.id,
        fullName: bookingForm.fullName.trim(),
        email: bookingForm.email.trim(),
        phone: bookingForm.phone.trim(),
        campusId: bookingForm.campusId.trim(),
        moveInDate: bookingForm.moveInDate,
        durationMonths: Number(bookingForm.durationMonths),
        bedsRequested: Number(bookingForm.bedsRequested),
        roomNumber: selectedHostel.roomNumber || selectedHostel.id
      });

      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(error?.response?.data?.error || 'Booking submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setBookingForm((current) => ({ ...current, [field]: value }));
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const handleFieldBlur = (field) => {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  };

  const showError = (field) => (touchedFields[field] || hasAttemptedSubmit) && errors[field];

  return (
    <div className="booking-page-container">
      <div className="booking-page-grid">
        {/* Hostel Info Card */}
        <div className="booking-card">
          <div className="booking-header">
            <h1>Book Your Hostel</h1>
            <p>Complete your details to confirm your booking</p>
          </div>

          <div className="hostel-info-section">
            <div className="hostel-info-item">
              <span className="hostel-info-label">Selected Hostel</span>
              <p className="hostel-name">{selectedHostel.name}</p>
              <p className="hostel-location">{selectedHostel.location}</p>
            </div>

            <div className="hostel-details">
              <p>
                Monthly Rent:{' '}
                <span className="detail-value">LKR {selectedHostel.price.toLocaleString()}</span>
              </p>
              <p>
                Beds Available:{' '}
                <span className="detail-value">{selectedHostel.bedsAvailable}</span>
              </p>
              <p>
                Status: <span className="detail-value">{selectedHostel.status}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/rooms')}
            className="back-button"
          >
            ← Back to Search
          </button>
        </div>

        {/* Booking Form Card */}
        <div className="booking-card">
          {!isSubmitted ? (
            <form className="booking-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={bookingForm.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  onBlur={() => handleFieldBlur('fullName')}
                  className={`form-input ${showError('fullName') ? 'error' : ''}`}
                  placeholder="Enter your full name"
                />
                {showError('fullName') && (
                  <p className="error-message">{errors.fullName}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={bookingForm.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email')}
                  className={`form-input ${showError('email') ? 'error' : ''}`}
                  placeholder="your.email@example.com"
                />
                {showError('email') && (
                  <p className="error-message">{errors.email}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={bookingForm.phone}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  onBlur={() => handleFieldBlur('phone')}
                  className={`form-input ${showError('phone') ? 'error' : ''}`}
                  placeholder="0712345678"
                />
                {showError('phone') && (
                  <p className="error-message">{errors.phone}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="campusId" className="form-label">
                  Campus ID
                </label>
                <input
                  id="campusId"
                  type="text"
                  value={bookingForm.campusId}
                  onChange={(e) => handleFieldChange('campusId', e.target.value)}
                  onBlur={() => handleFieldBlur('campusId')}
                  className={`form-input ${showError('campusId') ? 'error' : ''}`}
                  placeholder="Your campus ID number"
                />
                {showError('campusId') && (
                  <p className="error-message">{errors.campusId}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="moveInDate" className="form-label">
                  Move-in Date
                </label>
                <input
                  id="moveInDate"
                  type="date"
                  value={bookingForm.moveInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleFieldChange('moveInDate', e.target.value)}
                  onBlur={() => handleFieldBlur('moveInDate')}
                  className={`form-input ${showError('moveInDate') ? 'error' : ''}`}
                />
                {showError('moveInDate') && (
                  <p className="error-message">{errors.moveInDate}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="durationMonths" className="form-label">
                  Duration (Months)
                </label>
                <input
                  id="durationMonths"
                  type="number"
                  min="1"
                  max="12"
                  step="1"
                  value={bookingForm.durationMonths}
                  onChange={(e) => handleFieldChange('durationMonths', e.target.value)}
                  onBlur={() => handleFieldBlur('durationMonths')}
                  className={`form-input ${showError('durationMonths') ? 'error' : ''}`}
                  placeholder="Enter duration in months"
                />
                {showError('durationMonths') && (
                  <p className="error-message">{errors.durationMonths}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="bedsRequested" className="form-label">
                  Beds Needed
                </label>
                <select
                  id="bedsRequested"
                  value={bookingForm.bedsRequested}
                  onChange={(e) => handleFieldChange('bedsRequested', e.target.value)}
                  onBlur={() => handleFieldBlur('bedsRequested')}
                  className={`form-select ${showError('bedsRequested') ? 'error' : ''}`}
                >
                  {Array.from({ length: Number(selectedHostel?.bedsAvailable || 0) }, (_, index) => {
                    const bedCount = String(index + 1);
                    return (
                      <option key={bedCount} value={bedCount}>
                        {bedCount} {bedCount === '1' ? 'Bed' : 'Beds'}
                      </option>
                    );
                  })}
                </select>
                {showError('bedsRequested') && (
                  <p className="error-message">{errors.bedsRequested}</p>
                )}
              </div>

              {submitError && (
                <div className="alert alert-error">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="submit-button submit-button-primary"
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </form>
          ) : (
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h2 className="success-title">Booking Confirmed</h2>
              <p className="success-message">
                Your request for <strong>{selectedHostel.name}</strong> has been submitted successfully. 
                We'll be in touch soon with confirmation details.
              </p>
              <button
                onClick={() => navigate('/rooms')}
                className="submit-button submit-button-primary"
              >
                Return to Hostels
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostelBookingPage;
