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
