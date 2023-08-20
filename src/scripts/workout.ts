import { TWorkout } from '../types/type-workout';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export class Workout implements TWorkout {
  public id: number = Math.random();
  public date: Date = new Date();
  public description: string = '';
  public coords: number[];
  public distance: number;
  public duration: number;

  constructor(coords: number[], distance: number, duration: number) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // km
    this.duration = duration; // min
  }

  protected setDescription = (type: string) => {
    this.description = `${type[0].toUpperCase() + type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  };
}
