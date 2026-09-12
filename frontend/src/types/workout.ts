export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};


export type Exercise = {
  exercise: string;
  movement_pattern: string;
  sets: number;
  reps: string;
  rest_seconds: number;
};


export type WorkoutDay = {
  day_name: string;
  exercises: Exercise[];
};


export type WorkoutResponse = {
  message: string;
  program_id: number;
  user_id: number;
  program_name: string;

  recommendation: {
    split_name: string;
    reason: string;
  };

  workouts: WorkoutDay[];
};


export type SavedExercise = {
  id: number;
  exercise_name: string;
  movement_pattern: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  exercise_order: number;
};


export type SavedWorkoutDay = {
  id: number;
  day_number: number;
  day_name: string;
  exercises: SavedExercise[];
};


export type SavedProgram = {
  id: number;
  program_name: string;
  goal: string;
  experience_level: string;
  days_per_week: number;
  equipment: string;
  created_at: string;
  workout_days: SavedWorkoutDay[];
};


export type SavedProgramsResponse = {
  user_id: number;
  programs: SavedProgram[];
};