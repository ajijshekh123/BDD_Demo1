require('dotenv').config();

const parallel = Number.parseInt(process.env.PARALLEL ?? '1', 10);
const retries = Number.parseInt(process.env.RETRIES ?? '0', 10);

if (!/^\d+$/.test(process.env.PARALLEL ?? '1') || !Number.isInteger(parallel) || parallel < 1) {
  throw new Error('PARALLEL must be a positive integer.');
}
if (!/^\d+$/.test(process.env.RETRIES ?? '0') || !Number.isInteger(retries) || retries < 0) {
  throw new Error('RETRIES must be a non-negative integer.');
}

module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['src/support/**/*.ts', 'src/steps/**/*.ts'],
    paths: ['features/**/*.feature'],
    format: [
      'progress',
      'json:reports/cucumber-report.json',
      'allure-cucumberjs/reporter'
    ],
    parallel,
    retry: retries
  }
};
