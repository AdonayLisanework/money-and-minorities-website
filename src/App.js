import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './assets/logo.jpg';
import './App.css';
import AIExpenseSorter from './AIExpenseSorter';
import axios from 'axios';

function Home() {
  return (
    <header className="App-header">
      <img src={logo} className="Org-logo" alt="Money & Minorities Logo" />
      <h1 style={{ color: '#217a3b', margin: '1rem 0 0.5rem' }}>Money & Minorities</h1>
      <h2 style={{ color: '#388e3c', fontWeight: 400 }}>Empowering Minorities Through Financial Education</h2>
      <p style={{ maxWidth: 600, margin: '1rem auto', color: '#222', fontSize: '1.2rem' }}>
        Join us every other Tuesday at BU 113, 7:30-8:30pm. Open to all!<br />
        <strong>Contact:</strong> moneyandminorities@gmail.com
      </p>
      <a
        className="cta-btn"
        href="mailto:moneyandminorities@gmail.com"
        style={{
          background: '#217a3b', color: '#fff', padding: '0.75rem 2rem', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', marginTop: '1rem', display: 'inline-block'
        }}
      >
        Join Us
      </a>
    </header>
  );
}

function About() {
  return <div className="page"><h2>About Us</h2><p>Money & Minorities is dedicated to empowering individuals through financial education, providing the knowledge and resources needed to build financial independence and create long term economic growth. We strive to create an inclusive space where everyone can learn, grow, and navigate their financial futures with confidence.</p></div>;
}

function FinancialTools() {
  return <div className="page"><h2>Financial Tools</h2><ul><li><Link to="/tools/chatbot">AI Financial Literacy Chatbot</Link></li><li><Link to="/tools/budget">Budget App</Link></li></ul></div>;
}

function Events() {
  return <div className="page"><h2>Events</h2><p>Meetings every other Tuesday, 7:30-8:30pm in BU 113. Open to the public!</p></div>;
}

function Officers() {
  return <div className="page"><h2>Officers</h2><ul><li>PRESIDENT: Benedict Adjoyi</li><li>VICE PRESIDENT: Adonay Lisanework</li><li>TREASURERS: Nathaniel Abera, Charles Quarshie</li><li>SECRETARIES: Ebenezer Ajisafe, Shirley Dickey</li></ul></div>;
}

function Contact() {
  return <div className="page"><h2>Contact</h2><p>Email: moneyandminorities@gmail.com<br/>Phone: 301-573-0399</p></div>;
}

function Chatbot() {
  const [messages, setMessages] = React.useState([
    { sender: 'bot', text: 'Hi! I am your AI financial literacy assistant. Ask me anything about money, budgeting, or financial tips!' }
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const apiKey = process.env.REACT_APP_API_KEY;

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setLoading(true);
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a financial tutor who is educating a client new to finances." },
            ...messages.filter(m => m.sender === 'user').map(m => ({ role: 'user', content: m.text })),
            { role: 'user', content: input }
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      const reply = res.data.choices[0].message.content;
      setMessages(msgs => [...msgs, { sender: 'bot', text: reply }]);
    } catch (error) {
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }
    setInput('');
    setLoading(false);
  };
  return (
    <div className="page">
      <h2>AI Financial Literacy Chatbot</h2>
      <div className="chatbot-box">
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={msg.sender === 'bot' ? 'chatbot-bot' : 'chatbot-user'}>{msg.text}</div>
          ))}
        </div>
        <div className="chatbot-input-row">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question..."
            onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}

function BudgetApp() {
  return <div className="page"><AIExpenseSorter /></div>;
}

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/tools">Financial Tools</Link>
        <Link to="/events">Events</Link>
        <Link to="/officers">Officers</Link>
        <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/tools" element={<FinancialTools />} />
        <Route path="/tools/chatbot" element={<Chatbot />} />
        <Route path="/tools/budget" element={<BudgetApp />} />
        <Route path="/events" element={<Events />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
