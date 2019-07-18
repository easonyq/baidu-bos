/**
 * @file Test case for utils/checkUpdate.js
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import test from 'ava'
import {getConfig, setConfig, removeConfig} from '../../../src/utils/config'

const KEY = 'baidu-bos.test.key'
test('it should setConfig & getConfig correctly', t => {
  let valueBeforeSet = getConfig(KEY)
  t.is(valueBeforeSet, undefined)
  let value2BeforeSet = getConfig()
  t.is(value2BeforeSet[KEY], undefined)

  let testValue = 'Hello???'
  setConfig(KEY, testValue)

  let valueAfterSet = getConfig(KEY)
  t.is(valueAfterSet, testValue)
  let value2AfterSet = getConfig()
  t.is(value2AfterSet[KEY], testValue)
})

test('it should removeConfig correctly', t => {
  removeConfig(KEY)

  let valueAfterRemove = getConfig(KEY)
  t.is(valueAfterRemove, undefined)
})
