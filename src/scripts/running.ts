import { TWorkoutRunning } from '../types/type-workout';
import { Workout } from './workout';

export class Running extends Workout implements TWorkoutRunning {
  public type: 'running' = 'running';
  public cadence: number;
  public pace: number = 0;

  constructor(
    coords: number[],
    distance: number,
    duration: number,
    cadence: number
  ) {
    super(coords, distance, duration);
    this.cadence = cadence;

    this._calcPace();
    this._setDescription(this.type);
  }

  _calcPace = () => {
    this.pace = this.duration / this.distance;
    return this.pace;
  };
}
