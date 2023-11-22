import {ModelPluginInterface} from '../../interfaces';

import {ERRORS} from '../../util/errors';
import {buildErrorMessage} from '../../util/helpers';

import {ModelParams} from '../../types/common';

const {InputValidationError} = ERRORS;

export class SciMModel implements ModelPluginInterface {
  authParams: object | undefined = undefined;
  staticParams: object | undefined;
  name: string | undefined;
  errorBuilder = buildErrorMessage(SciMModel);

  authenticate(authParams: object): void {
    this.authParams = authParams;
  }

  async execute(inputs: ModelParams[]): Promise<ModelParams[]> {
    if (!Array.isArray(inputs)) {
      throw new InputValidationError(
        this.errorBuilder({
          message: 'Input data is missing',
        })
      );
    }

    const tunedinputs = inputs.map((input, index: number) => {
      // te or total-embodied-emissions: Total embodied emissions of some underlying hardware.
      // tir or time-reserved: The length of time the hardware is reserved for use by the software.
      // el or expected-lifespan: The anticipated time that the equipment will be installed.
      // rr or resources-reserved: The number of resources reserved for use by the software. (e.g. number of vCPUs you are using)
      // tor or total-resources: The total number of resources available (e.g. total number of vCPUs for underlying hardware)
      let te = 0.0;
      let tir = 0.0;
      let el = 0.0;
      let rr = 0.0;
      let tor = 0.0;
      if (!('total-embodied-emissions' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'total-embodied-emissions' is missing from input[${index}]. Please provide in 'gCO2e'`,
          })
        );
      }

      if (!('expected-lifespan' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'expected-lifespan' is missing from input[${index}]. Please provide in seconds`,
          })
        );
      }

      if (!('resources-reserved' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'resources-reserved' is missing from input[${index}]. Please provide as a 'count'`,
          })
        );
      }

      if (!('total-resources' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'total-resources' is missing from input[${index}]. Please provide as a 'count'`,
          })
        );
      }

      if (!('duration' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'duration' is missing from input[${index}]. Please provide in 'seconds'`,
          })
        );
      }

      if (!('expected-lifespan' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'expected-lifespan' is missing from input[${index}]. Please provide in 'seconds'`,
          })
        );
      }

      if (!('resources-reserved' in input) && !('vcpus-allocated' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'resources-reserved' is missing from input[${index}]. Please provide as a 'count'`,
          })
        );
      }

      if (!('total-resources' in input) && !('vcpus-total' in input)) {
        throw new InputValidationError(
          this.errorBuilder({
            message: `'total-resources' is missing from input[${index}]. Please provide as a 'count'`,
          })
        );
      }

      if (
        'total-embodied-emissions' in input &&
        'duration' in input &&
        'expected-lifespan' in input &&
        'duration' in input &&
        'expected-lifespan' in input &&
        ('resources-reserved' in input || 'vcpus-allocated') &&
        ('total-resources' in input || 'vcpus-total' in input)
      ) {
        if (typeof input['total-embodied-emissions'] === 'string') {
          te = parseFloat(input['total-embodied-emissions']);
        } else if (typeof input['total-embodied-emissions'] === 'number') {
          te = input['total-embodied-emissions'];
        } else {
          te = parseFloat(input['total-embodied-emissions']);
        }
        if (typeof input['duration'] === 'string') {
          tir = parseFloat(input['duration']);
        } else if (typeof input['duration'] === 'number') {
          tir = input['duration'];
        } else {
          tir = parseFloat(input['duration']);
        }
        if (typeof input['expected-lifespan'] === 'string') {
          el = parseFloat(input['expected-lifespan']);
        } else if (typeof input['expected-lifespan'] === 'number') {
          el = input['expected-lifespan'];
        } else {
          el = parseFloat(input['expected-lifespan']);
        }
        if (
          'vcpus-allocated' in input &&
          typeof input['vcpus-allocated'] === 'string'
        ) {
          rr = parseFloat(input['vcpus-allocated']);
        } else if (
          'vcpus-allocated' in input &&
          typeof input['vcpus-allocated'] === 'number'
        ) {
          rr = input['vcpus-allocated'];
        } else if (
          'resources-reserved' in input &&
          typeof input['resources-reserved'] === 'string'
        ) {
          rr = parseFloat(input['resources-reserved']);
        } else if (
          'resources-reserved' in input &&
          typeof input['resources-reserved'] === 'number'
        ) {
          rr = input['resources-reserved'];
        }

        if (
          'vcpus-total' in input &&
          typeof input['vcpus-total'] === 'string'
        ) {
          tor = parseFloat(input['vcpus-total']);
        } else if (
          'vcpus-total' in input &&
          typeof input['vcpus-total'] === 'number'
        ) {
          tor = input['vcpus-total'];
        } else if (
          'resources-reserved' in input &&
          typeof input['resources-reserved'] === 'string'
        ) {
          tor = parseFloat(input['resources-reserved']);
        } else if (
          'resources-reserved' in input &&
          typeof input['resources-reserved'] === 'number'
        ) {
          tor = input['resources-reserved'];
        }

        // M = TE * (TiR/EL) * (RR/ToR)
        input['embodied-carbon'] = te * (tir / el) * (rr / tor);
      }
      return input;
    });

    return tunedinputs;
  }

  async configure(
    staticParams: object | undefined
  ): Promise<ModelPluginInterface> {
    this.staticParams = staticParams;

    return this;
  }
}
