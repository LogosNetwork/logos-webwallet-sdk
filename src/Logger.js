module.exports = () => {
  let api = {}
  let logs = []
  let warnings = []
  let errors = []
  let consoleLog = false

  api.getLogs = () => {
    return logs
  }

  api.getWarnings = () => {
    return warnings
  }

  api.getErrors = () => {
    return errors
  }

  api.log = (data) => {
    logs.push(data)
    if (consoleLog) console.log(data)
  }

  api.warn = (data) => {
    warnings.push(data)
    if (consoleLog) console.warn(data)
  }

  api.error = (data) => {
    errors.push(data)
    if (consoleLog) console.error(data)
  }
  return api
}
