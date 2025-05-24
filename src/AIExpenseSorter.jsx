import React, { useState } from "react";
import axios from "axios";
import "./AIExpenseSorter.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AIExpenseSorter = () => {
  const [income, setIncome] = useState("");
  const [input, setInput] = useState("");
  const [categorized, setCategorized] = useState({ needs: [], wants: [], savings: [] });
  const [percentages, setPercentages] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [unknownItems, setUnknownItems] = useState([]);

  const preprocessExpenses = (input) => {
    return input
      .replace(/([a-zA-Z\s]+)\s(\d+)/g, "$1: $2")
      .replace(/(\d+)\.(?=\s|$)/g, "$1")
      .replace(/\bbil\b/gi, "bill")
      .replace(/\bsavin[g]?\b/gi, "savings")
      .split(",").map(item => {
        let [label, amount] = item.split(":").map(str => str.trim());
        if (!label || !amount) return item;
        label = label.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
        return `${label}: ${amount}`;
      }).join(", ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const commonCategories = ["rent", "groceries", "utilities", "internet", "gas", "insurance", "phone", "subscriptions", "netflix", "hulu", "chegg", "spotify", "emergency fund", "travel", "savings", "credit card", "medical", "hospital"];

  const findUnknownExpenses = (input) => {
    const entries = input.split(",").map(item => item.trim());
    const unknowns = [];
    entries.forEach(entry => {
      const [rawLabel] = entry.split(":");
      const label = rawLabel?.toLowerCase()?.replace(/[^\w\s]/g, "").trim();
      if (label && !commonCategories.some(term => label.includes(term))) {
        unknowns.push(label);
      }
    });
    return unknowns;
  };

  const calculatePercentages = (customCategorized = categorized) => {
    const totalIncome = parseFloat(income);
    const getTotal = (arr) => arr.reduce((sum, item) => sum + item.amount, 0);
    return {
      needs: ((getTotal(customCategorized.needs) / totalIncome) * 100).toFixed(1),
      wants: ((getTotal(customCategorized.wants) / totalIncome) * 100).toFixed(1),
      savings: ((getTotal(customCategorized.savings) / totalIncome) * 100).toFixed(1),
    };
  };

  const calculateLeftover = (customCategorized = categorized) => {
    const getTotal = (arr) => arr.reduce((sum, item) => sum + item.amount, 0);
    const totalSpent = getTotal(customCategorized.needs) + getTotal(customCategorized.wants) + getTotal(customCategorized.savings);
    const totalIncome = parseFloat(income);
    return (totalIncome - totalSpent).toFixed(2);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setCategorized({ needs: [], wants: [], savings: [] });
    setSummary("");
    setPercentages(null);
  
    try {
      const cleanedInput = preprocessExpenses(input);
      setUnknownItems(findUnknownExpenses(cleanedInput));
  
      const prompt = `
  A user has a monthly income of $${income} and the following expenses:
  
  ${cleanedInput}
  
  Please:
  1. Sort the expenses into Needs, Wants, and Savings based ONLY on the description.
  2. DO NOT change or modify the amounts. Use the exact amounts the user provided.
  3. Calculate what percentage of their income is going to each category.
  4. Format the JSON output like this:
  {
    "needs": [ { "item": "Rent", "amount": 1200 }, ... ],
    "wants": [ { "item": "Netflix", "amount": 15 }, ... ],
    "savings": [ { "item": "Emergency Fund", "amount": 100 }, ... ],
    "percentages": {
      "needs": 50,
      "wants": 30,
      "savings": 20
    }
  }`;
  
      const res = await axios.post("https://money-and-minorities-backend.onrender.com/api/chat", {
        messages: [
          { role: "system", content: "You are a financial assistant helping categorize user expenses." },
          { role: "user", content: prompt },
        ],
      });
  
      const reply = res.data.choices[0].message.content;
      const jsonStart = reply.indexOf("{");
      const jsonEnd = reply.lastIndexOf("}");
      const jsonText = reply.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonText);
  
      setCategorized(parsed);
      setPercentages(parsed.percentages || {});
  
      const dynamicPercentages = calculatePercentages(parsed);
  
      const summaryPrompt = `
  The user has a monthly income of $${income} and the following categorized expenses:
  ${jsonText}
  
  Here is their actual budget breakdown:
  - Needs: ${dynamicPercentages.needs}% (recommended: 50%)
  - Wants: ${dynamicPercentages.wants}% (recommended: 30%)
  - Savings: ${dynamicPercentages.savings}% (recommended: 20%)
  
  Using these real percentages, write a short, friendly summary like you're giving personalized advice to a friend.
  Mention whether they are over or under the recommended 50/30/20 rule, and give encouragement or practical guidance based on the results.
  `;
  
      const summaryRes = await axios.post("https://money-and-minorities-backend.onrender.com/api/chat", {
        messages: [{ role: "user", content: summaryPrompt }],
      });
  
      setSummary(summaryRes.data.choices[0].message.content);
  
    } catch (err) {
      console.error("Error fetching OpenAI response:", err);
      alert("Something went wrong. Please check your input or API key.");
    } finally {
      setLoading(false); // ✅ Always resets loading state
    }
  };
  

  const handleCategoryChange = (item, fromCategory, toCategory) => {
    if (fromCategory === toCategory) return;
    const updated = { ...categorized };
    updated[fromCategory] = updated[fromCategory].filter(i => !(i.item === item.item && i.amount === item.amount));
    updated[toCategory] = [...updated[toCategory], item];
    setCategorized(updated);
  };

  const renderCategory = (title, items, categoryKey) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    return (
      <div className="budget-summary">
        <h4>{title}</h4>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span>{item.item}: ${item.amount}</span>
            <select value={categoryKey} onChange={(e) => handleCategoryChange(item, categoryKey, e.target.value)}>
              <option value="needs">Needs</option>
              <option value="wants">Wants</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        ))}
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
      </div>
    );
  };

  const renderPercentages = () => {
    const dynamic = calculatePercentages();
    return (
      <div className="budget-summary">
        <h4>📊 Percentage Breakdown (of Income)</h4>
        <p>Needs: {dynamic.needs}% — Recommended: 50%</p>
        <p>Wants: {dynamic.wants}% — Recommended: 30%</p>
        <p>Savings: {dynamic.savings}% — Recommended: 20%</p>
      </div>
    );
  };

  const renderLeftover = () => {
    const leftover = calculateLeftover();
    return (
      <div className="budget-summary" style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <h4>💵 Leftover Income</h4>
        <p>You have <strong>${leftover}</strong> left after covering your listed expenses.</p>
      </div>
    );
  };

  const renderChart = () => {
    const dynamic = calculatePercentages();
    const chartData = {
      labels: ["Needs", "Wants", "Savings"],
      datasets: [{
        data: [parseFloat(dynamic.needs || 0), parseFloat(dynamic.wants || 0), parseFloat(dynamic.savings || 0)],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800"]
      }]
    };

    return (
      <div className="budget-chart" style={{ maxWidth: "400px", margin: "2rem auto" }}>
        <h4>📈 Budget Distribution</h4>
        <Pie data={chartData} />
      </div>
    );
  };

  return (
    <div className="budget-container">
      <h2>🤖 AI Budget Assistant</h2>

      <div className="budget-info" style={{ marginBottom: "2rem" }}>
        <p>Welcome to your personal budgeting assistant. This tool helps you sort your spending into <strong>Needs (50%)</strong>, <strong>Wants (30%)</strong>, and <strong>Savings (20%)</strong> — the foundation of the <strong>50/30/20 rule</strong>.</p>
        <p>Just enter your monthly income and list your expenses like you're texting a friend — for example: <em>"Rent: 1200, Groceries: 300, Netflix: 15, Emergency Fund: 100"</em></p>
        <p>We'll do the math, sort them, and even give you a quick summary with personalized advice.</p>
      </div>

      <label>Monthly Income:</label>
      <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="e.g. 3000" />

      <label style={{ marginTop: "1rem" }}>Your Expenses:</label>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} style={{ width: "100%", padding: "1rem", marginBottom: "0.5rem" }} placeholder="e.g. Rent: 1200, Groceries: 300, Netflix: 15, Emergency Fund: 100" />

      <button onClick={handleAnalyze} disabled={loading}>{loading ? "Analyzing..." : "Sort My Expenses"}</button>

      {unknownItems.length > 0 && (
        <div className="budget-info" style={{ marginTop: "1rem", color: "#aa0000" }}>
          <h4>⚠️ Heads Up!</h4>
          <p>We found some items that might be unclear or miscategorized:</p>
          <ul>
            {unknownItems.map((item, idx) => (<li key={idx}><strong>{item}</strong></li>))}
          </ul>
        </div>
      )}

      {(categorized.needs.length || categorized.wants.length || categorized.savings.length) > 0 && (
        <div style={{ marginTop: "2rem" }}>
          {renderCategory("📦 Needs", categorized.needs, "needs")}
          {renderCategory("🎉 Wants", categorized.wants, "wants")}
          {renderCategory("💰 Savings", categorized.savings, "savings")}
          {renderPercentages()}
          {renderChart()}
          {renderLeftover()}
        </div>
      )}

      {summary && (
        <div className="budget-info" style={{ marginTop: "2rem" }}>
          <h4>📘 AI Summary</h4>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default AIExpenseSorter; 