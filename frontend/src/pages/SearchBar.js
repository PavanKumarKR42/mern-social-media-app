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
    <div className="d-flex flex-column align-items-start mb-3 position-relative w-100">
      <div className="d-flex w-100">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="form-control me-2"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          🔍
        </button>
      </div>

      {/* Display search results dropdown */}
      {searchResults.length > 0 && query.trim() && (
        <div
          className="dropdown-menu show w-100 mt-1"
          style={{
            position: "absolute",
            zIndex: 999,
            top: "100%",  // Position the dropdown right below the search input
            left: 0,      // Align with the left of the search bar
            width: "100%", // Match the width of the input
          }}
        >
          {searchResults.map((user) => (
            <button
              key={user._id}
              onClick={() => handleUserClick(user._id)}
              className="dropdown-item"
            >
              {user.username}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
