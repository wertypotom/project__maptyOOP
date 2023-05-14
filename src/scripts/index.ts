import { Cycling } from './cycling';
import { Running } from './running';
import './../style.css';
import 'leaflet/dist/leaflet.css';

import {
  Map,
  TileLayer,
  LeafletMouseEvent,
  Marker,
  Popup,
  Icon,
} from 'leaflet';
import { TWorkoutCycling, TWorkoutRunning } from '../types/type-workout';
import { MAP_ZOOM } from '../consts';

// https://dmitripavlutin.com/differences-between-arrow-and-regular-functions/
// в этой статье довольно понятно про this объясняют
// если в классе использовать function declaration, вместо arrow function то придется много КОЛЛБЭКОВ bind
// --- стрелочные функции с this указывают на this of function declaration
// --- стрелочные функции с this указывают на window в объекте
// --- стрелочные функции с this указывают на свой класс в классе

const form = document.querySelector('.form') as HTMLFormElement;
const containerWorkouts = document.querySelector(
  '.workouts'
) as HTMLUListElement;
const inputType = document.querySelector(
  '.form__input--type'
) as HTMLSelectElement;
const inputDistance = document.querySelector(
  '.form__input--distance'
) as HTMLInputElement;
const inputDuration = document.querySelector(
  '.form__input--duration'
) as HTMLInputElement;
const inputCadence = document.querySelector(
  '.form__input--cadence'
) as HTMLInputElement;
const inputElevation = document.querySelector(
  '.form__input--elevation'
) as HTMLInputElement;

class App {
  private map: null | Map = null;
  private mapEvent: null | LeafletMouseEvent = null;
  private mapZoom: number = MAP_ZOOM;
  #workouts: (Running | Cycling)[] = [];
  #workout: null | Running | Cycling = null;

  constructor() {
    navigator.geolocation.getCurrentPosition(this._getPosition, () => {
      alert('Could not get position');
    });

    form?.addEventListener('submit', this._submitForm);
    inputType?.addEventListener('change', this._toggleFormFields);
    containerWorkouts?.addEventListener('click', this._moveToMarker);

    this._getWorkoutsFromLS();
  }

  _getPosition = (pos: GeolocationPosition) => {
    const { latitude, longitude } = pos.coords;
    const coords = [latitude, longitude];

    this._loadMap(coords);
  };

  _loadMap = (coords: number[]) => {
    this.map = new Map('map', {
      center: {
        lat: coords[0],
        lng: coords[1],
      },
      zoom: this.mapZoom,
    });

    new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.mapZoom,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.map.on('click', this._onMapClick);

    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
      this._createMarkerOnMap(workout);
    });
  };

  _onMapClick = (event: LeafletMouseEvent) => {
    this.mapEvent = event;
    this._toggleFormShow();
  };

  _toggleFormShow = () => {
    form?.classList.toggle('hidden');
    (inputDistance as HTMLInputElement)?.focus();
  };

  _submitForm = (event: SubmitEvent) => {
    event.preventDefault();

    if (!this.mapEvent) return;

    const { lat, lng } = this.mapEvent.latlng;
    const coord = [lat, lng];

    const { type, cadence, distance, duration, elevation } =
      this._getInputValues();

    if (type === 'running') {
      if (!this.validateInputs(cadence, distance, duration)) {
        alert('Inputs must be positive numbers');
        return;
      }

      this.#workout = new Running(coord, distance, duration, cadence);
      this.#workouts.push(this.#workout);
    }

    if (type === 'cycling') {
      if (
        !this.validateInputs(distance, duration) ||
        !this.validateInputNumbers(elevation)
      ) {
        alert('Inputs must be positive numbers');
        return;
      }

      this.#workout = new Cycling(coord, distance, duration, elevation);
      this.#workouts.push(this.#workout);
    }

    this._renderWorkout(this.#workout);
    this._createMarkerOnMap(this.#workout);
    this._clearInputFields();
    this._toggleFormShow();
    this._saveWorkoutToLS();
  };

  _saveWorkoutToLS = () => {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  };

  _getWorkoutsFromLS = () => {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '');

    if (workouts) {
      this.#workouts = workouts.map(
        (workout: TWorkoutRunning | TWorkoutCycling) => {
          if (workout.type === 'running') {
            return new Running(
              workout.coords,
              workout.distance,
              workout.duration,
              workout.cadence
            );
          }

          if (workout.type === 'cycling') {
            return new Cycling(
              workout.coords,
              workout.distance,
              workout.duration,
              workout.elevationGain
            );
          }
        }
      );
    }
  };

  _renderWorkout = (workout: Running | Cycling | null) => {
    if (!workout) return;

    let workoutTypeHTML;

    if (workout instanceof Running)
      workoutTypeHTML = `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace?.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    `;

    if (workout instanceof Cycling)
      workoutTypeHTML = `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed?.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    `;

    const workoutHTML = `
      <li class="workout workout--${workout.type}" id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">🏃‍♂️</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
        ${workoutTypeHTML}
      </li>`;

    form.insertAdjacentHTML('afterend', workoutHTML);
  };

  validateInputs = (...inputs: number[]) => {
    return (
      this.validateInputNumbers(...inputs) &&
      this.validateInputPositiveNumbers(...inputs)
    );
  };

  _getInputValues = () => {
    const type = inputType.value;
    const cadence = +inputCadence.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const elevation = +inputElevation.value;

    return { cadence, distance, duration, elevation, type };
  };

  validateInputNumbers = (...inputs: number[]) => {
    return inputs.every(input => Number.isFinite(input));
  };

  validateInputPositiveNumbers = (...inputs: number[]) => {
    return inputs.every(input => input > 0);
  };

  _createMarkerOnMap = (workout: Running | Cycling | null) => {
    if (!workout || !this.map) return;

    const markerCoords: [number, number] = [
      workout.coords[0],
      workout.coords[1],
    ];

    const icon = new Icon({
      iconUrl: './../assets/icon.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });

    new Marker(markerCoords)
      .setIcon(icon)
      .addTo(this.map)
      .bindPopup(
        new Popup({
          minWidth: 150,
          maxWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  };

  _clearInputFields = () => {
    inputCadence.value = '';
    inputDistance.value = '';
    inputDuration.value = '';
    inputElevation.value = '';
  };

  _toggleFormFields = () => {
    if (!inputCadence || !inputElevation) return;

    const inputCadenceRow = inputCadence.closest('.form__row');
    const inputElevationRow = inputElevation.closest('.form__row');

    if (!inputCadenceRow || !inputElevationRow) return;

    inputCadenceRow.classList.toggle('form__row--hidden');
    inputElevationRow.classList.toggle('form__row--hidden');
  };

  _moveToMarker = (e: MouseEvent) => {
    if (!this.map) return;

    const workoutEl = (e.target as HTMLElement).closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(w => w.id === +workoutEl.id);

    if (!workout) return;

    const workoutCoords: [number, number] = [
      workout.coords[0],
      workout.coords[1],
    ];

    this.map.flyTo(workoutCoords, this.mapZoom, {
      animate: true,
      duration: 1,
    });
  };
}

const app = new App();
