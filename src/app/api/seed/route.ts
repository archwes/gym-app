import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '@/lib/db';
import { json } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await initializeDatabase();

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // Check if already seeded
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    if (Number(userCount.rows[0].count) > 0 && !force) {
      return json({ message: 'Database already seeded', skipped: true });
    }

    if (force) {
      // Clear all data in correct order (respecting foreign keys)
      await db.execute('DELETE FROM notifications');
      await db.execute('DELETE FROM student_progress');
      await db.execute('DELETE FROM schedule_sessions');
      await db.execute('DELETE FROM workout_exercises');
      await db.execute('DELETE FROM workout_plans');
      await db.execute('DELETE FROM exercises');
      await db.execute('DELETE FROM users');
    }

    const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

    // --- Users ---
    const adminId = uuidv4();
    const trainerId = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const student3Id = uuidv4();
    const student4Id = uuidv4();

    const users = [
      [adminId, 'Administrador', 'admin@fitpro.com', hashPassword('123456'), 'admin', '👑', '(11) 90000-0000', null],
      [trainerId, 'Carlos Silva', 'carlos@fitpro.com', hashPassword('123456'), 'trainer', '💪', '(11) 99999-1234', null],
      [student1Id, 'Ana Oliveira', 'ana@email.com', hashPassword('123456'), 'student', '🏋️‍♀️', '(11) 98888-5678', trainerId],
      [student2Id, 'Pedro Santos', 'pedro@email.com', hashPassword('123456'), 'student', '🏃‍♂️', '(11) 97777-9012', trainerId],
      [student3Id, 'Mariana Costa', 'mariana@email.com', hashPassword('123456'), 'student', '🧘‍♀️', '(11) 96666-3456', trainerId],
      [student4Id, 'Lucas Ferreira', 'lucas@email.com', hashPassword('123456'), 'student', '💯', '(11) 95555-7890', trainerId],
    ];

    for (const u of users) {
      await db.execute({
        sql: 'INSERT INTO users (id, name, email, password, role, avatar, phone, trainer_id, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
        args: u,
      });
    }

    // --- Exercises ---
    const exercises = [
      // === PEITO ===
      { name: 'Supino Reto com Barra (Bench Press)', muscleGroup: 'Peito', equipment: 'Barra e Banco', description: 'Deite no banco reto, segure a barra na largura dos ombros. Desça até o peito e empurre para cima.', difficulty: 'Intermediário' },
      { name: 'Supino Inclinado com Barra', muscleGroup: 'Peito', equipment: 'Barra e Banco Inclinado', description: 'No banco inclinado a 30-45°, desça a barra até a parte superior do peito e empurre.', difficulty: 'Intermediário' },
      { name: 'Supino Declinado com Barra', muscleGroup: 'Peito', equipment: 'Barra e Banco Declinado', description: 'No banco declinado, desça a barra até a parte inferior do peito e empurre.', difficulty: 'Intermediário' },
      { name: 'Supino Reto com Halteres (Dumbbell Press)', muscleGroup: 'Peito', equipment: 'Halteres e Banco', description: 'Deitado no banco reto, empurre os halteres para cima com os cotovelos a 45°.', difficulty: 'Intermediário' },
      { name: 'Supino Inclinado com Halteres', muscleGroup: 'Peito', equipment: 'Halteres e Banco Inclinado', description: 'No banco inclinado, empurre os halteres para cima focando no peitoral superior.', difficulty: 'Intermediário' },
      { name: 'Crucifixo com Halteres (Dumbbell Fly)', muscleGroup: 'Peito', equipment: 'Halteres e Banco', description: 'Deitado no banco, abra os braços com os halteres em arco amplo.', difficulty: 'Intermediário' },
      { name: 'Crucifixo no Cabo (Cable Fly)', muscleGroup: 'Peito', equipment: 'Cabos', description: 'Em pé entre duas polias, puxe os cabos em arco à frente do peito.', difficulty: 'Intermediário' },
      { name: 'Crossover (Cable Crossover)', muscleGroup: 'Peito', equipment: 'Cabos', description: 'Em pé entre as polias altas, cruze os cabos à frente do corpo contraindo o peito.', difficulty: 'Intermediário' },
      { name: 'Flexão de Braço (Push-up)', muscleGroup: 'Peito', equipment: 'Nenhum', description: 'Apoie as mãos no chão na largura dos ombros e flexione os braços descendo o corpo.', difficulty: 'Iniciante' },
      { name: 'Mergulho em Paralelas (Dips)', muscleGroup: 'Peito', equipment: 'Paralelas', description: 'Apoie-se nas barras paralelas e desça o corpo inclinando o tronco à frente.', difficulty: 'Avançado' },
      { name: 'Peck Deck (Voador)', muscleGroup: 'Peito', equipment: 'Máquina', description: 'Sentado na máquina, feche os braços contraindo o peitoral.', difficulty: 'Iniciante' },

      // === COSTAS ===
      { name: 'Puxada Frontal (Lat Pulldown)', muscleGroup: 'Costas', equipment: 'Pulley', description: 'Sentado no pulley, puxe a barra até a altura do peito com pegada aberta.', difficulty: 'Iniciante' },
      { name: 'Puxada pela Nuca', muscleGroup: 'Costas', equipment: 'Pulley', description: 'Sentado no pulley, puxe a barra atrás da cabeça com pegada aberta.', difficulty: 'Intermediário' },
      { name: 'Puxada Supinada (Close Grip Pulldown)', muscleGroup: 'Costas', equipment: 'Pulley', description: 'Sentado no pulley, puxe com pegada supinada (palmas voltadas para você).', difficulty: 'Iniciante' },
      { name: 'Puxada Triângulo', muscleGroup: 'Costas', equipment: 'Pulley', description: 'Sentado no pulley com o triângulo, puxe até o peito focando no dorsal.', difficulty: 'Iniciante' },
      { name: 'Remada Curvada com Barra (Bent-Over Row)', muscleGroup: 'Costas', equipment: 'Barra', description: 'Incline o tronco a 45°, puxe a barra em direção ao abdômen.', difficulty: 'Intermediário' },
      { name: 'Remada Unilateral com Halter (One-Arm Row)', muscleGroup: 'Costas', equipment: 'Halter e Banco', description: 'Apoie um joelho e mão no banco, puxe o halter com o braço oposto.', difficulty: 'Intermediário' },
      { name: 'Remada Cavalinha (T-Bar Row)', muscleGroup: 'Costas', equipment: 'Barra T', description: 'Incline o tronco e puxe a barra T em direção ao peito.', difficulty: 'Intermediário' },
      { name: 'Remada Baixa no Cabo (Seated Cable Row)', muscleGroup: 'Costas', equipment: 'Cabos', description: 'Sentado, puxe o cabo em direção ao abdômen mantendo as costas retas.', difficulty: 'Iniciante' },
      { name: 'Barra Fixa (Pull-up)', muscleGroup: 'Costas', equipment: 'Barra Fixa', description: 'Pendure-se na barra com pegada pronada e puxe o corpo até o queixo passar a barra.', difficulty: 'Avançado' },
      { name: 'Levantamento Terra (Deadlift)', muscleGroup: 'Costas', equipment: 'Barra', description: 'Pés na largura dos quadris, segure a barra. Levante mantendo as costas retas até ficar em pé.', difficulty: 'Avançado' },
      { name: 'Pullover com Halter', muscleGroup: 'Costas', equipment: 'Halter e Banco', description: 'Deitado no banco, segure o halter acima do peito e leve atrás da cabeça em arco.', difficulty: 'Intermediário' },

      // === OMBROS ===
      { name: 'Desenvolvimento com Halteres (Shoulder Press)', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Sentado ou em pé, segure os halteres na altura dos ombros e pressione para cima.', difficulty: 'Intermediário' },
      { name: 'Desenvolvimento com Barra (Military Press)', muscleGroup: 'Ombros', equipment: 'Barra', description: 'Em pé, pressione a barra acima da cabeça partindo dos ombros.', difficulty: 'Intermediário' },
      { name: 'Desenvolvimento Arnold (Arnold Press)', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Inicie com palmas voltadas para você e gire enquanto pressiona para cima.', difficulty: 'Intermediário' },
      { name: 'Elevação Lateral (Lateral Raise)', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Em pé, eleve os halteres lateralmente até a altura dos ombros.', difficulty: 'Iniciante' },
      { name: 'Elevação Frontal (Front Raise)', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Em pé, eleve os halteres à frente do corpo até a altura dos ombros.', difficulty: 'Iniciante' },
      { name: 'Crucifixo Inverso (Reverse Fly)', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Inclinado, abra os braços lateralmente focando no deltóide posterior.', difficulty: 'Intermediário' },
      { name: 'Remada Alta (Upright Row)', muscleGroup: 'Ombros', equipment: 'Barra ou Halteres', description: 'Em pé, puxe a barra rente ao corpo até a altura do queixo.', difficulty: 'Intermediário' },
      { name: 'Elevação Lateral no Cabo', muscleGroup: 'Ombros', equipment: 'Cabos', description: 'Em pé ao lado da polia baixa, eleve o cabo lateralmente.', difficulty: 'Iniciante' },
      { name: 'Face Pull', muscleGroup: 'Ombros', equipment: 'Cabos', description: 'Na polia alta com corda, puxe em direção ao rosto abrindo os cotovelos.', difficulty: 'Iniciante' },

      // === BÍCEPS ===
      { name: 'Rosca Direta com Barra (Barbell Curl)', muscleGroup: 'Bíceps', equipment: 'Barra', description: 'Em pé, segure a barra com pegada supinada e flexione os cotovelos.', difficulty: 'Iniciante' },
      { name: 'Rosca Alternada com Halteres (Alternate Curl)', muscleGroup: 'Bíceps', equipment: 'Halteres', description: 'Em pé, flexione alternadamente um braço de cada vez com halteres.', difficulty: 'Iniciante' },
      { name: 'Rosca Martelo (Hammer Curl)', muscleGroup: 'Bíceps', equipment: 'Halteres', description: 'Em pé, flexione os cotovelos com pegada neutra (palmas voltadas uma para outra).', difficulty: 'Iniciante' },
      { name: 'Rosca Scott (Preacher Curl)', muscleGroup: 'Bíceps', equipment: 'Barra e Banco Scott', description: 'Apoie os braços no banco Scott e flexione com a barra EZ.', difficulty: 'Intermediário' },
      { name: 'Rosca Concentrada (Concentration Curl)', muscleGroup: 'Bíceps', equipment: 'Halter', description: 'Sentado, apoie o cotovelo na coxa interna e flexione o halter.', difficulty: 'Iniciante' },
      { name: 'Rosca no Cabo (Cable Curl)', muscleGroup: 'Bíceps', equipment: 'Cabos', description: 'Em pé na polia baixa, flexione os cotovelos puxando o cabo.', difficulty: 'Iniciante' },
      { name: 'Rosca 21 (21s)', muscleGroup: 'Bíceps', equipment: 'Barra', description: '7 repetições parciais inferiores, 7 superiores e 7 completas em sequência.', difficulty: 'Avançado' },
      { name: 'Rosca Inversa (Reverse Curl)', muscleGroup: 'Bíceps', equipment: 'Barra', description: 'Em pé, flexione com pegada pronada (palmas para baixo) focando no braquiorradial.', difficulty: 'Intermediário' },

      // === TRÍCEPS ===
      { name: 'Tríceps Pulley (Pushdown)', muscleGroup: 'Tríceps', equipment: 'Cabo/Pulley', description: 'No pulley, segure a barra com pegada pronada e estenda os cotovelos.', difficulty: 'Iniciante' },
      { name: 'Tríceps Corda (Rope Pushdown)', muscleGroup: 'Tríceps', equipment: 'Cabo/Corda', description: 'No pulley com corda, estenda os cotovelos abrindo as mãos na parte final.', difficulty: 'Iniciante' },
      { name: 'Tríceps Francês (Skull Crusher)', muscleGroup: 'Tríceps', equipment: 'Barra EZ e Banco', description: 'Deitado, desça a barra até a testa flexionando apenas os cotovelos.', difficulty: 'Intermediário' },
      { name: 'Tríceps Testa com Halteres', muscleGroup: 'Tríceps', equipment: 'Halteres e Banco', description: 'Deitado, desça os halteres até a lateral da cabeça e estenda.', difficulty: 'Intermediário' },
      { name: 'Tríceps Coice (Kickback)', muscleGroup: 'Tríceps', equipment: 'Halter', description: 'Inclinado, estenda o cotovelo para trás segurando o halter.', difficulty: 'Iniciante' },
      { name: 'Mergulho no Banco (Bench Dips)', muscleGroup: 'Tríceps', equipment: 'Banco', description: 'Apoie as mãos no banco atrás de você e flexione os cotovelos.', difficulty: 'Iniciante' },
      { name: 'Tríceps na Paralela (Dips for Triceps)', muscleGroup: 'Tríceps', equipment: 'Paralelas', description: 'Nas barras paralelas com tronco ereto, desça e suba focando no tríceps.', difficulty: 'Avançado' },

      // === QUADRÍCEPS ===
      { name: 'Agachamento Livre (Squat)', muscleGroup: 'Quadríceps', equipment: 'Barra', description: 'Posicione a barra nos trapézios, pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão.', difficulty: 'Intermediário' },
      { name: 'Agachamento Frontal (Front Squat)', muscleGroup: 'Quadríceps', equipment: 'Barra', description: 'Barra apoiada nos deltóides frontais, agache mantendo o tronco ereto.', difficulty: 'Avançado' },
      { name: 'Agachamento Hack (Hack Squat)', muscleGroup: 'Quadríceps', equipment: 'Máquina Hack', description: 'Na máquina hack, posicione os ombros nos apoios e agache.', difficulty: 'Intermediário' },
      { name: 'Agachamento Búlgaro (Bulgarian Split Squat)', muscleGroup: 'Quadríceps', equipment: 'Halteres e Banco', description: 'Apoie um pé no banco atrás e agache com a perna da frente.', difficulty: 'Intermediário' },
      { name: 'Agachamento com Halter Goblet (Goblet Squat)', muscleGroup: 'Quadríceps', equipment: 'Halter ou Kettlebell', description: 'Segure o halter junto ao peito e agache.', difficulty: 'Iniciante' },
      { name: 'Leg Press 45°', muscleGroup: 'Quadríceps', equipment: 'Leg Press', description: 'Sentado na máquina, posicione os pés na plataforma e empurre.', difficulty: 'Iniciante' },
      { name: 'Cadeira Extensora (Leg Extension)', muscleGroup: 'Quadríceps', equipment: 'Máquina', description: 'Sentado na máquina, estenda os joelhos elevando o peso.', difficulty: 'Iniciante' },
      { name: 'Passada (Lunge)', muscleGroup: 'Quadríceps', equipment: 'Halteres ou Barra', description: 'Dê um passo à frente e flexione ambos os joelhos a 90°.', difficulty: 'Intermediário' },
      { name: 'Avanço (Walking Lunge)', muscleGroup: 'Quadríceps', equipment: 'Halteres ou Barra', description: 'Passada caminhando, alternando as pernas a cada repetição.', difficulty: 'Intermediário' },

      // === POSTERIOR DE COXA ===
      { name: 'Stiff (Stiff-Leg Deadlift)', muscleGroup: 'Posterior', equipment: 'Barra ou Halteres', description: 'Em pé, desça o tronco mantendo as pernas semi-estendidas.', difficulty: 'Intermediário' },
      { name: 'Mesa Flexora (Lying Leg Curl)', muscleGroup: 'Posterior', equipment: 'Máquina', description: 'Deitado de bruços na máquina, flexione os joelhos elevando o peso.', difficulty: 'Iniciante' },
      { name: 'Cadeira Flexora (Seated Leg Curl)', muscleGroup: 'Posterior', equipment: 'Máquina', description: 'Sentado na máquina, flexione os joelhos puxando o peso.', difficulty: 'Iniciante' },
      { name: 'Levantamento Terra Romeno (Romanian Deadlift)', muscleGroup: 'Posterior', equipment: 'Barra', description: 'Em pé, desça a barra mantendo próxima às pernas com leve flexão dos joelhos.', difficulty: 'Intermediário' },
      { name: 'Bom Dia (Good Morning)', muscleGroup: 'Posterior', equipment: 'Barra', description: 'Barra nos trapézios, incline o tronco à frente mantendo as costas retas.', difficulty: 'Intermediário' },

      // === GLÚTEOS ===
      { name: 'Hip Thrust', muscleGroup: 'Glúteos', equipment: 'Barra e Banco', description: 'Apoie as costas no banco, barra sobre o quadril. Eleve o quadril contraindo os glúteos.', difficulty: 'Intermediário' },
      { name: 'Glúteo no Cabo (Cable Kickback)', muscleGroup: 'Glúteos', equipment: 'Cabos', description: 'Na polia baixa, estenda a perna para trás contra a resistência do cabo.', difficulty: 'Iniciante' },
      { name: 'Elevação Pélvica (Glute Bridge)', muscleGroup: 'Glúteos', equipment: 'Nenhum', description: 'Deitado com os pés no chão, eleve o quadril contraindo os glúteos.', difficulty: 'Iniciante' },
      { name: 'Abdução de Quadril na Máquina (Hip Abduction)', muscleGroup: 'Glúteos', equipment: 'Máquina', description: 'Sentado na máquina, abra as pernas contra a resistência.', difficulty: 'Iniciante' },
      { name: 'Agachamento Sumô (Sumo Squat)', muscleGroup: 'Glúteos', equipment: 'Halter ou Barra', description: 'Pés bem afastados, ponteiras para fora, agache segurando o peso.', difficulty: 'Intermediário' },

      // === PANTURRILHA ===
      { name: 'Panturrilha em Pé (Standing Calf Raise)', muscleGroup: 'Panturrilha', equipment: 'Máquina ou Step', description: 'Em pé na máquina ou step, eleve os calcanhares o máximo possível.', difficulty: 'Iniciante' },
      { name: 'Panturrilha Sentado (Seated Calf Raise)', muscleGroup: 'Panturrilha', equipment: 'Máquina', description: 'Sentado na máquina de panturrilha, eleve os calcanhares.', difficulty: 'Iniciante' },
      { name: 'Panturrilha no Leg Press', muscleGroup: 'Panturrilha', equipment: 'Leg Press', description: 'No leg press, apoie apenas as pontas dos pés e estenda os tornozelos.', difficulty: 'Iniciante' },
      { name: 'Panturrilha Unilateral em Pé', muscleGroup: 'Panturrilha', equipment: 'Step ou Degrau', description: 'Em pé sobre um pé só no degrau, eleve e desça o calcanhar.', difficulty: 'Intermediário' },

      // === ABDÔMEN ===
      { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', equipment: 'Nenhum', description: 'Deitado, flexione o tronco elevando os ombros do chão.', difficulty: 'Iniciante' },
      { name: 'Abdominal Infra (Leg Raise)', muscleGroup: 'Abdômen', equipment: 'Nenhum', description: 'Deitado, eleve as pernas mantendo-as estendidas.', difficulty: 'Intermediário' },
      { name: 'Abdominal na Máquina (Machine Crunch)', muscleGroup: 'Abdômen', equipment: 'Máquina', description: 'Sentado na máquina, flexione o tronco contra a resistência.', difficulty: 'Iniciante' },
      { name: 'Abdominal Bicicleta (Bicycle Crunch)', muscleGroup: 'Abdômen', equipment: 'Nenhum', description: 'Deitado, pedale no ar tocando cotovelo no joelho oposto alternadamente.', difficulty: 'Intermediário' },
      { name: 'Elevação de Pernas na Barra (Hanging Leg Raise)', muscleGroup: 'Abdômen', equipment: 'Barra Fixa', description: 'Pendurado na barra, eleve as pernas até 90° ou mais.', difficulty: 'Avançado' },
      { name: 'Abdominal Canivete (V-Up)', muscleGroup: 'Abdômen', equipment: 'Nenhum', description: 'Deitado, eleve simultaneamente tronco e pernas tocando os pés.', difficulty: 'Intermediário' },

      // === CORE ===
      { name: 'Prancha Frontal (Plank)', muscleGroup: 'Core', equipment: 'Nenhum', description: 'Apoie-se nos antebraços e pontas dos pés, mantendo o corpo reto.', difficulty: 'Iniciante' },
      { name: 'Prancha Lateral (Side Plank)', muscleGroup: 'Core', equipment: 'Nenhum', description: 'Apoie-se em um antebraço de lado, mantendo o corpo alinhado.', difficulty: 'Intermediário' },
      { name: 'Prancha com Rotação (Plank Rotation)', muscleGroup: 'Core', equipment: 'Nenhum', description: 'Na posição de prancha, gire o tronco elevando um braço ao teto.', difficulty: 'Intermediário' },
      { name: 'Roda Abdominal (Ab Wheel Rollout)', muscleGroup: 'Core', equipment: 'Roda Abdominal', description: 'Ajoelhado, role a roda à frente estendendo o corpo e retorne.', difficulty: 'Avançado' },
      { name: 'Pallof Press', muscleGroup: 'Core', equipment: 'Cabos', description: 'Em pé ao lado da polia, estenda os braços à frente resistindo à rotação.', difficulty: 'Intermediário' },

      // === TRAPÉZIO ===
      { name: 'Encolhimento com Barra (Barbell Shrug)', muscleGroup: 'Trapézio', equipment: 'Barra', description: 'Em pé, segure a barra e eleve os ombros em direção às orelhas.', difficulty: 'Iniciante' },
      { name: 'Encolhimento com Halteres (Dumbbell Shrug)', muscleGroup: 'Trapézio', equipment: 'Halteres', description: 'Em pé com halteres, eleve os ombros contraindo o trapézio.', difficulty: 'Iniciante' },

      // === ANTEBRAÇO ===
      { name: 'Rosca de Punho (Wrist Curl)', muscleGroup: 'Antebraço', equipment: 'Barra ou Halteres', description: 'Sentado, apoie os antebraços nas coxas e flexione os punhos para cima.', difficulty: 'Iniciante' },
      { name: 'Rosca de Punho Inversa (Reverse Wrist Curl)', muscleGroup: 'Antebraço', equipment: 'Barra ou Halteres', description: 'Sentado com pegada pronada, estenda os punhos para cima.', difficulty: 'Iniciante' },

      // === CORPO INTEIRO ===
      { name: 'Burpee', muscleGroup: 'Corpo Inteiro', equipment: 'Nenhum', description: 'Agache, coloque as mãos no chão, estenda as pernas, faça flexão, volte e salte.', difficulty: 'Avançado' },
      { name: 'Thruster', muscleGroup: 'Corpo Inteiro', equipment: 'Barra ou Halteres', description: 'Combine um agachamento frontal seguido de um desenvolvimento acima da cabeça.', difficulty: 'Avançado' },
      { name: 'Kettlebell Swing', muscleGroup: 'Corpo Inteiro', equipment: 'Kettlebell', description: 'Segure o kettlebell entre as pernas e impulsione o quadril para balançá-lo à frente.', difficulty: 'Intermediário' },
      { name: 'Clean and Press (Arremesso e Desenvolvimento)', muscleGroup: 'Corpo Inteiro', equipment: 'Barra', description: 'Puxe a barra do chão até os ombros e pressione acima da cabeça.', difficulty: 'Avançado' },
      { name: 'Mountain Climber (Escalador)', muscleGroup: 'Corpo Inteiro', equipment: 'Nenhum', description: 'Na posição de prancha, alterne os joelhos em direção ao peito rapidamente.', difficulty: 'Intermediário' },
      { name: 'Turkish Get-Up (Levantamento Turco)', muscleGroup: 'Corpo Inteiro', equipment: 'Kettlebell ou Halter', description: 'Deitado segurando o peso com um braço estendido, levante-se mantendo o braço acima.', difficulty: 'Avançado' },
    ];

    const exerciseIds: Record<string, string> = {};
    for (const ex of exercises) {
      const id = uuidv4();
      exerciseIds[ex.name] = id;
      await db.execute({
        sql: 'INSERT INTO exercises (id, name, muscle_group, equipment, description, difficulty, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [id, ex.name, ex.muscleGroup, ex.equipment, ex.description, ex.difficulty, trainerId],
      });
    }

    // --- Workout Plans ---
    // Plan A - Peito & Triceps for Ana
    const planAId = uuidv4();
    await db.execute({
      sql: 'INSERT INTO workout_plans (id, name, description, trainer_id, student_id, day_of_week, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [planAId, 'Treino A - Peito e Tríceps', 'Foco em peito e tríceps com exercícios compostos e isolados', trainerId, student1Id, '["Segunda","Quinta"]', 1],
    });
    const planAExercises = [
      [exerciseIds['Supino Reto com Barra (Bench Press)'], 4, '8-12', 90, '40kg', 0],
      [exerciseIds['Crucifixo com Halteres (Dumbbell Fly)'], 3, '12-15', 60, '14kg', 1],
      [exerciseIds['Tríceps Pulley (Pushdown)'], 3, '12-15', 60, '25kg', 2],
      [exerciseIds['Abdominal Crunch'], 3, '20', 45, null, 3],
    ];
    for (const we of planAExercises) {
      await db.execute({
        sql: 'INSERT INTO workout_exercises (id, workout_plan_id, exercise_id, sets, reps, rest_seconds, weight, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), planAId, ...we],
      });
    }

    // Plan B - Costas & Biceps for Ana
    const planBId = uuidv4();
    await db.execute({
      sql: 'INSERT INTO workout_plans (id, name, description, trainer_id, student_id, day_of_week, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [planBId, 'Treino B - Costas e Bíceps', 'Foco em costas e bíceps para desenvolvimento da parte posterior', trainerId, student1Id, '["Terça","Sexta"]', 1],
    });
    const planBExercises = [
      [exerciseIds['Puxada Frontal (Lat Pulldown)'], 4, '8-12', 90, '50kg', 0],
      [exerciseIds['Remada Curvada com Barra (Bent-Over Row)'], 4, '8-12', 90, '40kg', 1],
      [exerciseIds['Rosca Direta com Barra (Barbell Curl)'], 3, '10-12', 60, '12kg', 2],
      [exerciseIds['Prancha Frontal (Plank)'], 3, '45s', 30, null, 3],
    ];
    for (const we of planBExercises) {
      await db.execute({
        sql: 'INSERT INTO workout_exercises (id, workout_plan_id, exercise_id, sets, reps, rest_seconds, weight, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), planBId, ...we],
      });
    }

    // Plan C - Pernas for Ana
    const planCId = uuidv4();
    await db.execute({
      sql: 'INSERT INTO workout_plans (id, name, description, trainer_id, student_id, day_of_week, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [planCId, 'Treino C - Pernas', 'Treino completo de membros inferiores', trainerId, student1Id, '["Quarta","Sábado"]', 1],
    });
    const planCExercises = [
      [exerciseIds['Agachamento Livre (Squat)'], 4, '8-10', 120, '60kg', 0],
      [exerciseIds['Leg Press 45°'], 4, '10-12', 90, '120kg', 1],
      [exerciseIds['Stiff (Stiff-Leg Deadlift)'], 3, '10-12', 90, '30kg', 2],
      [exerciseIds['Hip Thrust'], 4, '12-15', 60, '50kg', 3],
      [exerciseIds['Panturrilha em Pé (Standing Calf Raise)'], 4, '15-20', 45, '40kg', 4],
    ];
    for (const we of planCExercises) {
      await db.execute({
        sql: 'INSERT INTO workout_exercises (id, workout_plan_id, exercise_id, sets, reps, rest_seconds, weight, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), planCId, ...we],
      });
    }

    // Plan D - Full Body for Pedro
    const planDId = uuidv4();
    await db.execute({
      sql: 'INSERT INTO workout_plans (id, name, description, trainer_id, student_id, day_of_week, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [planDId, 'Treino Full Body', 'Treino completo para todo o corpo, ideal para iniciantes', trainerId, student2Id, '["Segunda","Quarta","Sexta"]', 1],
    });
    const planDExercises = [
      [exerciseIds['Supino Reto com Barra (Bench Press)'], 3, '10-12', 90, '30kg', 0],
      [exerciseIds['Puxada Frontal (Lat Pulldown)'], 3, '10-12', 90, '40kg', 1],
      [exerciseIds['Agachamento Livre (Squat)'], 3, '10-12', 90, '40kg', 2],
      [exerciseIds['Desenvolvimento com Halteres (Shoulder Press)'], 3, '10-12', 60, '10kg', 3],
      [exerciseIds['Prancha Frontal (Plank)'], 3, '30s', 30, null, 4],
    ];
    for (const we of planDExercises) {
      await db.execute({
        sql: 'INSERT INTO workout_exercises (id, workout_plan_id, exercise_id, sets, reps, rest_seconds, weight, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), planDId, ...we],
      });
    }

    // --- Schedule Sessions ---
    const sessions = [
      [trainerId, student1Id, '2026-02-20', '07:00', 60, 'Treino', 'scheduled'],
      [trainerId, student2Id, '2026-02-20', '08:30', 60, 'Treino', 'scheduled'],
      [trainerId, student3Id, '2026-02-20', '10:00', 45, 'Avaliação', 'scheduled'],
      [trainerId, student1Id, '2026-02-21', '07:00', 60, 'Treino', 'scheduled'],
      [trainerId, student4Id, '2026-02-21', '09:00', 60, 'Consulta', 'scheduled'],
      [trainerId, student2Id, '2026-02-19', '08:30', 60, 'Treino', 'completed'],
      [trainerId, student1Id, '2026-02-18', '07:00', 60, 'Treino', 'completed'],
    ];
    for (const s of sessions) {
      await db.execute({
        sql: 'INSERT INTO schedule_sessions (id, trainer_id, student_id, date, time, duration, type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), ...s],
      });
    }

    // --- Student Progress ---
    const progressData = [
      [student1Id, '2025-09-01', 68, 28, 88, 72, 98, 28, 56],
      [student1Id, '2025-10-01', 66.5, 26, 89, 70, 97, 28.5, 56.5],
      [student1Id, '2025-11-01', 65, 24, 90, 68, 96, 29, 57],
      [student1Id, '2025-12-01', 64, 22, 91, 66, 95, 30, 58],
      [student1Id, '2026-01-01', 63, 21, 91.5, 65, 94, 30.5, 58.5],
      [student1Id, '2026-02-01', 62.5, 20, 92, 64, 93, 31, 59],
      [student2Id, '2025-11-01', 85, 22, 102, 88, 100, 34, 60],
      [student2Id, '2025-12-01', 83, 20, 103, 86, 99, 35, 61],
      [student2Id, '2026-01-01', 82, 19, 104, 84, 98, 36, 62],
      [student2Id, '2026-02-01', 81, 18, 105, 82, 97, 37, 63],
    ];
    for (const p of progressData) {
      await db.execute({
        sql: 'INSERT INTO student_progress (id, student_id, date, weight, body_fat, chest, waist, hips, arms, thighs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), ...p],
      });
    }

    // --- Notifications ---
    const notifications = [
      [student1Id, 'Novo treino disponível', 'Carlos criou um novo plano de treino para você!', 'success', 0],
      [student1Id, 'Sessão amanhã', 'Lembrete: Treino amanhã às 07:00 com Carlos.', 'info', 0],
      [trainerId, 'Avaliação pendente', 'Avaliação de Mariana Costa agendada para hoje às 10:00.', 'warning', 0],
      [trainerId, 'Novo aluno', 'Lucas Ferreira se cadastrou e está aguardando um plano de treino.', 'info', 1],
    ];
    for (const n of notifications) {
      await db.execute({
        sql: 'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, ?)',
        args: [uuidv4(), ...n],
      });
    }

    return json({ message: 'Database seeded successfully!' });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
}
