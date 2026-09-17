const { z } = require('zod');
const pool = require('../db');
const { sendEmail } = require('../utils/emailService');

const emailSchema = z.object({
  proposalId: z.number().int().positive("Invalid proposal ID"),
  interestedName: z.string().min(2, "Name must be at least 2 characters"),
  interestedEmail: z.string().email("Invalid email address")
});

const triggerInterestedEmail = async (req, res) => {
  try {
    const parsedData = emailSchema.parse(req.body);
    const { proposalId, interestedName, interestedEmail } = parsedData;

    // Fetch the proposal owner's email
    const proposalQuery = await pool.query(`
      SELECT p.title, u.email as owner_email, u.name as owner_name 
      FROM proposals p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
    `, [proposalId]);

    if (proposalQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const { title, owner_email, owner_name } = proposalQuery.rows[0];

    // Build the email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${owner_name},</h2>
        <p>Great news! Someone is interested in your project proposal: <strong>${title}</strong>.</p>
        <p><strong>Interested Developer Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${interestedName}</li>
          <li><strong>Email:</strong> <a href="mailto:${interestedEmail}">${interestedEmail}</a></li>
        </ul>
        <p>Reach out to them to start collaborating!</p>
        <br>
        <p>Best regards,<br>The Code Connect Team</p>
      </div>
    `;

    // Send email using Resend
    const result = await sendEmail({
      to: owner_email,
      subject: `Interest in your project: ${title}`,
      html: htmlContent
    });

    if (result.success) {
      // Record the interest in the database
      await pool.query(`
        INSERT INTO proposal_interests (proposal_id, interested_name, interested_email)
        VALUES ($1, $2, $3)
      `, [proposalId, interestedName, interestedEmail]);

      return res.status(200).json({ message: 'Email sent successfully to the project owner.' });
    } else {
      return res.status(500).json({ error: 'Failed to send email.' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error triggering email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { triggerInterestedEmail };
