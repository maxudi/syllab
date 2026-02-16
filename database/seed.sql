-- Script para popular o banco com dados de exemplo
-- Execute este script APÓS o schema.sql

-- Limpar dados existentes (opcional - cuidado em produção!)
-- TRUNCATE TABLE syllab_conteudos CASCADE;
-- TRUNCATE TABLE syllab_disciplinas CASCADE;
-- TRUNCATE TABLE syllab_professores CASCADE;
-- TRUNCATE TABLE syllab_instituicoes CASCADE;

-- Inserir Instituições
INSERT INTO syllab_instituicoes (id, nome, sigla, descricao) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Universidade Federal de Exemplo', 'UFE', 'Instituição pública de ensino superior com foco em excelência acadêmica'),
  ('b1ffcd88-8b1a-5fb9-cc7e-7cc0ce491b22', 'Instituto Tecnológico de São Paulo', 'ITSP', 'Instituto focado em tecnologia e inovação'),
  ('c2aade77-7a0a-6ab0-dd8f-8dd1df502c33', 'Faculdade de Ciências Aplicadas', 'FCA', 'Ensino de qualidade em diversas áreas do conhecimento');

-- Inserir Professores
-- Nota: user_id será NULL pois não temos usuários autenticados ainda
INSERT INTO syllab_professores (id, nome, email, bio, instituicao_id) VALUES
  ('d3aaef66-6909-7aa1-ee9a-9ee2ea613d44', 'Dr. Carlos Silva', 'carlos.silva@ufe.edu.br', 'Doutorado em Ciência da Computação. 15 anos de experiência em desenvolvimento de software.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('e4aaff55-5808-8ab2-ff0a-0ff3fa724e55', 'Profa. Ana Santos', 'ana.santos@ufe.edu.br', 'Mestra em Engenharia de Software. Especialista em metodologias ágeis.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('f5bbaa44-4707-9ab3-aa1b-1aa4ab835f66', 'Dr. Roberto Oliveira', 'roberto.oliveira@itsp.edu.br', 'PhD em Inteligência Artificial. Pesquisador em Machine Learning.', 'b1ffcd88-8b1a-5fb9-cc7e-7cc0ce491b22'),
  ('a6bbaa33-3606-0ab4-aa2b-2aa5ab946a77', 'Profa. Maria Costa', 'maria.costa@fca.edu.br', 'Doutora em Administração. Consultora empresarial.', 'c2aade77-7a0a-6ab0-dd8f-8dd1df502c33');

-- Inserir Disciplinas
INSERT INTO syllab_disciplinas (id, nome, codigo, descricao, carga_horaria, semestre, ano, professor_id, instituicao_id, cor_tema) VALUES
  ('b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 'Programação Orientada a Objetos', 'CC301', 'Conceitos fundamentais de POO, classes, objetos, herança e polimorfismo', 80, '2024.1', 2024, 'd3aaef66-6909-7aa1-ee9a-9ee2ea613d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '#1e40af'),
  ('c8ddcc11-1404-2ab6-cc4d-4cc7cd168c99', 'Estruturas de Dados', 'CC202', 'Listas, pilhas, filas, árvores e grafos. Análise de complexidade.', 60, '2024.1', 2024, 'd3aaef66-6909-7aa1-ee9a-9ee2ea613d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '#1e40af'),
  ('d9eedd00-0303-3ab7-dd5e-5dd8de279d00', 'Engenharia de Software', 'CC401', 'Processos de desenvolvimento, requisitos, design patterns e testes', 80, '2024.1', 2024, 'e4aaff55-5808-8ab2-ff0a-0ff3fa724e55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '#0f766e'),
  ('e0ffee99-9202-4ab8-ee6f-6ee9ef380e11', 'Inteligência Artificial', 'TI501', 'Fundamentos de IA, algoritmos de busca, aprendizado de máquina', 80, '2024.1', 2024, 'f5bbaa44-4707-9ab3-aa1b-1aa4ab835f66', 'b1ffcd88-8b1a-5fb9-cc7e-7cc0ce491b22', '#7c3aed'),
  ('f1aabb88-8101-5ab9-ff7a-7ff0fa491f22', 'Gestão de Projetos', 'ADM301', 'Metodologias de gestão, planejamento, execução e controle de projetos', 60, '2024.1', 2024, 'a6bbaa33-3606-0ab4-aa2b-2aa5ab946a77', 'c2aade77-7a0a-6ab0-dd8f-8dd1df502c33', '#dc2626');

-- Inserir Conteúdos para POO (b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88)

-- Documentos Gerais
INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto) VALUES
  ('Plano de Ensino', 'Plano de ensino completo da disciplina', 'documento_geral', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 1, 
   'Objetivos: Compreender os conceitos de POO. Metodologia: Aulas expositivas e práticas. Avaliação: 2 provas + trabalho final.'),
  ('Bibliografia Recomendada', 'Livros e materiais de apoio', 'documento_geral', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 2,
   '1. Java: Como Programar (Deitel)\n2. Padrões de Projeto (GoF)\n3. Clean Code (Robert Martin)'),
  ('Cronograma', 'Cronograma de aulas e avaliações', 'documento_geral', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 3,
   'Semana 1-4: Fundamentos\nSemana 5-8: Herança e Polimorfismo\nSemana 9-12: Design Patterns\nSemana 13-16: Projeto Final');

-- Jornada de Aulas
INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto) VALUES
  ('Aula 1 - Introdução à POO', 'Conceitos iniciais e paradigma orientado a objetos', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 1,
   'Nesta aula vamos entender o que é POO, seus pilares (Encapsulamento, Herança, Polimorfismo, Abstração) e diferenças com programação procedural.'),
  ('Aula 2 - Classes e Objetos', 'Definindo classes e criando objetos', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 2,
   'Aprenderemos a criar classes, definir atributos e métodos, e instanciar objetos. Exemplos práticos com Java.'),
  ('Aula 3 - Encapsulamento', 'Modificadores de acesso e getters/setters', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 3,
   'Entendendo public, private, protected. Implementando encapsulamento adequado.'),
  ('Aula 4 - Herança', 'Reutilização de código através de herança', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 4,
   'Como criar hierarquias de classes. Palavra-chave extends, sobrescrita de métodos.'),
  ('Aula 5 - Polimorfismo', 'Mesmo método, comportamentos diferentes', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 5,
   'Polimorfismo de sobrecarga e sobrescrita. Exemplos práticos.'),
  ('Aula 6 - Classes Abstratas', 'Modelando conceitos abstratos', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 6,
   'Quando usar classes abstratas. Diferença entre classes abstratas e concretas.'),
  ('Aula 7 - Interfaces', 'Contratos de comportamento', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 7,
   'Definindo e implementando interfaces. Múltiplas interfaces.'),
  ('Aula 8 - Design Patterns - Singleton', 'Padrão Singleton', 'jornada_aula', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 8,
   'Garantindo uma única instância de uma classe.');

-- Avaliativos
INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto, data_limite) VALUES
  ('Exercício 1 - Classes Básicas', 'Criar classes simples com atributos e métodos', 'avaliativo', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 1,
   'Criar uma classe Pessoa com nome, idade e métodos getter/setter. Criar classe Aluno que herda de Pessoa.',
   (CURRENT_DATE + INTERVAL '7 days')::timestamp),
  ('Exercício 2 - Herança e Polimorfismo', 'Implementar hierarquia de classes', 'avaliativo', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 2,
   'Criar classes Animal, Cachorro, Gato com método fazerSom() polimórfico.',
   (CURRENT_DATE + INTERVAL '14 days')::timestamp),
  ('Trabalho 1 - Sistema de Biblioteca', 'Desenvolver um sistema orientado a objetos', 'avaliativo', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 3,
   'Desenvolver sistema de biblioteca com classes Livro, Autor, Usuario, Emprestimo. Aplicar todos os conceitos de POO.',
   (CURRENT_DATE + INTERVAL '30 days')::timestamp),
  ('Prova 1 - Conceitos Fundamentais', 'Avaliação teórica e prática', 'avaliativo', 'b7ccbb22-2505-1ab5-bb3c-3bb6bc057b88', 4,
   'Prova abrangendo aulas 1-4. Parte teórica (40%) e prática (60%).',
   (CURRENT_DATE + INTERVAL '21 days')::timestamp);

-- Inserir alguns conteúdos para Engenharia de Software (d9eedd00-0303-3ab7-dd5e-5dd8de279d00)

INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto) VALUES
  ('Plano de Ensino - ES', 'Plano de ensino da disciplina de Engenharia de Software', 'documento_geral', 'd9eedd00-0303-3ab7-dd5e-5dd8de279d00', 1,
   'Disciplina focada em processos de desenvolvimento, metodologias ágeis, requisitos, design e testes.'),
  ('Aula 1 - Introdução à ES', 'O que é Engenharia de Software', 'jornada_aula', 'd9eedd00-0303-3ab7-dd5e-5dd8de279d00', 1,
   'Conceitos fundamentais, ciclo de vida de software, processos de desenvolvimento.'),
  ('Aula 2 - Metodologias Ágeis', 'Scrum, Kanban e XP', 'jornada_aula', 'd9eedd00-0303-3ab7-dd5e-5dd8de279d00', 2,
   'Princípios ágeis, frameworks e práticas. Scrum em detalhes.'),
  ('Aula 3 - Requisitos de Software', 'Levantamento e documentação', 'jornada_aula', 'd9eedd00-0303-3ab7-dd5e-5dd8de279d00', 3,
   'Requisitos funcionais e não-funcionais. User Stories. Casos de Uso.');

INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto, data_limite) VALUES
  ('Exercício 1 - User Stories', 'Escrever user stories para um sistema', 'avaliativo', 'd9eedd00-0303-3ab7-dd5e-5dd8de279d00', 1,
   'Criar 10 user stories para um sistema de e-commerce.',
   (CURRENT_DATE + INTERVAL '10 days')::timestamp);

-- Inserir conteúdos para IA (e0ffee99-9202-4ab8-ee6f-6ee9ef380e11)

INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto) VALUES
  ('Plano de Ensino - IA', 'Plano de ensino de Inteligência Artificial', 'documento_geral', 'e0ffee99-9202-4ab8-ee6f-6ee9ef380e11', 1,
   'Fundamentos de IA, busca, aprendizado de máquina, redes neurais.'),
  ('Aula 1 - Introdução à IA', 'História e conceitos fundamentais', 'jornada_aula', 'e0ffee99-9202-4ab8-ee6f-6ee9ef380e11', 1,
   'O que é Inteligência Artificial. Tipos de IA. Aplicações.'),
  ('Aula 2 - Algoritmos de Busca', 'Busca em largura e profundidade', 'jornada_aula', 'e0ffee99-9202-4ab8-ee6f-6ee9ef380e11', 2,
   'BFS, DFS, A*. Problemas de busca em espaço de estados.'),
  ('Aula 3 - Machine Learning', 'Introdução ao aprendizado de máquina', 'jornada_aula', 'e0ffee99-9202-4ab8-ee6f-6ee9ef380e11', 3,
   'Aprendizado supervisionado, não supervisionado e por reforço.');

INSERT INTO syllab_conteudos (titulo, descricao, tipo, disciplina_id, ordem, conteudo_texto, data_limite) VALUES
  ('Projeto 1 - Algoritmo de Busca', 'Implementar algoritmo A*', 'avaliativo', 'e0ffee99-9202-4ab8-ee6f-6ee9ef380e11', 1,
   'Implementar o algoritmo A* para resolver o problema das 8 rainhas.',
   (CURRENT_DATE + INTERVAL '20 days')::timestamp);

-- Verificar dados inseridos
SELECT 
  i.nome as instituicao,
  COUNT(DISTINCT p.id) as professores,
  COUNT(DISTINCT d.id) as disciplinas,
  COUNT(c.id) as conteudos
FROM syllab_instituicoes i
LEFT JOIN syllab_professores p ON p.instituicao_id = i.id
LEFT JOIN syllab_disciplinas d ON d.instituicao_id = i.id
LEFT JOIN syllab_conteudos c ON c.disciplina_id = d.id
GROUP BY i.id, i.nome
ORDER BY i.nome;
