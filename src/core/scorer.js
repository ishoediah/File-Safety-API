const severityMap = {
    xss: 'HIGH',
    formula_injection: 'MEDIUM', 
    external_resource: 'MEDIUM',
    metadata: 'LOW'
}

const severityOrder = ['CLEAN', 'LOW', 'MEDIUM','HIGH','CRITICAL'] //Critical is for files which cannot be sanitized, but for now it is not used

function scoreFindings(findings) {

    let highest = severityOrder[0]
    const found = findings.length

    for(let i = 0 ; i < findings.length; i++) {
        const category = findings[i].category
        const severity = severityMap[category]

        if(severityOrder.indexOf(severity) > severityOrder.indexOf(highest)) {
        highest = severity
        }
    }

    const score = {
        highest,
        found
    }

    return score;
}

export {scoreFindings}