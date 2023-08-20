import { MINUTES_IN_HOUR } from '../consts';
import { TWorkoutCycling } from '../types/type-workout';
import { Workout } from './workout';

export class Cycling extends Workout implements TWorkoutCycling {
  public type: 'cycling' = 'cycling';
  public elevationGain: number;
  public speed: number = 0;

  constructor(
    coords: number[],
    distance: number,
    duration: number,
    elevationGain: number
  ) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;

    this.calcSpeed();
    this.setDescription(this.type);
  }

  private calcSpeed = () => {
    this.speed = this.distance / (this.duration / MINUTES_IN_HOUR);
    return this.speed;
  };
}
