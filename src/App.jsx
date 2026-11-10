
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000/api";

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    rating: 0,
    comments: ""
  });

  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    fiveStar: 0
  });

  const [message, setMessage] = useState("");

  async function loadFeedback() {
    try {
      const response = await fetch(`${API}/feedback`);
      if (!response.ok) throw new Error("Could not load feedback");

      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      setMessage("Cannot connect to backend. Start the server first.");
    }
  }

  async function loadStats() {
    try {
      const response = await fetch(`${API}/stats`);
      if (!response.ok) throw new Error("Could not load statistics");

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    loadFeedback();
    loadStats();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.rating === 0) {
      setMessage("Please select a star rating!");
      return;
    }

    try {
      const response = await fetch(`${API}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed");
      }

      setMessage("Thank you! Feedback submitted successfully.");

      setForm({
        name: "",
        email: "",
        category: "",
        rating: 0,
        comments: ""
      });

      await loadFeedback();
      await loadStats();

    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteFeedback(id) {
    if (!window.confirm("Delete this feedback?")) return;

    try {
      const response = await fetch(`${API}/feedback/${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setMessage("Feedback deleted successfully!");

      await loadFeedback();
      await loadStats();

    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div className="app">

      <header className="header">
        <h1>💜 Feedback System</h1>
        <p>Your opinion helps us improve our services!</p>
      </header>

      <main className="container">

        <section className="stats">

          <div className="stat-card">
            <h3>Total Feedback</h3>
            <h2>{stats.total}</h2>
          </div>

          <div className="stat-card">
            <h3>Average Rating</h3>
            <h2>{Number(stats.average || 0).toFixed(1)} ⭐</h2>
          </div>

          <div className="stat-card">
            <h3>Five Star Reviews</h3>
            <h2>{stats.fiveStar || 0}</h2>
          </div>

        </section>

        <section className="main-content">

          <div className="card">
            <h2>📝 Submit Feedback</h2>

            <form onSubmit={handleSubmit}>

              <label>Your Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

              <label>Feedback Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option>Website</option>
                <option>Service</option>
                <option>Product</option>
                <option>Support</option>
                <option>Other</option>
              </select>

              <label>Rate Your Experience</label>

              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={form.rating >= star ? "active" : ""}
                    onClick={() =>
                      setForm({ ...form, rating: star })
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <label>Your Comments</label>
              <textarea
                name="comments"
                value={form.comments}
                onChange={handleChange}
                placeholder="Write your feedback..."
                required
              />

              <button className="submit-btn" type="submit">
                Submit Feedback
              </button>

              {message && <p className="message">{message}</p>}

            </form>
          </div>

          <div className="card">
            <h2>📋 Customer Feedback</h2>

            {feedbacks.length === 0 ? (
              <p className="empty">No feedback available.</p>
            ) : (
              feedbacks.map((item) => (
                <div className="feedback-item" key={item.id}>

                  <h3>{item.name}</h3>

                  <small>
                    {item.category} | {item.created_at}
                  </small>

                  <div className="rating">
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </div>

                  <p>{item.comments}</p>

                  <button
                    className="delete-btn"
                    onClick={() => deleteFeedback(item.id)}
                  >
                    Delete
                  </button>

                </div>
              ))
            )}

          </div>

        </section>

      </main>

      <footer>
        Feedback Management System © 2026
      </footer>

    </div>
  );
}

export default App;
