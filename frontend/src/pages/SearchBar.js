import React, { useState } from "react";
import api from "../utils/api.js";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const token = localStorage.getItem("token"); // Include token if needed
      const { data } = await api.get(`/users/search?username=${query}`, {
        headers: { Authorization: `Bearer ${token}` }, // If your API needs auth
      });

      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err.response?.data?.message || err.message);
    }
  };

  // ✅ Handle user click and navigate to their profile
  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div style={styles.searchContainer}>
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleSearch} style={styles.button}>🔍</button>

      {/* Display search results */}
      {searchResults.length > 0 && (
        <ul style={styles.results}>
          {searchResults.map((user) => (
            <li key={user._id} onClick={() => handleUserClick(user._id)} style={styles.resultItem}>
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "8px",
    cursor: "pointer",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "5px",
  },
  results: {
    listStyle: "none",
    padding: 0,
    margin: "10px 0",
  },
  resultItem: {
    padding: "8px",
    cursor: "pointer",
    borderBottom: "1px solid #ccc",
  },
};

export default SearchBar;
