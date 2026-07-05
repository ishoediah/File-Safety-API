import {describe, it, expect} from 'vitest'
import {routeToHandler} from '../../src/core/router.js'

describe('routeToHandler', ()=>{
    it('Routes jpeg to image handler', ()=>{
        expect(routeToHandler('image/jpeg')).toBe('image')
    })
    it('Routes png to image handler', ()=>{
        expect(routeToHandler('image/png')).toBe('image')
    })
    it('Routes webp to image handler', ()=>{
        expect(routeToHandler('image/webp')).toBe('image')
    })
    it('Routes gif to image handler', ()=>{
        expect(routeToHandler('image/gif')).toBe('image')
    })
    it('Routes csv to csv handler', ()=>{
        expect(routeToHandler('text/csv')).toBe('csv')
    })
    it('Routes svg+xml to svg handler', ()=>{
        expect(routeToHandler('image/svg+xml')).toBe('svg')
    })
    it('Returns null for unsupported types', ()=>{
        expect(routeToHandler('application/pdf')).toBe(null)
    })
    it('Returns null for null input', ()=>{
        expect(routeToHandler(null)).toBe(null)
    })

})