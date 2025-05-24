import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './assets/logo.jpg';
import './App.css';
import AIExpenseSorter from './AIExpenseSorter';
import axios from 'axios';
import { FaRobot, FaCalculator, FaPiggyBank, FaChartLine, FaCreditCard, FaCalendarAlt, FaExternalLinkAlt, FaGamepad, FaInstagram, FaEnvelope, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

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
  return (
    <div className="page about-page">
<h2 style={{ textAlign: 'center' }}>About Us</h2>
      <div className="about-meeting-info">
        <strong>Meetings:</strong> Every other Tuesday at 7:30 pm in Burdick Hall Room #113
      </div>
      <div className="about-photo-container">
        <img src={require('./assets/groupPhoto.jpg')} alt="Money & Minorities Group" className="about-group-photo" />
      </div>
      <p style={{marginTop: '1.5rem'}}>Money & Minorities is dedicated to empowering individuals through financial education, providing the knowledge and resources needed to build financial independence and create long term economic growth. We strive to create an inclusive space where everyone can learn, grow, and navigate their financial futures with confidence.</p>

    </div>
  );
}

function FinancialTools() {
  return (
    <div className="page financial-tools-page">
      <h2 className="financial-tools-title">💼 <span className="animated-title">Financial Tools</span></h2>
      <div className="financial-tools-grid">
        <div className="financial-tool-card">
          <div className="tool-icon"><FaRobot size={36} color="#217a3b" /></div>
          <h3>AI Financial Literacy Chatbot</h3>
          <p>Ask questions and get instant financial advice, tips, and explanations from our AI-powered chatbot.</p>
          <Link to="/tools/chatbot" className="tool-btn">Open Tool</Link>
        </div>
        <div className="financial-tool-card">
          <div className="tool-icon"><FaCalculator size={36} color="#217a3b" /></div>
          <h3>Budget App</h3>
          <p>Track your expenses, set budgets, and visualize your spending to take control of your finances.</p>
          <Link to="/tools/budget" className="tool-btn">Open Tool</Link>
        </div>
      </div>
    </div>
  );
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

function EducationalResources() {
  const games = [
    {
      title: 'Time for Payback',
      desc: 'A college simulation game where players balance student loans, part-time jobs, and education choices to graduate with minimal debt.',
      age: 'High School / College',
      topics: 'Student loans, budgeting, opportunity cost',
      url: 'https://www.timeforpayback.com',
    },
    {
      title: 'Financial Football',
      desc: 'Fast-paced NFL-style game where users answer financial literacy questions to advance down the field.',
      age: 'Middle School and up',
      topics: 'Saving, spending, credit, investing',
      url: 'https://www.financialfootball.com',
    },
    {
      title: 'Lights, Camera, Budget!',
      desc: 'Become a movie producer with a $100M budget and make decisions about production while managing your finances wisely.',
      age: 'High School',
      topics: 'Budgeting, planning, financial trade-offs',
      url: 'https://www.gpb.org/education/lights-camera-budget',
    },
    {
      title: 'The Budget Game (MoneySense)',
      desc: 'Manage a monthly budget while handling unexpected events and expenses—great for teaching kids how to plan money wisely.',
      age: '8–12 years old',
      topics: 'Monthly budgeting, prioritization',
      url: 'https://natwest.mymoneysense.com/students/students-8-12/the-budget-game',
    },
    {
      title: 'SPENT',
      desc: 'A powerful simulation that puts you in the shoes of someone struggling financially, helping players understand the tough choices many face daily.',
      age: 'High School / College / Adults',
      topics: 'Living paycheck to paycheck, prioritizing expenses',
      url: 'https://playspent.org',
    },
    {
      title: 'PersonalFinanceLab Budget Game',
      desc: 'A full budget simulation where players manage expenses, react to real-life scenarios, and learn long-term planning.',
      age: 'High School and up',
      topics: 'Monthly budgets, credit, savings, unexpected expenses',
      url: 'https://www.personalfinancelab.com/budget-game',
    },
  ];

  const resourceSections = [
    {
      id: 'budgeting',
      icon: <FaPiggyBank color="#217a3b" style={{marginRight: '0.5rem'}} />, 
      title: 'Budgeting Basics',
      cardBgClass: 'card-bg-budgeting',
      categoryIcon: '💰',
      resources: [
        {
          title: 'How to Create a Budget',
          desc: 'Learn to build a step-by-step budget from a trusted source.',
          url: 'https://www.consumer.gov/articles/1002-making-budget',
        },
        {
          title: '50/30/20 Rule Explained',
          desc: 'Understand the popular 50/30/20 budgeting method and how to apply it.',
          url: 'https://www.nerdwallet.com/article/finance/what-is-the-50-30-20-budget-rule',
        },
        {
          title: 'Budgeting Tools and Apps',
          desc: 'Compare top budgeting apps to track expenses and build savings.',
          url: 'https://www.nerdwallet.com/best/finance/budgeting-apps',
        },
      ],
    },
    {
      id: 'investing',
      icon: <FaChartLine color="#217a3b" style={{marginRight: '0.5rem'}} />, 
      title: 'Investing Fundamentals',
      cardBgClass: 'card-bg-investing',
      categoryIcon: '📈',
      resources: [
        {
          title: 'Investing Basics',
          desc: "A beginner's guide to stocks, bonds, mutual funds, and risk.",
          url: 'https://www.investor.gov/introduction-investing/investing-basics',
        },
        {
          title: 'How to Start Investing',
          desc: 'Learn how to open an investment account and start small.',
          url: 'https://www.fidelity.com/learning-center/investment-products/stocks/getting-started',
        },
        {
          title: 'Investing with Small Amounts',
          desc: "Tips for building wealth even if you're starting with little money.",
          url: 'https://www.sofi.com/learn/content/how-to-invest-small-amounts/',
        },
      ],
    },
    {
      id: 'credit',
      icon: <FaCreditCard color="#217a3b" style={{marginRight: '0.5rem'}} />, 
      title: 'Credit & Debt Management',
      cardBgClass: 'card-bg-credit',
      categoryIcon: '🧾',
      resources: [
        {
          title: 'Understanding Credit Scores',
          desc: 'Learn how your credit score is calculated and how to improve it.',
          url: 'https://www.experian.com/blogs/news/2020/04/what-is-a-good-credit-score/',
        },
        {
          title: 'Debt Payoff Strategies',
          desc: 'Explore smart methods like the debt snowball and avalanche approach.',
          url: 'https://www.ramseysolutions.com/debt/how-to-get-out-of-debt',
        },
        {
          title: 'Credit Reports Guide',
          desc: 'Get your free annual credit report and learn how to read it.',
          url: 'https://www.annualcreditreport.com/index.action',
        },
      ],
    },
    {
      id: 'planning',
      icon: <FaCalendarAlt color="#217a3b" style={{marginRight: '0.5rem'}} />, 
      title: 'Financial Planning',
      cardBgClass: 'card-bg-planning',
      categoryIcon: '📅',
      resources: [
        {
          title: 'Financial Planning Basics',
          desc: 'What financial planning means and how to start one.',
          url: 'https://www.investopedia.com/terms/f/financial-plan.asp',
        },
        {
          title: 'Retirement Planning',
          desc: 'Understand 401(k)s, IRAs, and how to prepare for retirement.',
          url: 'https://www.schwab.com/retirement/retirement-planning',
        },
        {
          title: 'Importance of Financial Literacy',
          desc: 'Why financial knowledge is critical to building long-term success.',
          url: 'https://www.cnbc.com/select/why-financial-literacy-matters/',
        },
      ],
    },
    {
      id: 'games',
      icon: <FaGamepad color="#217a3b" style={{marginRight: '0.5rem'}} />, 
      title: 'Interactive Games',
      cardBgClass: 'card-bg-games',
      categoryIcon: '🎮',
      resources: games.map(g => ({
        title: g.title,
        desc: `${g.desc} (Age: ${g.age}, Concepts: ${g.topics})`,
        url: g.url,
      })),
    },
  ];

  // Track current section (tab)
  const [activeSection, setActiveSection] = useState(resourceSections[0].id);

  // Responsive: show dropdown on mobile (not needed for tabs, keep sidebar as horizontal menu)

  return (
    <div className="resources-layout">
      <nav className="resources-sidebar">
        <div className="sidebar-title">Categories</div>
        <ul className="sidebar-list">
          {resourceSections.map(section => (
            <li key={section.id}>
              <motion.button
                className={`sidebar-link${activeSection === section.id ? ' active' : ''}`}
                onClick={() => setActiveSection(section.id)}
                whileTap={{ scale: 0.97 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: activeSection === section.id
                    ? '0px 0px 8px rgba(33, 122, 59, 0.5)'
                    : '0px 0px 6px rgba(0,0,0,0.1)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {section.icon}{section.title}
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="resources-content">
        {resourceSections.map((section, i) => (
          activeSection === section.id && (
            <section
              key={section.id}
              id={section.id}
              className="resources-section show-section"
            >
              <h3 className="resources-title animated-section-title">{section.icon}{section.title}</h3>
              <div className="resources-grid">
                {section.resources.map((res, j) => (
                  <a
                    href={res.url}
                    className={`resource-card resource-link ${section.cardBgClass}`}
                    key={res.title}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${0.1 + j * 0.08}s` }}
                  >
                    <div className="resource-title-block">
                      <span className="resource-category-icon">{section.categoryIcon}</span>
                      <span className="resource-title">{res.title}</span>
                      <FaExternalLinkAlt className="external-link-icon" />
                    </div>
                    <div className="resource-desc">{res.desc}</div>
                  </a>
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };
  const pageTransition = { duration: 0.4, type: 'tween' };

  // Social links for footer
  const socialLinks = [
    { href: 'https://instagram.com/moneyandminorities', icon: <FaInstagram className="animated-icon" />, label: 'Instagram' },
    { href: 'mailto:moneyandminorities@gmail.com', icon: <FaEnvelope className="animated-icon" />, label: 'Email' },
    { href: 'https://www.linkedin.com/company/moneyandminorities', icon: <FaLinkedin className="animated-icon" />, label: 'LinkedIn' },
  ];

  return (
    <Router>
      <div className="App">
        <div className="background-blobs">
          <svg className="bg-blob bg-blob-1" viewBox="0 0 600 400"><ellipse cx="300" cy="200" rx="300" ry="200" fill="#b2f2e6" /></svg>
          <svg className="bg-blob bg-blob-2" viewBox="0 0 600 400"><ellipse cx="300" cy="200" rx="300" ry="200" fill="#e0e7ff" /></svg>
          <svg className="bg-blob bg-blob-3" viewBox="0 0 600 400"><ellipse cx="300" cy="200" rx="300" ry="200" fill="#e8f5e9" /></svg>
        </div>
        <header className="App-header">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
            Money and Minorities
          </motion.h1>
          <nav className="navbar">
            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <span className="menu-icon"></span>
            </button>
            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <Link to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>About</Link>
              <Link to="/tools" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Financial Tools</Link>
              <Link to="/resources" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Resources</Link>
              <Link to="/events" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Events</Link>
              <Link to="/officers" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Officers</Link>
              <Link to="/contact" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Contact</Link>
              <a href="http://moneyandminorities.com/" target="_blank" rel="noopener noreferrer" style={{fontWeight: 700}} className="animated-icon">@moneyandminorities.com</a>
            </div>
          </nav>
        </header>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <motion.div
                key="home"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Home />
              </motion.div>
            } />
            <Route path="/about" element={
              <motion.div
                key="about"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <About />
              </motion.div>
            } />
            <Route path="/tools" element={
              <motion.div
                key="tools"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <FinancialTools />
              </motion.div>
            } />
            <Route path="/tools/chatbot" element={
              <motion.div
                key="chatbot"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Chatbot />
              </motion.div>
            } />
            <Route path="/tools/budget" element={
              <motion.div
                key="budget"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <BudgetApp />
              </motion.div>
            } />
            <Route path="/resources" element={
              <motion.div
                key="resources"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <EducationalResources />
              </motion.div>
            } />
            <Route path="/events" element={
              <motion.div
                key="events"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Events />
              </motion.div>
            } />
            <Route path="/officers" element={
              <motion.div
                key="officers"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Officers />
              </motion.div>
            } />
            <Route path="/contact" element={
              <motion.div
                key="contact"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Contact />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
        {/* Footer */}
        <footer className="footer">
          <div className="footer-links">
            {socialLinks.map(link => (
              <a href={link.href} key={link.label} target="_blank" rel="noopener noreferrer" aria-label={link.label} className="animated-icon">
                {link.icon}
              </a>
            ))}
          </div>
          <div>&copy; {new Date().getFullYear()} Money & Minorities. All rights reserved.</div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
