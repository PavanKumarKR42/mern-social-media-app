const Post = require("../models/Post");
const User = require("../models/User");

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user.id;

        if (!text) return res.status(400).json({ message: "Text is required" });

        let imageUrl = "";
        if (req.file) imageUrl = req.file.path; // Cloudinary image URL

        const newPost = new Post({ user: userId, text, image: imageUrl });
        await newPost.save();

        res.status(201).json({ message: "Post created successfully", post: newPost });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("user", "username profilePicture").sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Like a post
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.likes.includes(req.user.id)) {
            // Unlike if already liked
            post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();
        res.json({ message: "Like updated", post });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check if the logged-in user is the owner of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized: You cannot delete this post" });
        }

        await post.deleteOne(); // or post.remove() for older Mongoose versions

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate("user", "username profilePicture");
        if (!post) return res.status(404).json({ message: "Post not found" });

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
