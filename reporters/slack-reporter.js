class SlackReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onTestResult(contexts, results) {
    console.log('results: ', results);
  }
}

module.exports = SlackReporter;