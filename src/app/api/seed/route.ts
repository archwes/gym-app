import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '@/lib/db';
import { json } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await initializeDatabase();

    // Check if already seeded
    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    if (Number(userCount.rows[0].count) > 0) {
      return json({ message: 'Database already seeded', skipped: true });
    }

    const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

    // --- Users ---
    const trainerId = uuidv4();
    const student1Id = uuidv4();
    const student2Id = uuidv4();
    const student3Id = uuidv4();
    const student4Id = uuidv4();

    const users = [
      [trainerId, 'Carlos Silva', 'carlos@fitpro.com', hashPassword('123456'), 'trainer', '💪', '(11) 99999-1234', null],
      [student1Id, 'Ana Oliveira', 'ana@email.com', hashPassword('123456'), 'student', '🏋️‍♀️', '(11) 98888-5678', trainerId],
      [student2Id, 'Pedro Santos', 'pedro@email.com', hashPassword('123456'), 'student', '🏃‍♂️', '(11) 97777-9012', trainerId],
      [student3Id, 'Mariana Costa', 'mariana@email.com', hashPassword('123456'), 'student', '🧘‍♀️', '(11) 96666-3456', trainerId],
      [student4Id, 'Lucas Ferreira', 'lucas@email.com', hashPassword('123456'), 'student', '💯', '(11) 95555-7890', trainerId],
    ];

    for (const u of users) {
      await db.execute({
        sql: 'INSERT INTO users (id, name, email, password, role, avatar, phone, trainer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: u,
      });
    }

    // --- Exercises ---
    const exercises = [
      { name: 'Supino Reto com Barra', muscleGroup: 'Peito', equipment: 'Barra e Banco', description: 'Deite no banco reto, segure a barra na largura dos ombros. Desça até o peito e empurre para cima.', difficulty: 'Intermediário' },
      { name: 'Agachamento Livre', muscleGroup: 'Quadríceps', equipment: 'Barra', description: 'Posicione a barra nos trapézios, pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão.', difficulty: 'Intermediário' },
      { name: 'Levantamento Terra', muscleGroup: 'Costas', equipment: 'Barra', description: 'Pés na largura dos quadris, segure a barra. Levante mantendo as costas retas até ficar em pé.', difficulty: 'Avançado' },
      { name: 'Desenvolvimento com Halteres', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Sentado ou em pé, segure os halteres na altura dos ombros e pressione para cima.', difficulty: 'Intermediário' },
      { name: 'Rosca Direta', muscleGroup: 'Bíceps', equipment: 'Barra ou Halteres', description: 'Em pé, segure a barra com pegada supinada e flexione os cotovelos.', difficulty: 'Iniciante' },
      { name: 'Tríceps Pulley', muscleGroup: 'Tríceps', equipment: 'Cabo/Pulley', description: 'No pulley, segure a barra com pegada pronada e estenda os cotovelos.', difficulty: 'Iniciante' },
      { name: 'Puxada Frontal', muscleGroup: 'Costas', equipment: 'Pulley', description: 'Sentado no pulley, puxe a barra até a altura do peito com pegada aberta.', difficulty: 'Iniciante' },
      { name: 'Leg Press 45°', muscleGroup: 'Quadríceps', equipment: 'Leg Press', description: 'Sentado na máquina, posicione os pés na plataforma e empurre.', difficulty: 'Iniciante' },
      { name: 'Stiff', muscleGroup: 'Posterior', equipment: 'Barra ou Halteres', description: 'Em pé, desça o tronco mantendo as pernas semi-estendidas.', difficulty: 'Intermediário' },
      { name: 'Elevação Lateral', muscleGroup: 'Ombros', equipment: 'Halteres', description: 'Em pé, eleve os halteres lateralmente até a altura dos ombros.', difficulty: 'Iniciante' },
      { name: 'Abdominal Crunch', muscleGroup: 'Abdômen', equipment: 'Nenhum', description: 'Deitado, flexione o tronco elevando os ombros do chão.', difficulty: 'Iniciante' },
      { name: 'Prancha Frontal', muscleGroup: 'Core', equipment: 'Nenhum', description: 'Apoie-se nos antebraços e pontas dos pés, mantendo o corpo reto.', difficulty: 'Iniciante' },
      { name: 'Hip Thrust', muscleGroup: 'Glúteos', equipment: 'Barra e Banco', description: 'Apoie as costas no banco, barra sobre o quadril. Eleve o quadril contraindo os glúteos.', difficulty: 'Intermediário' },
      { name: 'Panturrilha em Pé', muscleGroup: 'Panturrilha', equipment: 'Máquina ou Step', description: 'Em pé na máquina ou step, eleve os calcanhares o máximo possível.', difficulty: 'Iniciante' },
      { name: 'Remada Curvada', muscleGroup: 'Costas', equipment: 'Barra', description: 'Incline o tronco, puxe a barra em direção ao abdômen.', difficulty: 'Intermediário' },
      { name: 'Crucifixo com Halteres', muscleGroup: 'Peito', equipment: 'Halteres e Banco', description: 'Deitado no banco, abra os braços com os halteres em arco.', difficulty: 'Intermediário' },
      { name: 'Burpee', muscleGroup: 'Corpo Inteiro', equipment: 'Nenhum', description: 'Agache, coloque as mãos no chão, estenda as pernas, faça flexão, volte e salte.', difficulty: 'Avançado' },
      { name: 'Cadeira Extensora', muscleGroup: 'Quadríceps', equipment: 'Máquina', description: 'Sentado na máquina, estenda os joelhos elevando o peso.', difficulty: 'Iniciante' },
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
      [exerciseIds['Supino Reto com Barra'], 4, '8-12', 90, '40kg', 0],
      [exerciseIds['Crucifixo com Halteres'], 3, '12-15', 60, '14kg', 1],
      [exerciseIds['Tríceps Pulley'], 3, '12-15', 60, '25kg', 2],
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
      [exerciseIds['Puxada Frontal'], 4, '8-12', 90, '50kg', 0],
      [exerciseIds['Remada Curvada'], 4, '8-12', 90, '40kg', 1],
      [exerciseIds['Rosca Direta'], 3, '10-12', 60, '12kg', 2],
      [exerciseIds['Prancha Frontal'], 3, '45s', 30, null, 3],
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
      [exerciseIds['Agachamento Livre'], 4, '8-10', 120, '60kg', 0],
      [exerciseIds['Leg Press 45°'], 4, '10-12', 90, '120kg', 1],
      [exerciseIds['Stiff'], 3, '10-12', 90, '30kg', 2],
      [exerciseIds['Hip Thrust'], 4, '12-15', 60, '50kg', 3],
      [exerciseIds['Panturrilha em Pé'], 4, '15-20', 45, '40kg', 4],
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
      [exerciseIds['Supino Reto com Barra'], 3, '10-12', 90, '30kg', 0],
      [exerciseIds['Puxada Frontal'], 3, '10-12', 90, '40kg', 1],
      [exerciseIds['Agachamento Livre'], 3, '10-12', 90, '40kg', 2],
      [exerciseIds['Desenvolvimento com Halteres'], 3, '10-12', 60, '10kg', 3],
      [exerciseIds['Prancha Frontal'], 3, '30s', 30, null, 4],
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
