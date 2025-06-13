import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

// MUI Components - Added Stack
import { AppBar, Toolbar, Box, Container, Paper, Typography, Avatar, Button, IconButton, Modal, Backdrop, Fade, CircularProgress, Stack, Tabs, Tab, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
// MUI Icons
import { ArrowBack, PersonAdd, PersonRemove, Favorite, ChatBubbleOutline } from "@mui/icons-material";
// Framer Motion
import { motion } from "framer-motion";

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessingFollow, setIsProcessingFollow] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', data: [] });

    // --- All data fetching and logic functions remain the same ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUserId(decoded.id);
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
                navigate("/login");
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            setTabValue(0);
            fetchUserProfile();
            fetchFollowStats();
        }
    }, [userId]);
    
    useEffect(() => {
        if(user && currentUserId) {
             setIsFollowing(user.followers.includes(currentUserId));
        }
    }, [user, currentUserId]);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const userRes = await api.get(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            const postsRes = await api.get(`/posts/user/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            setUser(userRes.data);
            setPosts(postsRes.data);
        } catch (err) {
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const fetchFollowStats = async () => {
        if (!userId) return;
        try {
            const token = localStorage.getItem("token");
            const followersRes = await api.get(`/users/${userId}/followers`, { headers: { Authorization: `Bearer ${token}` } });
            const followingRes = await api.get(`/users/${userId}/following`, { headers: { Authorization: `Bearer ${token}` } });
            setFollowers(followersRes.data);
            setFollowing(followingRes.data);
        } catch (error) { console.error("Error fetching follow stats:", error); }
    };

    const handleFollowToggle = async () => {
        if (isProcessingFollow) return;
        setIsProcessingFollow(true);
        try {
            const token = localStorage.getItem("token");
            const endpoint = isFollowing ? `/users/unfollow/${userId}` : `/users/follow/${userId}`;
            await api.put(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
            setIsFollowing(!isFollowing);
            await fetchFollowStats();
            toast.success(isFollowing ? `Unfollowed ${user.username}` : `Followed ${user.username}`);
        } catch (error) {
            toast.error("Something went wrong.");
        } finally {
            setIsProcessingFollow(false);
        }
    };

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const openFollowModal = (type) => {
        if (type === 'followers') {
            setModalContent({ title: 'Followers', data: followers });
        } else {
            setModalContent({ title: 'Following', data: following });
        }
        setModalOpen(true);
    };

    const theme = { primary: '#ff4081', text: '#212121', textSecondary: '#5f6368' };
    const gradientAnimation = { "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } };

    if (loading || !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(-45deg, #f8cdda, #c6a7f4, #92a7de, #85d8ce)', backgroundSize: '400% 400%' }}>
                <CircularProgress sx={{ color: theme.primary }} size={60} />
            </Box>
        );
    }
    
    const isOwnProfile = currentUserId === user._id;

    return (
        <Box sx={{ minHeight: "100vh", fontFamily: "'Poppins', sans-serif", background: 'linear-gradient(-45deg, #f8cdda, #c6a7f4, #92a7de, #85d8ce)', backgroundSize: '400% 400%', animation: 'gradientAnimation 20s ease infinite', "@keyframes gradientAnimation": gradientAnimation }}>
            <AppBar position="absolute" sx={{ background: 'transparent', boxShadow: 'none' }}>
                <Toolbar>
                     <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.2)', '&:hover': {backgroundColor: 'rgba(0,0,0,0.4)'} }}>
                        <ArrowBack />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ pt: '80px', pb: 4 }}>
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
                    
                    <Paper sx={{ p: { xs: 2, sm: 4 }, backgroundColor: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(20px)", border: `1px solid rgba(255, 255, 255, 0.2)`, borderRadius: "24px", boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)' }}>
                        
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 4 }}>
                            <Avatar src={user.profilePicture} sx={{ width: 160, height: 160, border: `5px solid ${theme.primary}`, boxShadow: `0 0 25px ${theme.primary}` }} />
                            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                                <Typography variant="h3" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', color: theme.text }}>{user.username}</Typography>
                                <Typography sx={{ color: theme.textSecondary, fontStyle: 'italic', my: 1 }}>"{user.bio || 'No bio available'}"</Typography>
                                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, gap: 3, my: 2 }}>
                                    <Button onClick={() => openFollowModal('followers')} sx={{ color: theme.text, p:0, textTransform: 'none' }}>
                                        <Typography component="span" sx={{ fontWeight: '700', mr: 0.5 }}>{followers.length}</Typography> Followers
                                    </Button>
                                    <Button onClick={() => openFollowModal('following')} sx={{ color: theme.text, p:0, textTransform: 'none' }}>
                                         <Typography component="span" sx={{ fontWeight: '700', mr: 0.5 }}>{following.length}</Typography> Following
                                    </Button>
                                </Box>
                                {!isOwnProfile && (
                                    <Button
                                        variant="contained" disabled={isProcessingFollow} onClick={handleFollowToggle}
                                        startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                                        sx={{ backgroundColor: isFollowing ? 'grey.500' : theme.primary, borderRadius: '12px', boxShadow: 'none', '&:hover': { backgroundColor: isFollowing ? 'grey.600' : '#d81b60' } }}
                                    >
                                        {isFollowing ? 'Unfollow' : 'Follow'}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                        
                        <Box sx={{ width: '100%', mt: 4, borderBottom: 1, borderColor: 'divider' }}>
                             <Tabs value={tabValue} onChange={handleTabChange} centered>
                                <Tab label="Posts" />
                                <Tab label="Followers" />
                                <Tab label="Following" />
                            </Tabs>
                        </Box>
                        
                        <Box sx={{ pt: 3 }}>
                             {/* ✅ FIX: Replaced Grid with Stack for a vertical list layout */}
                            {tabValue === 0 && (
                                 <Stack spacing={3}>
                                    {posts.map(post => (
                                        <Paper key={post._id} sx={{ p: 2, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                            {/* Conditionally render image only if it exists */}
                                            {post.image && (
                                                <Box
                                                    component="img"
                                                    src={post.image}
                                                    alt="Post image"
                                                    sx={{
                                                        width: '100%',
                                                        maxHeight: '400px',
                                                        objectFit: 'cover',
                                                        borderRadius: '12px',
                                                        mb: post.text ? 2 : 0, // Add margin-bottom only if there is text
                                                    }}
                                                />
                                            )}
                                            {/* Always render text if it exists */}
                                            {post.text && (
                                                <Typography variant="body1" sx={{color: theme.text, whiteSpace: 'pre-wrap'}}>
                                                    {post.text}
                                                </Typography>
                                            )}
                                            <Box sx={{display: 'flex', color: theme.textSecondary, mt: 2, alignItems: 'center', gap: 2}}>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}><Favorite sx={{fontSize: '1rem'}}/> <Typography variant="caption">{post.likes.length}</Typography></Box>
                                                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}><ChatBubbleOutline sx={{fontSize: '1rem'}}/> <Typography variant="caption">{post.comments.length}</Typography></Box>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                             {(tabValue === 1 || tabValue === 2) && (
                                <List>
                                    {(tabValue === 1 ? followers : following).map(f => (
                                        <ListItem key={f._id} secondaryAction={<Button size="small" variant="outlined" onClick={() => navigate(`/users/${f._id}`)}>View</Button>}>
                                            <ListItemAvatar><Avatar src={f.profilePicture}/></ListItemAvatar>
                                            <ListItemText primary={f.username}/>
                                        </ListItem>
                                    ))}
                                </List>
                             )}
                        </Box>

                    </Paper>
                </motion.div>
            </Container>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
                <Fade in={modalOpen}>
                     <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90vw', sm: 400 }, maxHeight: '70vh', bgcolor: 'rgba(255, 255, 255, 0.9)', backdropFilter: "blur(15px)", border: '1px solid rgba(0, 0, 0, 0.1)', boxShadow: 24, p: 3, borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
                         <Typography variant="h6" sx={{ mb: 2, fontWeight: '600' }}>{modalContent.title}</Typography>
                          <List sx={{ overflowY: 'auto' }}>
                            {modalContent.data.map(f => (
                                <ListItem key={f._id} button onClick={() => { setModalOpen(false); navigate(`/users/${f._id}`); }}>
                                    <ListItemAvatar><Avatar src={f.profilePicture} /></ListItemAvatar>
                                    <ListItemText primary={f.username} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default UserProfile;