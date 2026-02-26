import React from 'react';

interface RatingProps {
  value: number; // The average rating (e.g., 4.5)
  text?: string; // The number of reviews (e.g., "12 reviews")
}

const Rating: React.FC<RatingProps> = ({ value, text }) => {
  return (
    <div className="d-flex align-items-center">
      {/* Loop through 1 to 5 to render the correct star icon */}
      {[1, 2, 3, 4, 5].map((index) => (
        <i
          key={index}
          className={
            value >= index
              ? 'bi bi-star-fill text-warning' // Full star
              : value >= index - 0.5
              ? 'bi bi-star-half text-warning' // Half star
              : 'bi bi-star text-warning'      // Empty star
          }
          style={{ fontSize: '1.1rem', marginRight: '2px' }}
        ></i>
      ))}
      {/* Only display the text if it was passed in as a prop */}
      {text && <span className="ms-2 small text-muted">{text}</span>}
    </div>
  );
};

export default Rating;