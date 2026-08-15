import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import { formulaInjectionTriggers } from '../config/constants.js'

function sanitizeCsv(buffer) {

    const findings = []
    let sanitized
    try {
    // first turn the buffer into text, then parse into rows of cells
    const text = buffer.toString('utf-8')
    const rows = parse(text, { //added a strictness relaxer to handel rows with varying number of columns and blank lines
       relax_column_count: true,
       skip_empty_lines: true
    })   // rows is an array of arrays: [ [cell, cell], [cell, cell] ]

    // go through every cell, neutralize dangerous ones, track findings
    for( let i = 0; i < rows.length; i++) { // loop through rows
        for(let j = 0; j< rows[i].length; j++){ // loop through columns
            for( let k = 0; k<formulaInjectionTriggers.length; k++){ // loop through injection triggers
                if( rows[i][j].startsWith(formulaInjectionTriggers[k])) { // look for a match in the first character of the cell
                    rows[i][j] = `'`+ rows[i][j] // add ' to comment that line
                    findings.push({
                        row: i,
                        column: j,
                        type: formulaInjectionTriggers[k],
                        category: 'formula_injection',
                        action: 'neutralised formula injection'
                    }) // push a findings report into the array
                    break
                }
            }
        }
    }
    sanitized = stringify(rows) // turn the rows back into a (cleaned) string
    } catch(err) {
        return { sanitized: null, findings, error: true }
    }

    return { sanitized, findings}
}

export { sanitizeCsv }