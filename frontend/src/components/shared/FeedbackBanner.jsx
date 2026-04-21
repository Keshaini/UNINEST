import './FeedbackBanner.css';

const FeedbackBanner = ({ feedback }) => {
  if (!feedback?.message) {
    return null;
  }

  return <div className={feedback.type === 'error' ? 'feedback error' : 'feedback success'}>{feedback.message}</div>;
};

export default FeedbackBanner;
