const { z } = require('zod');

const proposalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  tags: z.array(z.string()).optional().default([]),
  roleRequirements: z.string().optional()
});

const updateProposalSchema = proposalSchema.extend({
  status: z.enum(['open', 'closed']).optional()
});

try {
  updateProposalSchema.parse({
    title: 'Fix Test',
    description: 'This is to test the fix.',
    roleRequirements: '',
    tags: ['react'],
    status: 'open'
  });
  console.log("Validation passed");
} catch (e) {
  console.log(e);
}
