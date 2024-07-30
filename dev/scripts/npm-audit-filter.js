'use strict';

const { execSync } = require('child_process');

const audit = () => {
  const vulnerabilityIdsToFilter = process.argv.slice(3).map(String);
  const [environment] = process.argv.slice(2);

  if (!environment || !['prod', 'dev'].includes(environment)) {
    throw new Error('Please specify appropriate environment: prod or dev');
  }

  if (!Array.isArray(vulnerabilityIdsToFilter)) {
    throw new Error('Vulnerability Ids to ignore must be an array');
  }

  try {
    const auditCommand = `npm audit --${environment} --json`;
    execSync(auditCommand);
    process.stdout.write('\x1b[92m--- No Vulnerabilities Found ---\x1b[39m');
  }
  catch (error) {
    const errorObject = JSON.parse(error.stdout.toString());
    const { advisories } = errorObject;
    const advisoryValues = Object.values(advisories);
    const vulnerabilities = advisoryValues.filter((advisoryValue) => !(vulnerabilityIdsToFilter.includes(advisoryValue.github_advisory_id) ||
      vulnerabilityIdsToFilter.includes(String(advisoryValue.id))));

    if (vulnerabilities.length === 0) {
      process.stdout.write('\x1b[92m--- No Vulnerabilities Found ---\x1b[39m');
      process.exit(0);
    }

    process.stdout.write('\x1b[91m--- Vulnerabilities Found ---\x1b[39m \n');
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(vulnerabilities, null, 2));
    process.exit(1);
  }
};

audit();
