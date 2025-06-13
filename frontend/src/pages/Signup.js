import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// MUI Components
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, IconButton, keyframes } from "@mui/material";
import { Person, Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";

// Framer Motion for animations
import { motion } from "framer-motion";

// ✅ DEFINE A VIBRANT, DARK-THEME COLOR PALETTE (Consistent with Login)
const primaryAccent = '#818cf8'; // Vibrant Lavender
const accentTransparent = 'rgba(129, 140, 248, 0.2)';
const lightTextColor = '#d1d5db'; // Light Gray for text
const darkCardBg = 'rgba(17, 24, 39, 0.75)'; // Semi-transparent dark bg
const darkBorder = 'rgba(55, 65, 81, 0.5)';

// ✅ CREATE A SUBTLE ANIMATION FOR THE DARK BACKGROUND (Consistent with Login)
const floatingGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
        toast.error("Please fill in all fields");
        return;
    }
    try {
      const { data } = await api.post("/auth/register", { username, email, password });
      localStorage.setItem("token", data.token);
      toast.success("Registration complete! Engaging protocols...");
      setTimeout(() => navigate("/feed"), 1500);
    } catch (error) {
      console.error("Signup Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Registration failed: Anomaly detected");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        // ✅ DARK, ANIMATED GRADIENT BACKGROUND
        background: `linear-gradient(-45deg, #0d1120, #111827, #0f172a, #1e293b)`,
        backgroundSize: '400% 400%',
        animation: `${floatingGradient} 20s ease infinite`,
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          {/* ✅ FROSTED GLASS UI CARD */}
          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: darkCardBg,
              backdropFilter: "blur(12px) saturate(180%)",
              borderRadius: "16px",
              border: `1px solid ${darkBorder}`,
              boxShadow: `0 0 20px ${accentTransparent}`,
            }}
          >
            <motion.div variants={itemVariants}>
              <Typography component="h1" variant="h4" gutterBottom sx={{
                fontWeight: '700',
                color: lightTextColor,
              }}>
                Register
              </Typography>
            </motion.div>

            <Box
              component={motion.form}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSignup}
              sx={{ mt: 1, width: '100%' }}
            >
              {/* ✅ HIGH-CONTRAST TEXTFIELDS */}
               <motion.div variants={itemVariants}>
                <TextField
                  variant="outlined" margin="normal" required fullWidth
                  id="username" label="Username" name="username"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><Person sx={{color: primaryAccent }}/></InputAdornment>),
                    style: { color: lightTextColor }
                  }}
                  InputLabelProps={{ style: { color: primaryAccent } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: darkBorder },
                      '&:hover fieldset': { borderColor: primaryAccent },
                      '&.Mui-focused fieldset': { borderColor: primaryAccent, boxShadow: `0 0 10px ${accentTransparent}` },
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  variant="outlined" margin="normal" required fullWidth
                  id="email" label="Email" name="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><Email sx={{color: primaryAccent }}/></InputAdornment>),
                    style: { color: lightTextColor }
                  }}
                  InputLabelProps={{ style: { color: primaryAccent } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: darkBorder },
                      '&:hover fieldset': { borderColor: primaryAccent },
                      '&.Mui-focused fieldset': { borderColor: primaryAccent, boxShadow: `0 0 10px ${accentTransparent}` },
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <TextField
                  variant="outlined" margin="normal" required fullWidth
                  name="password" label="Password"
                  type={showPassword ? "text" : "password"} id="password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><Lock sx={{color: primaryAccent }}/></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end" sx={{color: primaryAccent}}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    style: { color: lightTextColor }
                  }}
                  InputLabelProps={{ style: { color: primaryAccent } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: darkBorder },
                      '&:hover fieldset': { borderColor: primaryAccent },
                      '&.Mui-focused fieldset': { borderColor: primaryAccent, boxShadow: `0 0 10px ${accentTransparent}` },
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit" fullWidth
                  sx={{
                    mt: 3, mb: 2, py: 1.5,
                    fontWeight: '600',
                    color: '#020617',
                    backgroundColor: primaryAccent,
                    borderRadius: '12px',
                    border: `1px solid ${primaryAccent}`,
                    boxShadow: `0 4px 15px rgba(129, 140, 248, 0.2)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#a5b4fc',
                      boxShadow: `0 6px 20px rgba(129, 140, 248, 0.3)`,
                    }
                  }}
                >
                  REGISTER
                </Button>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography align="center" sx={{color: lightTextColor}}>
                  Already registered?{" "}
                  <Link to="/" style={{ textDecoration: 'none', fontWeight: 'bold', color: primaryAccent }}>
                    Login
                  </Link>
                </Typography>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Signup;