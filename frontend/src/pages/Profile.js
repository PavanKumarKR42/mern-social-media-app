import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

// MUI Components
import { Box, Container, Paper, Typography, Avatar, Button, IconButton, TextField, Modal, Backdrop, Fade, CircularProgress } from "@mui/material";
// MUI Icons
import { Edit, Logout, DynamicFeed, CameraAlt, Close } from "@mui/icons-material";
// Framer Motion
import { motion } from "framer-motion";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [formData, setFormData] = useState({ username: "", bio: "", profilePicture: null });
  const [previewImage, setPreviewImage] = useState(null);

  // --- All your data fetching and logic functions remain the same ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Session expired."); navigate("/login"); return; }
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        const { data } = await api.get(`/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(data);
        setFormData({ username: data.username, bio: data.bio || "", profilePicture: null });
        setPreviewImage(data.profilePicture);
        const followStats = await api.get(`/users/${userId}/follow-stats`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(followStats.data);
      } catch (error) { toast.error("Failed to load profile"); } 
      finally { setLoading(false); }
    };
    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
     try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("bio", formData.bio);
      if (formData.profilePicture && formData.profilePicture instanceof File) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }
      const { data } = await api.put("/users/update", formDataToSend, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } });
      setUser(data.user);
      setPreviewImage(data.user.profilePicture);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) { toast.error(error.response?.data?.message || "Update failed"); }
  };

  const handleLogout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const handleGoToFeed = () => navigate("/feed");

  // --- NEW "GRADIENT & GLASS" THEME STYLES ---
  const theme = {
    primary: '#ff4081', // A vibrant pink for accents
    text: '#212121',
    textSecondary: '#5f6368',
  };
  
  const gradientAnimation = {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(-45deg, #f8cdda, #c6a7f4, #92a7de, #85d8ce)', backgroundSize: '400% 400%' }}>
        <CircularProgress sx={{ color: theme.primary }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      fontFamily: "'Poppins', sans-serif",
      py: { xs: 3, sm: 5 },
      background: 'linear-gradient(-45deg, #f8cdda, #c6a7f4, #92a7de, #85d8ce)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 20s ease infinite',
      "@keyframes gradientAnimation": gradientAnimation,
    }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          {/* --- The Frosted Glass Card --- */}
          <Paper sx={{
            p: { xs: 2.5, sm: 4 },
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(20px)",
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            borderRadius: "24px",
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
          }}>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar src={user.profilePicture} sx={{ width: 150, height: 150, margin: 'auto', border: `4px solid ${theme.primary}`, mb: 2, boxShadow: `0 0 20px ${theme.primary}` }} />
              <Typography variant="h3" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: '700', color: theme.text }}>
                {user.username}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.textSecondary, mt: 1 }}>{user.email}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, my: 4, p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: '700', color: theme.text }}>{stats.followersCount}</Typography>
                <Typography sx={{ color: theme.textSecondary }}>Followers</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: '700', color: theme.text }}>{stats.followingCount}</Typography>
                <Typography sx={{ color: theme.textSecondary }}>Following</Typography>
              </Box>
            </Box>
            <Typography sx={{ textAlign: 'center', color: theme.textSecondary, fontStyle: 'italic', mb: 4, px: 2 }}>"{user.bio || 'No bio specified'}"</Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)} sx={{ backgroundColor: theme.primary, borderRadius: '12px', boxShadow: 'none', '&:hover': { backgroundColor: '#d81b60' } }}>Edit Profile</Button>
              <Button variant="contained" startIcon={<DynamicFeed />} onClick={handleGoToFeed} sx={{ backgroundColor: 'rgba(0,0,0,0.1)', color: theme.text, borderRadius: '12px', boxShadow: 'none', '&:hover': { backgroundColor: 'rgba(0,0,0,0.2)' } }}>Go to Feed</Button>
              <Button variant="text" startIcon={<Logout />} onClick={handleLogout} sx={{ color: theme.textSecondary }}>Logout</Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>

      {/* --- Edit Profile Modal (Also themed) --- */}
      <Modal open={editMode} onClose={() => setEditMode(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={editMode}>
           <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90vw', sm: 450 } }}>
            <Paper sx={{ p: 4, backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(20px)", border: `1px solid rgba(255, 255, 255, 0.2)`, borderRadius: "20px", boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)', fontFamily: "'Poppins', sans-serif" }}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h5" sx={{ fontWeight: '600' }}>Edit Profile</Typography>
                <IconButton onClick={() => setEditMode(false)}><Close /></IconButton>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Box sx={{ position: 'relative', '&:hover .edit-icon-overlay': { opacity: 1 } }}>
                  <Avatar src={previewImage} sx={{ width: 120, height: 120, border: `3px solid ${theme.primary}` }} />
                  <Box className="edit-icon-overlay" onClick={() => document.getElementById('profile-pic-upload').click()} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', opacity: 0, transition: 'opacity 0.3s' }}>
                    <CameraAlt />
                  </Box>
                  <input id="profile-pic-upload" type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Box>
              </Box>
              
              <TextField fullWidth label="Username" name="username" value={formData.username} onChange={handleChange} sx={{ mb: 2 }} />
              <TextField fullWidth multiline rows={3} label="Bio" name="bio" value={formData.bio} onChange={handleChange} sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setEditMode(false)} sx={{color: theme.textSecondary}}>Cancel</Button>
                <Button onClick={handleUpdate} variant="contained" sx={{ backgroundColor: theme.primary, borderRadius: '12px', '&:hover': { backgroundColor: '#d81b60' } }}>Save Changes</Button>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Profile;