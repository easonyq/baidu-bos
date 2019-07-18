/**
 * @file 配置相关的方法
 * @author wangyisheng@baidu.com (wangyisheng)
 */

import {resolve} from 'path'
import {exec} from 'child_process'
import fs from 'fs-extra'
import log from './log'
import {getHome} from './index'

const CONFIG_FILE_NAME = '.config.txt'

export function getConfig (key) {
  let configFilePath = resolve(getHome(), CONFIG_FILE_NAME)
  fs.ensureFileSync(configFilePath)

  let configFileContent = fs.readFileSync(configFilePath, 'utf-8')
  let config
  /* istanbul ignore next */
  try {
    config = configFileContent.length === 0 ? {} : JSON.parse(configFileContent)
  } catch (e) {
    log.warn('读取配置文件失败，请重新配置');
    fs.unlink(configFilePath)
    config = {}
  }

  if (key) {
    return config[key]
  }

  return config
}

export function setConfig (key, value) {
  let configFilePath = resolve(getHome(), CONFIG_FILE_NAME)
  let config = getConfig()
  config[key] = value

  fs.writeFileSync(configFilePath, JSON.stringify(config))
}

export function removeConfig (key) {
  let configFilePath = resolve(getHome(), CONFIG_FILE_NAME)
  fs.ensureFileSync(configFilePath)

  /* istanbul ignore if */
  if (!key) {
    fs.writeFileSync(configFilePath, '{}')
    return
  }

  let config = getConfig()
  delete config[key]

  fs.writeFileSync(configFilePath, JSON.stringify(config))
}

export /* istanbul ignore next */ function importConfig (from) {
  if (from === 'edp') {
    exec('edp config', (err, stdout) => {
      if (err) {
        log.error('无法从 edp config 获取配置，请手动设置')
        return
      }

      let edpConfig
      try {
        edpConfig = JSON.parse(stdout)
      } catch (e) {
        log.error('从 edp config 读取配置出错，请手动设置')
        return
      }

      ['bos.ak', 'bos.sk', 'bos.endpoint'].forEach(key => {
        if (edpConfig[key]) {
          setConfig(key, edpConfig[key])
          log.info(`读取${key}成功，已经写入设置`)
        }
      })
    })
  }
}
