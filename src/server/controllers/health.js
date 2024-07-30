'use strict';

module.exports = class HealthController {
  constructor({ HealthService }) {
    this.HealthService = HealthService;
  }

  getLivenessCheck() {
    const { HealthService } = this;

    return HealthService.getLivenessCheck();
  }

  getReadinessCheck() {
    const { HealthService } = this;

    return HealthService.getReadinessCheck();
  }
};
