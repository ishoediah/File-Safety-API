import {describe, it, expect} from 'vitest'
import {routeToHandler} from '../../src/core/router.js'

describe('routeToHandler', ()=>{
    it('Routes image to image handler', ()=>{
        expect(routeToHandler('image/png')).toBe('image')
    })
})