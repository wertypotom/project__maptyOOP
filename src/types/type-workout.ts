export interface TWorkout {
  id: number;
  date: Date;
  description: string;
  coords: number[];
  distance: number;
  duration: number;
}

export interface TWorkoutRunning extends TWorkout {
  type: 'running';
  cadence: number;
}

export interface TWorkoutCycling extends TWorkout {
  type: 'cycling';
  elevationGain: number;
}

export interface WorkoutParams {
  distance: number;
  duration: number;
  coords: [number, number];
}

export interface RunningParams extends WorkoutParams {
  cadence: number;
}

export interface CyclingParams extends WorkoutParams {
  elevation: number;
}
