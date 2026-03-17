/*
  # Literature Agent Database Schema

  1. New Tables
    - `research_papers`: Stores arXiv papers and their metadata
      - `id` (uuid, primary key)
      - `arxiv_id` (text, unique)
      - `title` (text)
      - `abstract` (text)
      - `authors` (text[])
      - `published_date` (date)
      - `pdf_url` (text)
      - `created_at` (timestamp)

    - `hypotheses`: Research hypotheses generated from papers
      - `id` (uuid, primary key)
      - `paper_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `hypothesis_text` (text)
      - `reasoning` (text)
      - `created_at` (timestamp)

    - `experiments`: ML model experiments and training runs
      - `id` (uuid, primary key)
      - `hypothesis_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `model_type` (text) - 'random_forest' or 'logistic_regression'
      - `dataset_name` (text)
      - `accuracy` (float)
      - `precision` (float)
      - `recall` (float)
      - `f1_score` (float)
      - `status` (text) - 'pending', 'running', 'completed', 'failed'
      - `created_at` (timestamp)
      - `completed_at` (timestamp)

    - `reports`: Final research reports
      - `id` (uuid, primary key)
      - `experiment_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `critique` (text)
      - `recommendations` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Public read access to papers (optional)
*/

CREATE TABLE IF NOT EXISTS research_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  arxiv_id text UNIQUE NOT NULL,
  title text NOT NULL,
  abstract text,
  authors text[] DEFAULT '{}',
  published_date date,
  pdf_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hypotheses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES research_papers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  hypothesis_text text NOT NULL,
  reasoning text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hypothesis_id uuid REFERENCES hypotheses(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  model_type text NOT NULL,
  dataset_name text,
  accuracy float,
  precision float,
  recall float,
  f1_score float,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid REFERENCES experiments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  critique text,
  recommendations text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Papers: Public read, authenticated users can insert
CREATE POLICY "Papers are publicly readable"
  ON research_papers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert papers"
  ON research_papers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Hypotheses: Users can only access their own
CREATE POLICY "Users can view own hypotheses"
  ON hypotheses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create hypotheses"
  ON hypotheses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hypotheses"
  ON hypotheses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Experiments: Users can only access their own
CREATE POLICY "Users can view own experiments"
  ON experiments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create experiments"
  ON experiments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments"
  ON experiments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reports: Users can only access their own
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
