-- Dados de Exemplo para Sistema de Slides (TEMPLATE)
-- 
-- ⚠️ ATENÇÃO: Este é um arquivo TEMPLATE!
-- 
-- OPÇÃO 1 (RECOMENDADO): Use o script automático que cria tudo:
--   → Execute: database/criar-aula-exemplo-automatico.sql
-- 
-- OPÇÃO 2: Use este template manualmente:
--   1. Crie um conteúdo tipo "jornada_aula" em /professor
--   2. Copie o ID do conteúdo
--   3. Execute FIND & REPLACE neste arquivo:
--      Substituir: SEU_CONTEUDO_ID_AQUI
--      Por: [cole o ID real aqui]
--   4. Execute o script no SQL Editor
--
-- Exemplo de ID válido: '123e4567-e89b-12d3-a456-426614174000'

-- Slide 1: Introdução
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  0,
  'Início da Aula',
  '<p class="mt-4 fs-5">Bem-vindos ao fascinante mundo da Segurança da Informação!</p>
   <p>Vivemos em uma era onde a informação é um dos ativos mais valiosos. Proteger essa informação não é mais uma opção, mas uma necessidade para indivíduos, empresas e governos.</p>
   <p>Nesta primeira aula, vamos entender os pilares dessa proteção: o que precisamos proteger e por quê.</p>',
  'texto',
  'bi-shield-lock-fill',
  3
);

-- Slide 2: Objetivos
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  1,
  'Objetivos da Aula',
  '<p>Ao final desta aula, você será capaz de:</p>
   <ul>
     <li>Identificar os elementos fundamentais que precisam de proteção (Pessoas, Ativos, Informação).</li>
     <li>Definir os três pilares da segurança da informação: <strong>Confidencialidade, Integridade e Disponibilidade (C.I.D.)</strong>.</li>
     <li>Diferenciar os conceitos de <strong>Ameaça, Vulnerabilidade e Exploit</strong>.</li>
     <li>Compreender como esses conceitos se aplicam a um cenário de negócios real.</li>
   </ul>',
  'texto',
  'bi-calendar-event',
  5
);

-- Slide 3: O Que Devemos Proteger
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, midia_url, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  2,
  'O Que Devemos Proteger?',
  '<p>Em segurança da informação, nosso objetivo é proteger certas propriedades da informação. As três mais importantes formam a tríade conhecida como <strong>C.I.D.</strong>:</p>
   <ul>
     <li><strong>C</strong>onfidencialidade</li>
     <li><strong>I</strong>ntegridade</li>
     <li><strong>D</strong>isponibilidade</li>
   </ul>
   <p>Esses três pilares são a base para qualquer estratégia de segurança e representam o que devemos garantir para que a informação esteja verdadeiramente segura.</p>',
  'imagem',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
  'bi-gem',
  5
);

-- Slide 4: Confidencialidade
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  3,
  'C de Confidencialidade',
  '<div class="highlight-box">
     <p class="fs-5"><strong>Confidencialidade</strong> é a propriedade de que a informação não esteja disponível ou seja revelada a indivíduos, entidades ou processos não autorizados.</p>
     <p class="text-end">- ABNT NBR ISO/IEC 27001:2013</p>
   </div>
   <p>Em outras palavras: garantir que apenas as pessoas certas tenham acesso à informação. O maior desafio é impedir vazamentos e acessos não autorizados.</p>',
  'texto',
  'bi-eye-slash-fill',
  5
);

-- Slide 5: Integridade
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  4,
  'I de Integridade',
  '<div class="highlight-box">
     <p class="fs-5"><strong>Integridade</strong> é a propriedade de salvaguarda da exatidão e completeza de ativos.</p>
     <p class="text-end">- ABNT NBR ISO/IEC 27001:2013</p>
   </div>
   <p>Significa garantir que a informação não foi modificada de forma não autorizada. A informação que recebemos deve ser exatamente a mesma que foi enviada.</p>',
  'texto',
  'bi-check-circle-fill',
  4
);

-- Slide 6: Disponibilidade
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  5,
  'D de Disponibilidade',
  '<p><strong>Disponibilidade</strong> é a propriedade de que a informação esteja acessível e utilizável sob demanda por uma entidade autorizada.</p>
   <p>De nada adianta a informação ser secreta e íntegra se as pessoas que precisam dela não conseguem acessá-la quando necessário. A indisponibilidade de um sistema pode paralisar uma empresa.</p>',
  'texto',
  'bi-power',
  4
);

-- Slide 7: Vulnerabilidade
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  6,
  'O que é uma Vulnerabilidade?',
  '<div class="highlight-box">
     <p>"A segurança de um ativo ou de uma empresa é tão forte quanto o seu elo mais fraco da corrente."</p>
   </div>
   <p>Uma <strong>vulnerabilidade</strong> é exatamente isso: um ponto fraco, uma falha em um sistema, processo ou controle que pode ser explorada por um invasor.</p>
   <p>Vulnerabilidades podem existir em softwares desatualizados, senhas fracas, redes mal configuradas ou até mesmo em pessoas (desatenção, falta de treinamento).</p>',
  'texto',
  'bi-unlock-fill',
  5
);

-- Slide 8: Ameaça
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  7,
  'O que é uma Ameaça?',
  '<p>Uma <strong>ameaça</strong> não é o ataque em si, mas o <strong>potencial</strong> de que algo ruim aconteça.</p>
   <p>Pense na ameaça de um assalto: ela sempre existe. O incidente (o assalto) só acontece quando um ladrão (agente de ameaça) explora uma vulnerabilidade (uma pessoa andando sozinha em um local escuro).</p>
   <p>Em segurança digital, o vazamento de dados é uma ameaça; o incidente ocorre quando um cracker explora uma vulnerabilidade para tornar essa ameaça uma realidade.</p>',
  'texto',
  'bi-cloud-lightning-rain-fill',
  5
);

-- Slide 9: Exploit
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  8,
  'O que é um Exploit?',
  '<p>Um <strong>exploit</strong> é a ferramenta do atacante. É um software, um trecho de código ou uma sequência de comandos que foi criado especificamente para tirar proveito de uma vulnerabilidade.</p>
   <p>Quando você ouve que "hackers exploraram uma falha no sistema", eles provavelmente usaram um <strong>exploit</strong> para conseguir isso.</p>
   <p>Para cada vulnerabilidade descoberta, muitas vezes surge um exploit correspondente.</p>',
  'texto',
  'bi-code-slash',
  4
);

-- Slide 10: Resumo
INSERT INTO syllab_slides (conteudo_id, ordem, titulo, conteudo_html, tipo_midia, icone, duracao_estimada)
VALUES (
  'SEU_CONTEUDO_ID_AQUI',
  9,
  'Resumo da Aula',
  '<p>Nesta aula, aprendemos os conceitos mais essenciais da segurança da informação:</p>
   <ul>
     <li>A segurança se baseia na proteção da <strong>Confidencialidade, Integridade e Disponibilidade (C.I.D.)</strong> da informação.</li>
     <li>Incidentes de segurança acontecem quando uma <strong>Ameaça</strong> se concretiza.</li>
     <li>Isso ocorre porque um agente malicioso usa um <strong>Exploit</strong> para atacar uma <strong>Vulnerabilidade</strong> em um sistema.</li>
     <li>Proteger uma organização significa identificar e mitigar as vulnerabilidades para reduzir os riscos.</li>
   </ul>
   <p class="lead text-center mt-4">Obrigado pela atenção!</p>',
  'texto',
  'bi-clipboard2-check-fill',
  5
);

-- Atualizar o conteúdo para indicar que tem slides
UPDATE syllab_conteudos
SET tem_slides = true
WHERE id = 'SEU_CONTEUDO_ID_AQUI';

-- Verificar os slides criados
SELECT 
  ordem,
  titulo,
  icone,
  duracao_estimada,
  tipo_midia
FROM syllab_slides
WHERE conteudo_id = 'SEU_CONTEUDO_ID_AQUI'
ORDER BY ordem;
