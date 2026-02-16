-- Syllab Database Schema
-- Todas as tabelas usam o prefixo syllab_

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Instituições
CREATE TABLE syllab_instituicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  sigla VARCHAR(50),
  logo_url TEXT,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Professores
CREATE TABLE syllab_professores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  foto_url TEXT,
  bio TEXT,
  instituicao_id UUID REFERENCES syllab_instituicoes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Disciplinas
CREATE TABLE syllab_disciplinas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(50),
  descricao TEXT,
  carga_horaria INTEGER,
  semestre VARCHAR(20),
  ano INTEGER,
  professor_id UUID REFERENCES syllab_professores(id) ON DELETE CASCADE,
  instituicao_id UUID REFERENCES syllab_instituicoes(id) ON DELETE CASCADE,
  capa_url TEXT,
  cor_tema VARCHAR(7) DEFAULT '#1e40af',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Conteúdos
-- tipo: 'documento_geral', 'jornada_aula', 'avaliativo'
CREATE TABLE syllab_conteudos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('documento_geral', 'jornada_aula', 'avaliativo')),
  disciplina_id UUID REFERENCES syllab_disciplinas(id) ON DELETE CASCADE,
  ordem INTEGER DEFAULT 0,
  conteudo_texto TEXT,
  arquivo_url TEXT,
  arquivo_nome VARCHAR(255),
  data_disponibilizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_limite TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_professores_instituicao ON syllab_professores(instituicao_id);
CREATE INDEX idx_professores_user ON syllab_professores(user_id);
CREATE INDEX idx_disciplinas_professor ON syllab_disciplinas(professor_id);
CREATE INDEX idx_disciplinas_instituicao ON syllab_disciplinas(instituicao_id);
CREATE INDEX idx_conteudos_disciplina ON syllab_conteudos(disciplina_id);
CREATE INDEX idx_conteudos_tipo ON syllab_conteudos(tipo);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_syllab_instituicoes_updated_at BEFORE UPDATE ON syllab_instituicoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syllab_professores_updated_at BEFORE UPDATE ON syllab_professores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syllab_disciplinas_updated_at BEFORE UPDATE ON syllab_disciplinas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_syllab_conteudos_updated_at BEFORE UPDATE ON syllab_conteudos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE syllab_instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllab_professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllab_disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllab_conteudos ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura (alunos podem visualizar)
CREATE POLICY "Instituições são públicas para visualização" ON syllab_instituicoes
  FOR SELECT USING (ativo = true);

CREATE POLICY "Professores são públicos para visualização" ON syllab_professores
  FOR SELECT USING (ativo = true);

CREATE POLICY "Disciplinas são públicas para visualização" ON syllab_disciplinas
  FOR SELECT USING (ativo = true);

CREATE POLICY "Conteúdos são públicos para visualização" ON syllab_conteudos
  FOR SELECT USING (ativo = true);

-- Políticas para professores (apenas podem modificar seus próprios recursos)
-- Política permissiva para desenvolvimento (permite atualizar professores sem autenticação)
CREATE POLICY "Permitir atualizar professores em desenvolvimento" ON syllab_professores
  FOR UPDATE USING (true);

-- IMPORTANTE: Em produção, substitua pela política que verifica autenticação:
/*
CREATE POLICY "Professores podem atualizar seus dados" ON syllab_professores
  FOR UPDATE USING (auth.uid() = user_id);
*/

-- Política permissiva para desenvolvimento (permite criar disciplinas sem autenticação)
CREATE POLICY "Permitir criar disciplinas em desenvolvimento" ON syllab_disciplinas
  FOR INSERT WITH CHECK (true);

-- Política permissiva para desenvolvimento (permite atualizar disciplinas sem autenticação)
CREATE POLICY "Permitir atualizar disciplinas em desenvolvimento" ON syllab_disciplinas
  FOR UPDATE USING (true);

-- IMPORTANTE: Em produção, substitua as políticas acima por estas que verificam autenticação:
/*
CREATE POLICY "Professores podem criar disciplinas" ON syllab_disciplinas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM syllab_professores 
      WHERE id = professor_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar suas disciplinas" ON syllab_disciplinas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM syllab_professores 
      WHERE id = professor_id AND user_id = auth.uid()
    )
  );
*/

-- Política permissiva para desenvolvimento (permite criar conteúdos mesmo sem autenticação)
CREATE POLICY "Permitir criar conteúdos em desenvolvimento" ON syllab_conteudos
  FOR INSERT WITH CHECK (true);

-- Política permissiva para desenvolvimento (permite atualizar conteúdos mesmo sem autenticação)
CREATE POLICY "Permitir atualizar conteúdos em desenvolvimento" ON syllab_conteudos
  FOR UPDATE USING (true);

-- Política permissiva para desenvolvimento (permite deletar conteúdos mesmo sem autenticação)
CREATE POLICY "Permitir deletar conteúdos em desenvolvimento" ON syllab_conteudos
  FOR DELETE USING (true);

-- IMPORTANTE: Em produção, substitua as políticas acima por estas que verificam autenticação:
/*
CREATE POLICY "Professores podem criar conteúdos" ON syllab_conteudos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM syllab_disciplinas d
      JOIN syllab_professores p ON d.professor_id = p.id
      WHERE d.id = disciplina_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar conteúdos" ON syllab_conteudos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM syllab_disciplinas d
      JOIN syllab_professores p ON d.professor_id = p.id
      WHERE d.id = disciplina_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem deletar conteúdos" ON syllab_conteudos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM syllab_disciplinas d
      JOIN syllab_professores p ON d.professor_id = p.id
      WHERE d.id = disciplina_id AND p.user_id = auth.uid()
    )
  );
*/

-- Dados de exemplo (opcional - remova se não precisar)
INSERT INTO syllab_instituicoes (nome, sigla, descricao) VALUES
  ('Universidade Federal de Exemplo', 'UFE', 'Instituição de ensino superior de excelência'),
  ('Instituto Tecnológico de São Paulo', 'ITSP', 'Focado em tecnologia e inovação');
