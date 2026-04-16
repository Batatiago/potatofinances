const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/tests/integration/**/*.test.js", "**/tests/unit/**/*.test.js"],
};

module.exports = createJestConfig(customJestConfig);
