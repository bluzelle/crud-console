module.exports.parseLine = (line) =>
    line.trim()
        .replace(/'/g, '"')
        .split(/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
        .map(item => trimQuotes(item));

const trimQuotes = item => item
    .replace(/^\"/, '')
    .replace(/\"$/, '');
