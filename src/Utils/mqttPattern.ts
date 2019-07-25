const SEPARATOR = '/'
const SINGLE = '+'
const ALL = '#'

const matches = (pattern: string, topic: string): boolean => {
    const patternSegments = pattern.split(SEPARATOR)
    const topicSegments = topic.split(SEPARATOR)

    const patternLength = patternSegments.length
    const topicLength = topicSegments.length
    const lastIndex = patternLength - 1

    for (let i = 0; i < patternLength; i++) {
        const currentPattern = patternSegments[i]
        const patternChar = currentPattern[0]
        const currentTopic = topicSegments[i]

        if (!currentTopic && !currentPattern) { continue }

        if (!currentTopic && currentPattern !== ALL) return false

        // Only allow # at end
        if (patternChar === ALL) { return i === lastIndex }
        if (patternChar !== SINGLE && currentPattern !== currentTopic) { return false }
    }

    return patternLength === topicLength
}
interface Pattern {
    [currentPattern: string]: string|string[];
}
const extract = (pattern: string, topic: string): Pattern => {
    const params = {}
    const patternSegments = pattern.split(SEPARATOR)
    const topicSegments = topic.split(SEPARATOR)

    const patternLength = patternSegments.length

    for (let i = 0; i < patternLength; i++) {
        const currentPattern = patternSegments[i]
        const patternChar = currentPattern[0]

        if (currentPattern.length === 1) { continue }

        if (patternChar === ALL) {
            params[currentPattern.slice(1)] = topicSegments.slice(i)
            break
        } else if (patternChar === SINGLE) {
            params[currentPattern.slice(1)] = topicSegments[i]
        }
    }

    return params
}

export default (pattern: string, topic: string): Pattern => {
    return matches(pattern, topic) ? extract(pattern, topic) : null
}
