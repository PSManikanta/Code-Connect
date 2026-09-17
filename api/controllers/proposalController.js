const { z } = require('zod');
const pool = require('../db');

const proposalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  tags: z.array(z.string()).optional().default([]),
  roleRequirements: z.string().optional()
});

const updateProposalSchema = proposalSchema.extend({
  status: z.enum(['open', 'closed']).optional()
});

const createProposal = async (req, res) => {
  try {
    const parsedData = proposalSchema.parse(req.body);
    const { title, description, tags, roleRequirements } = parsedData;
    const userId = req.user.id; // From auth middleware

    const newProposal = await pool.query(
      'INSERT INTO proposals (owner_id, title, description, status, tags, role_requirements) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, title, description, 'open', JSON.stringify(tags), roleRequirements || '']
    );

    res.status(201).json(newProposal.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const formatProposalRows = (rows) => {
  return rows.map(r => {
    let parsedTags = r.tags;
    if (typeof parsedTags === 'string') {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        parsedTags = [];
      }
    }
    return {
      ...r,
      tags: Array.isArray(parsedTags) ? parsedTags : []
    };
  });
};

const getAllProposals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT p.id, p.title, p.description, p.status, p.tags, p.role_requirements, p.created_at, 
             u.name as owner_name, u.email as owner_email
      FROM proposals p
      JOIN users u ON p.owner_id = u.id
    `;
    const queryParams = [];

    // Optional filtering by status
    if (status && (status === 'open' || status === 'closed')) {
      query += ' WHERE p.status = $1';
      queryParams.push(status);
    }
    
    query += ' ORDER BY p.created_at DESC';

    const proposals = await pool.query(query, queryParams);
    res.status(200).json(formatProposalRows(proposals.rows));
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUserProposals = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Access denied. Valid user authentication required.' });
    }
    const userId = req.user.id;
    const query = `
      SELECT p.id, p.title, p.description, p.status, p.tags, p.role_requirements, p.created_at, 
             u.name as owner_name, u.email as owner_email
      FROM proposals p
      JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = $1
      ORDER BY p.created_at DESC
    `;
    const proposals = await pool.query(query, [userId]);
    res.status(200).json(formatProposalRows(proposals.rows));
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const parsedData = updateProposalSchema.parse(req.body);
    const { title, description, tags, status, roleRequirements } = parsedData;

    // Check ownership
    const checkQuery = await pool.query('SELECT owner_id FROM proposals WHERE id = $1', [id]);
    if (checkQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    if (checkQuery.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own proposals' });
    }

    const updatedProposal = await pool.query(
      `UPDATE proposals 
       SET title = $1, description = $2, tags = $3, status = $4, role_requirements = $5
       WHERE id = $6 RETURNING *`,
      [title, description, JSON.stringify(tags), status, roleRequirements || '', id]
    );

    res.status(200).json(updatedProposal.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createProposal, getAllProposals, getUserProposals, updateProposal };
