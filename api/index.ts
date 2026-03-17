import express, { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// Security headers middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Auth middleware - verify JWT token
const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ session: data.session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Protected API routes
app.get('/api/papers', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .order('published_date', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hypotheses', verifyAuth, async (req: Request, res: Response) => {
  try {
    const { paper_id, hypothesis_text, reasoning } = req.body;
    const user_id = (req as any).user.id;

    if (!paper_id || !hypothesis_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('hypotheses')
      .insert({
        paper_id,
        user_id,
        hypothesis_text,
        reasoning,
      })
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hypotheses', verifyAuth, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;

    const { data, error } = await supabase
      .from('hypotheses')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/experiments', verifyAuth, async (req: Request, res: Response) => {
  try {
    const { hypothesis_id, model_type, dataset_name } = req.body;
    const user_id = (req as any).user.id;

    if (!hypothesis_id || !model_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('experiments')
      .insert({
        hypothesis_id,
        user_id,
        model_type,
        dataset_name,
        status: 'pending',
      })
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/experiments', verifyAuth, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;

    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports', verifyAuth, async (req: Request, res: Response) => {
  try {
    const user_id = (req as any).user.id;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
