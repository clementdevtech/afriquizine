import React, { useEffect, useState, useCallback } from 'react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [message, setMessage] = useState('');
  const API_URL = process.env.REACT_APP_API_URL;


  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError(null); 
    try {
      const response = await fetch(`${API_URL}/testimonials/gettestimonials?offset=${offset}`);
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setTestimonials((prevTestimonials) => [...prevTestimonials, ...data]);
        setHasMore(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, [API_URL, offset]);

  // Handle submitting a testimonial
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/testimonials/addtestimonial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const newTestimonial = await response.json();
        setTestimonials((prevTestimonials) => [newTestimonial, ...prevTestimonials]);
        setMessage('');
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit testimonial');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setError('An error occurred while submitting your review');
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]); // Fix useEffect dependency issue

  const handleNext = () => {
    setOffset((prevOffset) => prevOffset + 3); 
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Testimonials</h2>

      {loading && <p className="text-center">Loading testimonials...</p>}
      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && testimonials.length === 0 && !error && (
        <p className="text-center text-muted">No testimonials available.</p>
      )}

      <div className="row">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="col-md-4 mb-4">
            <div className="card p-3 shadow">
              <p className="text-muted">"{testimonial.message}"</p>
              <h5 className="text-end">- {testimonial.name}</h5>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="text-center">
          <button onClick={handleNext} className="btn btn-primary">
            Next
          </button>
        </div>
      )}

      <div className="mt-4">
        <h4>Submit Your Testimonial</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              className="form-control"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your testimonial here..."
            />
          </div>
          <button type="submit" className="btn btn-primary mt-3">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Testimonials;
