import React, { useEffect, useState } from "react";
import API from "../utils/api.js";

const Home = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/users/me");
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchPosts = async () => {
      try {
        const { data } = await API.get("/posts");
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Welcome, {user ? user.name : "Guest"}!</h2>
      {posts.map((post) => (
        <div key={post._id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default Home;