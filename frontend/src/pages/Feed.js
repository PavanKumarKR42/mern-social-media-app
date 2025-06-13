import React, { useEffect, useState } from "react";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

// MUI Components
import { Box, Container, Paper, Typography, Avatar, Button, IconButton, TextField, Collapse, AppBar, Toolbar, Badge, Modal, Backdrop, Fade, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
// MUI Icons
import { Favorite, FavoriteBorder, ChatBubbleOutline, DeleteForever, Send, AccountCircle, Search, Close, PhotoCamera } from "@mui/icons-material";
// Framer Motion
import { motion, AnimatePresence } from "framer-motion";

// --- Search Modal Component ---
const SearchModal = ({ open, onClose, searchQuery, setSearchQuery, searchResults }) => {
    const navigate = useNavigate();
    const handleResultClick = (userId) => {
        onClose();
        navigate(`/users/${userId}`);
    };

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
            <Fade in={open}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '95vw', sm: '80vw', md: '60vw' }, maxHeight: '80vh', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: "blur(15px)", border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: 24, p: 4, borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Search sx={{ color: 'grey.600', fontSize: 30, mr: 2 }}/>
                        <TextField fullWidth variant="standard" placeholder="Search for users or posts..." autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} InputProps={{ disableUnderline: true, style: { fontSize: '1.5rem', fontFamily: "'Nunito', sans-serif" } }}/>
                        <IconButton onClick={onClose} sx={{ ml: 2 }}><Close /></IconButton>
                    </Box>
                    <List sx={{ mt: 3, overflowY: 'auto' }}>
                        <AnimatePresence>
                        {searchResults.map(post => (
                             <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                                {/* ✅ FIX: Removed boolean 'button' prop and added cursor for better semantics */}
                                <ListItem onClick={() => handleResultClick(post.user._id)} sx={{ my: 1, borderRadius: '12px', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}>
                                    <ListItemAvatar><Avatar src={post.user.profilePicture} /></ListItemAvatar>
                                    <ListItemText primary={post.user.username} secondary={post.text} primaryTypographyProps={{ fontWeight: '600', fontFamily: "'Nunito', sans-serif" }} secondaryTypographyProps={{ noWrap: true, textOverflow: 'ellipsis', fontFamily: "'Nunito', sans-serif" }}/>
                                </ListItem>
                            </motion.div>
                        ))}
                        </AnimatePresence>
                    </List>
                </Box>
            </Fade>
        </Modal>
    );
};


const Feed = () => {
    // --- State for the Feed ---
    const [posts, setPosts] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [commentsMap, setCommentsMap] = useState({});
    const [visibleComments, setVisibleComments] = useState({});
    const [commentText, setCommentText] = useState({});

    // --- State for Search ---
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    // --- State for Post Creation ---
    const [postCreationText, setPostCreationText] = useState('');
    const [postCreationImage, setPostCreationImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    
    const navigate = useNavigate();

    // --- Component Logic ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate('/'); return; };
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
        setCurrentUser({
            id: decoded.id,
            username: decoded.username,
            profilePicture: decoded.profilePicture || "path/to/default/avatar.png"
        });
        fetchPosts(token);
    }, [navigate]);

    useEffect(() => {
        if (searchQuery.trim() === '') { setSearchResults([]); return; }
        const filteredPosts = posts.filter(post =>
            post.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.user.username.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filteredPosts);
    }, [searchQuery, posts]);

    const fetchPosts = async (token) => {
        try {
            const { data } = await api.get("/posts", { headers: { Authorization: `Bearer ${token}` } });
            setPosts(data);
        } catch (err) { toast.error("Failed to load posts"); }
    };

    const fetchComments = async (postId, token) => {
        try {
            const { data } = await api.get(`/posts/${postId}/comments`, { headers: { Authorization: `Bearer ${token}` } });
            setCommentsMap((prev) => ({ ...prev, [postId]: data }));
        } catch (err) { toast.error("Could not load comments"); }
    };

    const handleLike = async (postId) => {
        const token = localStorage.getItem("token");
        try {
            await api.put(`/posts/like/${postId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchPosts(token);
        } catch (err) { toast.error("Could not like post"); }
    };

    const handleDelete = async (postId) => {
        const token = localStorage.getItem("token");
        try {
            await api.delete(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Post deleted");
            fetchPosts(token);
        } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    };

    const handleUserClick = (userId) => navigate(`/users/${userId}`);

    const toggleComments = (postId) => {
        const token = localStorage.getItem("token");
        setVisibleComments(prev => ({ ...prev, [postId]: !prev[postId] }));
        if (!commentsMap[postId]) { fetchComments(postId, token); }
    };

    const handleCommentChange = (event, postId) => {
        setCommentText(prev => ({...prev, [postId]: event.target.value}));
    };

    const handlePostComment = async (postId) => {
        const text = commentText[postId];
        if (!text || !text.trim()) { toast.error("Comment cannot be empty"); return; }
        const token = localStorage.getItem("token");
        try {
            await api.post(`/posts/${postId}/comments`, { text }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Comment added");
            setCommentText(prev => ({...prev, [postId]: ''}));
            fetchComments(postId, token);
        } catch (err) { toast.error("Failed to post comment"); }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPostCreationImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setPostCreationImage(null);
        setPreviewImage(null);
    };

    const handlePost = async () => {
        if (!postCreationText.trim() && !postCreationImage) { toast.error("You must add text or an image."); return; }
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append('text', postCreationText);
        if (postCreationImage) { formData.append('image', postCreationImage); }

        try {
            await api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
            toast.success("Post created successfully!");
            setPostCreationText('');
            removeImage();
            fetchPosts(token);
        } catch (error) { toast.error("Failed to create post."); console.error(error); }
    };


    // --- THEME STYLES ---
    const primaryColor = '#6A5ACD';
    const backgroundColor = '#F4F7F9';

    const postVariants = {
        initial: { opacity: 0, y: 50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.6, -0.05, 0.01, 0.99] } },
        exit: { opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.3 } }
    };

    return (
        <Box sx={{ minHeight: "100vh", fontFamily: "'Nunito', sans-serif", backgroundColor: backgroundColor, pt: '80px' }}>
            <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: "blur(10px)", boxShadow: '0 2px 10px rgba(0,0,0,0.05)', color: '#333' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: '700', color: primaryColor, flexGrow: 1 }}>
                        ConnectSphere
                    </Typography>
                    <IconButton onClick={() => setIsSearchOpen(true)} sx={{ mr: 1, color: 'grey.700' }}><Search /></IconButton>
                    <Button variant="contained" onClick={() => navigate('/profile')} startIcon={<AccountCircle />} sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: '600', backgroundColor: primaryColor, borderRadius: '20px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: '#583dbd' } }}>
                        My Profile
                    </Button>
                </Toolbar>
            </AppBar>
            
            <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchResults={searchResults} />

            <Container maxWidth="sm">
                
                <Paper sx={{ p: 2.5, mb: 2.5, backgroundColor: '#ffffff', borderRadius: "20px", boxShadow: '0 4px 25px rgba(0,0,0,0.07)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar src={currentUser?.profilePicture} sx={{ mt: 1 }}/>
                        <TextField
                            fullWidth multiline variant="standard" rows={3}
                            value={postCreationText} onChange={(e) => setPostCreationText(e.target.value)}
                            placeholder={`What's on your mind, ${currentUser?.username || ''}?`}
                            InputProps={{ disableUnderline: true, style: { fontSize: '1.1rem', fontFamily: "'Nunito', sans-serif", padding: '10px 0' } }}
                        />
                    </Box>

                    {previewImage && (
                        <Box sx={{ position: 'relative', mt: 2, borderRadius: '16px', overflow: 'hidden' }}>
                            <IconButton onClick={removeImage} sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)'} }}>
                                <Close />
                            </IconButton>
                            <img src={previewImage} alt="Preview" style={{ width: '100%', display: 'block' }} />
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                        <IconButton sx={{color: primaryColor}} onClick={() => document.getElementById('image-upload').click()}>
                            <PhotoCamera />
                        </IconButton>
                        <input id="image-upload" type="file" accept="image/png, image/jpeg, image/jpg" hidden onChange={handleImageChange} />
                        <Button
                            variant="contained" onClick={handlePost} disabled={!postCreationText.trim() && !postCreationImage}
                            sx={{ fontFamily: "'Nunito', sans-serif", fontWeight: '600', backgroundColor: primaryColor, borderRadius: '20px', textTransform: 'none', boxShadow: 'none', '&:hover': { backgroundColor: '#583dbd' } }}
                        >
                            Post
                        </Button>
                    </Box>
                </Paper>

                <AnimatePresence>
                    {posts.map((post) => (
                         <motion.div key={post._id} variants={postVariants} initial="initial" animate="animate" exit="exit" layout>
                            <Paper sx={{ my: 2.5, p: 2.5, backgroundColor: '#ffffff', borderRadius: "20px", boxShadow: '0 4px 25px rgba(0,0,0,0.07)'}}>
                                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar src={post.user.profilePicture} sx={{ width: 48, height: 48, cursor: 'pointer' }} onClick={() => handleUserClick(post.user._id)} />
                                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: '700', cursor: 'pointer' }} onClick={() => handleUserClick(post.user._id)}>
                                            {post.user.username}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'grey.600' }}>{new Date(post.createdAt).toLocaleString()}</Typography>
                                    </Box>
                                    {currentUserId === post.user._id && (
                                        <IconButton size="small" onClick={() => handleDelete(post._id)} sx={{ color: 'grey.500', '&:hover': {color: 'red'} }}><DeleteForever /></IconButton>
                                    )}
                                </Box>
                                <Typography variant="body1" sx={{ my: 2, whiteSpace: 'pre-wrap', color: '#444' }}>{post.text}</Typography>
                                {post.image && (
                                    <Box component="img" src={post.image} sx={{ width: '100%', borderRadius: '16px', mt: 1 }} />
                                )}

                                {/* ✅ UI IMPROVEMENT: Redesigned action buttons with icons and badges */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, borderTop: '1px solid #f0f0f0', pt: 1 }}>
                                    <IconButton onClick={() => handleLike(post._id)} sx={{ color: post.likes.includes(currentUserId) ? primaryColor : 'grey.600' }}>
                                        <Badge badgeContent={post.likes.length} color="primary" sx={{ '& .MuiBadge-badge': { backgroundColor: primaryColor, color: '#fff' } }}>
                                            {post.likes.includes(currentUserId) ? <Favorite /> : <FavoriteBorder />}
                                        </Badge>
                                    </IconButton>
                                    <IconButton onClick={() => toggleComments(post._id)} sx={{ color: 'grey.600', ml: 1 }}>
                                        <Badge badgeContent={commentsMap[post._id]?.length || 0} color="default" sx={{ '& .MuiBadge-badge': { backgroundColor: 'grey.300', color: 'grey.700' } }}>
                                            <ChatBubbleOutline />
                                        </Badge>
                                    </IconButton>
                                </Box>

                                <Collapse in={visibleComments[post._id]} timeout="auto" unmountOnExit>
                                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                             {/* ✅ FIX: Used correct currentUser state for avatar */}
                                            <Avatar src={currentUser?.profilePicture} sx={{ width: 40, height: 40 }} />
                                            <TextField
                                                fullWidth variant="outlined" placeholder="Write a thoughtful comment..."
                                                value={commentText[post._id] || ''} onChange={(e) => handleCommentChange(e, post._id)}
                                                multiline
                                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px', backgroundColor: backgroundColor, '& fieldset': { border: 'none' } } }}
                                            />
                                            <IconButton onClick={() => handlePostComment(post._id)} sx={{ backgroundColor: primaryColor, color: '#fff', '&:hover': {backgroundColor: '#583dbd'} }}><Send /></IconButton>
                                        </Box>
                                        {commentsMap[post._id]?.map(comment => (
                                            <Box key={comment._id} sx={{ display: 'flex', mt: 2, p: 1.5, borderRadius: '16px' }}>
                                                <Avatar src={comment.user?.profilePicture} sx={{ width: 40, height: 40, mr: 1.5 }} />
                                                <Box sx={{ p: 1.5, backgroundColor: backgroundColor, borderRadius: '16px' }}>
                                                    <Typography variant="body2" sx={{ fontWeight: '700' }}>{comment.user?.username}</Typography>
                                                    <Typography variant="body2" sx={{ color: '#555' }}>{comment.text}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Collapse>
                            </Paper>
                         </motion.div>
                    ))}
                </AnimatePresence>
            </Container>
        </Box>
    );
};

export default Feed;