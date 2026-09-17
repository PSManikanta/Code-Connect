const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const pool = require('../db');

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional().default(''),
  roleTitle: z.string().optional().default(''),
  skills: z.array(z.string()).optional().default([]),
  githubUrl: z.string().optional().default(''),
  linkedinUrl: z.string().optional().default(''),
  experienceLevel: z.string().optional().default('Intermediate')
});

const formatUserObject = (user) => {
  if (!user) return null;
  delete user.password_hash;
  let parsedSkills = user.skills;
  if (typeof parsedSkills === 'string') {
    try {
      parsedSkills = JSON.parse(parsedSkills);
    } catch (e) {
      parsedSkills = [];
    }
  }
  return {
    ...user,
    bio: user.bio || '',
    role_title: user.role_title || '',
    skills: Array.isArray(parsedSkills) ? parsedSkills : [],
    github_url: user.github_url || '',
    linkedin_url: user.linkedin_url || '',
    experience_level: user.experience_level || 'Intermediate'
  };
};

const signup = async (req, res) => {
  try {
    const parsedData = signupSchema.parse(req.body);
    const { name, email, password } = parsedData;

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, bio, role_title, skills, github_url, linkedin_url, experience_level, created_at`,
      [name, email, passwordHash]
    );

    const user = formatUserObject(newUser.rows[0]);
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || 'Validation failed' });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const parsedData = loginSchema.parse(req.body);
    const { email, password } = parsedData;

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const rawUser = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, rawUser.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: rawUser.id, email: rawUser.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user = formatUserObject(rawUser);

    res.status(200).json({ user, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || 'Validation failed' });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query(
      'SELECT id, name, email, bio, role_title, skills, github_url, linkedin_url, experience_level, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(formatUserObject(userResult.rows[0]));
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const parsedData = updateProfileSchema.parse(req.body);
    const { name, bio, roleTitle, skills, githubUrl, linkedinUrl, experienceLevel } = parsedData;

    const updatedUser = await pool.query(
      `UPDATE users 
       SET name = $1, bio = $2, role_title = $3, skills = $4, github_url = $5, linkedin_url = $6, experience_level = $7
       WHERE id = $8
       RETURNING id, name, email, bio, role_title, skills, github_url, linkedin_url, experience_level, created_at`,
      [name, bio, roleTitle, JSON.stringify(skills), githubUrl, linkedinUrl, experienceLevel, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(formatUserObject(updatedUser.rows[0]));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || 'Validation failed' });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { signup, login, getProfile, updateProfile };

