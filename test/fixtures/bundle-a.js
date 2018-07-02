'use strict'

import { aSmallConst } from './import-a'
import {
  anotherSmallConst,
  smallNestedConstA,
  largeNestedConstB
} from './import-b'

console.log(
  aSmallConst.length,
  anotherSmallConst.length,
  smallNestedConstA.length,
  largeNestedConstB.length
)
