import { useEffect, useState } from "react";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("2026-04-26");

  function loadExpenses() {
    fetch("http://localhost:3000/expenses")
      .then((res) => res.json())
      .then((data) => setExpenses(data));
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  function addExpense(e) {
    e.preventDefault();

    fetch("http://localhost:3000/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        amount,
        category,
        date
      })
    }).then(() => {
      setTitle("");
      setAmount("");
      setCategory("Food");
      loadExpenses();
    });
  }

  function deleteExpense(id) {
    fetch(`http://localhost:3000/expenses/${id}`, {
      method: "DELETE"
    }).then(() => loadExpenses());
  }

  return (
    <div style={{ padding: "30px", maxWidth: "700px", margin: "0 auto" }}>
      <h1>Expense Tracker</h1>

      <form onSubmit={addExpense} style={{ marginBottom: "30px" }}>
        <input
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Food</option>
          <option>Transport</option>
          <option>Shopping</option>
          <option>Education</option>
          <option>Other</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button type="submit">Add Expense</button>
      </form>

      {expenses.map((expense) => (
        <div key={expense.id} style={{ marginBottom: "10px" }}>
          <strong>{expense.title}</strong> - {expense.amount} ({expense.category})

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => deleteExpense(expense.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;