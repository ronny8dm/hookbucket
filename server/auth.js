import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { Auth } from "@auth/core"
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);


const emailProvider = {
  id: 'email',
  name: 'Email',
  type: 'email',
  sendVerificationRequest: async ({ identifier, url }) => {
    try {
      console.log('Sending verification email to:', identifier);
      console.log('Magic link URL:', url);
      
      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: identifier,
        subject: 'Sign in to HookBucket',
        html: `
          <h1>Sign in to HookBucket</h1>
          <p>Click the link below to sign in:</p>
          <a href="${url}">${url}</a>
        `
      });
      
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
};

const authConfig = {
    providers: [emailProvider],
    secret: process.env.AUTH_SECRET,
    trustHost: true
  };


router.post('/signin', async (req, res) => {
    try {
      const { email } = req.body;
      const auth = await Auth(authConfig);
      await auth.signIn('email', { email });
      res.json({ success: true });
    } catch (error) {
      console.error('Auth error:', error);
      res.status(500).json({ error: error.message });
    }
  });

export default router;